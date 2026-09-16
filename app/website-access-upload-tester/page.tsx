'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Info,
  Server,
  Layers,
  Upload,
  FileCheck,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { WebsiteTesterRoot } from '@/components/website-tester/WebsiteTesterRoot';

export default function WebsiteAccessUploadTesterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Website Access & Upload Tester"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="website-access-upload-tester"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Developer & QA Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">Website Access & Upload Tester</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#5722AF]/15 via-[#7B45D1]/10 to-[#9B6BE8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production Network & Upload Diagnostic Suite</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Website Access & Upload Compatibility Tester
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Diagnose whether a website is accessible and determine why file uploads succeed or fail in your current network or browser environment. Pinpoint network blocks, corporate security filters (such as Sophos or Zscaler), HTTP errors, CORS restrictions, and file upload boundary limitations without bypassing administrative policies.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Strictly Compliant & SSRF-Protected</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span>Dual Client & Server Probe</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>Synthetic & Real Upload Verification</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Interactive Tool Workspace */}
        <WebsiteTesterRoot />

        {/* Compliance & Policy Statement Notice */}
        <section aria-label="Security & Compliance" className="p-5 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-white">
              Enterprise Compliance & Anti-Bypass Architecture
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This diagnostic tool operates in strict accordance with network security standards. It does not provide web unblockers, VPN tunnels, CORS proxies, or DNS obfuscation designed to bypass workplace firewalls, Sophos Web Control, or institutional content-security policies. Instead, it precisely identifies the blocking layer and provides legitimate administrative resolution steps.
            </p>
          </div>
        </section>

        {/* Technical Educational & Troubleshooting Guide */}
        <section aria-label="Diagnostic Reference Guide" className="rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-8">
          {/* 1. How the Diagnostic Works */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              How Website Access & Upload Diagnostics Work
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Determining whether a website is accessible is a multi-stage process. A website might appear down when it is simply blocked by a corporate firewall, or an upload might fail not because the server is broken, but because an intermediary proxy strips multipart payloads over 10 MB.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-[11px] font-bold">1</span>
                  Client-Side Direct Probe
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your browser tests direct TCP/TLS connectivity to the target URL. If your local ISP, router, or local proxy drops the connection, this layer detects it immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-[11px] font-bold">2</span>
                  Assisted Header Inspection
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Queries public DNS and inspects HTTP status codes, X-Frame-Options, and Content-Security-Policy headers while screening for perimeter gateway block patterns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-[11px] font-bold">3</span>
                  Upload Boundary Simulation
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Generates synthetic binary payloads or tests client files against designated endpoints to measure transfer speed, HTTP 413 limits, and CORS header compliance.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Common Reasons Why Uploads Fail */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              The 6 Most Frequent Causes of Upload Failures in Production
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>1. Security Gateway File Type Inspection</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Corporate inspection appliances (Sophos, Palo Alto, Fortinet) perform Deep Packet Inspection (DPI) on outgoing HTTP multipart requests. If an executable, archive, or unregistered MIME type is detected in the stream, the gateway resets the connection (ECONNRESET) mid-upload.
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded-lg">
                  Fix: Verify if corporate policy permits the file format; request endpoint whitelisting from network administrator.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-500" />
                  <span>2. Web Server Payload Limits (HTTP 413)</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Nginx defaults to <code className="font-mono">client_max_body_size 1M</code>. Node.js/Express body-parsers frequently cap json and multipart at 100 KB or 10 MB. When a user exceeds this threshold, the server aborts the connection with HTTP 413 Payload Too Large.
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded-lg">
                  Fix: Adjust nginx.conf (client_max_body_size 50M) and backend middleware body-parser limit settings.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  <span>3. Missing Cross-Origin Headers (CORS)</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  If the frontend website resides on <code className="font-mono">app.domain.com</code> and uploads to <code className="font-mono">api.domain.com</code> or an S3 bucket, the browser issues an OPTIONS preflight request. If <code className="font-mono">Access-Control-Allow-Origin</code> is absent, the browser cancels the upload before byte transfer starts.
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded-lg">
                  Fix: Add Access-Control-Allow-Origin, Access-Control-Allow-Methods (POST, PUT), and Access-Control-Allow-Headers on server.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>4. Proxy and Ingress Gateway Timeouts (HTTP 504)</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Large file uploads over modest network connections take minutes. If Cloudflare, AWS ALB, or an intermediary proxy has a 60-second read timeout, the connection is closed before the full file payload finishes uploading.
                </p>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded-lg">
                  Fix: Increase proxy_read_timeout in Nginx or implement chunked / pre-signed direct-to-S3 multi-part uploads.
                </div>
              </div>
            </div>
          </div>

          {/* 3. Enterprise Networking & Architecture Guide */}
          <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Enterprise Networking & Web Architecture Guide
            </h2>

            {/* A. Forward vs Reverse Proxies */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-xs font-bold">1</span>
                <span>Forward vs. Reverse Proxies</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Proxies act as intermediaries that relay network traffic between clients (such as browsers) and destination servers. Their primary distinction lies in which party they represent and protect.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Forward Proxy (Client-Side Intermediary)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Sits within a private network in front of client workstations. It acts on behalf of the <strong>client</strong>, managing and inspecting outbound requests destined for the public internet.
                  </p>
                  <ul className="list-disc list-inside text-zinc-500 dark:text-zinc-400 space-y-1 pl-1 text-[11px]">
                    <li><strong>Compliance & Policy:</strong> Blocks access to restricted or malicious web categories.</li>
                    <li><strong>Bandwidth Caching:</strong> Caches common downloads to save network bandwidth.</li>
                    <li><strong>Centralized Logging:</strong> Audits outbound employee traffic for security logs.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Reverse Proxy (Server-Side Intermediary)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Sits in front of backend origin servers. It acts on behalf of the <strong>server</strong>, receiving incoming client requests and routing them to appropriate internal application nodes.
                  </p>
                  <ul className="list-disc list-inside text-zinc-500 dark:text-zinc-400 space-y-1 pl-1 text-[11px]">
                    <li><strong>Load Balancing:</strong> Distributes traffic evenly (Nginx, HAProxy, AWS ALB).</li>
                    <li><strong>SSL/TLS Termination:</strong> Offloads cryptographic handshakes from application code.</li>
                    <li><strong>Web Application Firewall (WAF):</strong> Filters out SQLi, XSS, and DDoS threats.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* B. The HTTP/HTTPS Request Life Cycle */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-xs font-bold">2</span>
                <span>The Complete HTTP/HTTPS Request Lifecycle</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When a user enters a URL into an address bar and presses Enter, five foundational network stages take place before the page renders:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>1. DNS Lookup</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Browser, OS cache, and recursive resolvers translate the hostname into an IP address (e.g. 93.184.216.34).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>2. TCP Handshake</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    A reliable 3-way handshake (SYN &rarr; SYN-ACK &rarr; ACK) establishes a TCP socket over port 80 or 443.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-500" />
                    <span>3. TLS Handshake</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Client sends SNI header; server returns CA certificate; ECDHE generates symmetric session encryption keys.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>4. HTTP Transfer</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Browser transmits encrypted HTTP request (GET/POST headers & payload); server responds with status code and body.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-500" />
                    <span>5. Persistence</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Keep-Alive, HTTP/2 multiplexing, or HTTP/3 QUIC streams preserve socket connections for subsequent requests.
                  </p>
                </div>
              </div>
            </div>

            {/* C. Network Gateway Administration */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center text-xs font-bold">3</span>
                <span>Network Gateway Administration & Policy Enforcement</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                In managed corporate networks, enterprise security policies are applied directly at perimeter gateway devices:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white">Default Gateway & Routing</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    All outbound packets outside the local subnet (e.g., 192.168.1.0/24) are routed through the designated default gateway IP, allowing appliances to inspect all external traffic.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white">DNS & SNI Filtering</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Next-Gen Firewalls (Sophos, Fortinet, Palo Alto) inspect DNS lookups and plaintext SNI headers to categorize and block restricted domains before session establishment.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white">Enterprise Allowlisting</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    When business tools are restricted by automated category rules, administrators create explicit allowlist exceptions or reclassify the domain in the central policy database.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="py-3.5 space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                  Why does the preview say &quot;Embedding Restricted&quot; even though the website is accessible?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Major websites (such as Google, GitHub, and enterprise portals) send security headers like <code className="font-mono">X-Frame-Options: DENY</code> or <code className="font-mono">frame-ancestors &apos;none&apos;</code> to protect users against clickjacking attacks. This prevents other sites from displaying them inside an iframe. The website itself is 100% accessible directly via standard browser navigation.
                </p>
              </div>

              <div className="py-3.5 space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                  Can this tool bypass our corporate Sophos firewall or school web filter?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  No. By design and compliance rules, this tool does not create proxy bypasses, VPN tunnels, or relays. Instead, it accurately identifies the firewall signature, extracts the policy block category, and provides the necessary diagnostic telemetry for you to file a legitimate whitelist request with your IT department.
                </p>
              </div>

              <div className="py-3.5 space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                  How does SSRF protection safeguard local networks?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Our assisted diagnostic endpoint enforces asynchronous DNS validation prior to initiating any HTTP connection. It strictly blocks loopback addresses (<code className="font-mono">127.0.0.1</code>, <code className="font-mono">::1</code>), private intranets (<code className="font-mono">10.0.0.0/8</code>, <code className="font-mono">192.168.0.0/16</code>, <code className="font-mono">172.16.0.0/12</code>), link-local addresses, and cloud metadata endpoints (<code className="font-mono">169.254.169.254</code>). Only public internet hostnames are permitted.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
