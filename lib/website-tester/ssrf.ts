import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed is unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local, including Cloud Metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 – 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a loopback, private, or link-local range.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback and unspecified
  if (normalized === '::1' || normalized === '::') return true;

  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (normalized.startsWith('::ffff:')) {
    const ipv4 = normalized.replace('::ffff:', '');
    return isPrivateIPv4(ipv4);
  }

  // Unique Local Addresses (fc00::/7 -> fc00 to fdff)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-local unicast (fe80::/10)
  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  // Multicast (ff00::/8)
  if (normalized.startsWith('ff')) return true;

  return false;
}

export interface SSRFValidationResult {
  isValid: boolean;
  error?: string;
  resolvedIp?: string;
  normalizedUrl?: string;
}

/**
 * Validates a target URL against SSRF attacks before any server-side diagnostic request.
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  const trimmed = rawUrl.trim();
  let parsedUrl: URL;

  try {
    // Normalization check
    const withProtocol = trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`;
    parsedUrl = new URL(withProtocol);
  } catch (err: any) {
    return { isValid: false, error: 'Invalid URL format.' };
  }

  // 1. Protocol validation (HTTP/HTTPS only)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Protocol '${parsedUrl.protocol}' is not allowed. Only HTTP and HTTPS are permitted.`
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // 2. Reject suspicious hostnames explicitly
  const blockedHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'metadata.google.internal',
    'instance-data',
    '169.254.169.254'
  ];

  if (blockedHosts.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      isValid: false,
      error: 'Access to localhost, internal domain names, and metadata services is strictly blocked.'
    };
  }

  // 3. Check port
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'https:' ? 443 : 80);
  const allowedPorts = [80, 443, 8080, 8443, 3000, 5000, 8000];
  if (!allowedPorts.includes(port)) {
    return {
      isValid: false,
      error: `Port ${port} is not in the list of standard allowed web testing ports.`
    };
  }

  // 4. DNS Resolution & IP checking (prevents DNS rebinding and internal IP access)
  try {
    const lookupResult = await dnsLookup(hostname, { all: true });

    if (!lookupResult || lookupResult.length === 0) {
      return {
        isValid: false,
        error: `DNS resolution failed for hostname '${hostname}'. Host does not exist.`
      };
    }

    // Inspect all resolved IP addresses
    for (const record of lookupResult) {
      const ip = record.address;
      if (record.family === 4) {
        if (isPrivateIPv4(ip)) {
          return {
            isValid: false,
            error: `Resolved IP (${ip}) is in a private, loopback, or cloud-metadata network range.`
          };
        }
      } else if (record.family === 6) {
        if (isPrivateIPv6(ip)) {
          return {
            isValid: false,
            error: `Resolved IPv6 (${ip}) is in a private or loopback range.`
          };
        }
      }
    }

    return {
      isValid: true,
      resolvedIp: lookupResult[0].address,
      normalizedUrl: parsedUrl.toString()
    };
  } catch (dnsErr: any) {
    return {
      isValid: false,
      error: `DNS lookup failed: ${dnsErr.code || dnsErr.message || 'Unable to resolve domain'}`
    };
  }
}
