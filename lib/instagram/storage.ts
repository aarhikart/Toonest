import { Campaign, CampaignStats, InstagramUser, MessageTemplate } from './types';

export const DEFAULT_MESSAGE = `Free Movie:-🌐    https://moviemela-rose.vercel.app`;

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl_default',
    name: 'Movie Promotion',
    content: DEFAULT_MESSAGE,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tmpl_collab',
    name: 'Collaboration Outreach',
    content: `Hey! Loved your content. Would love to collaborate on an upcoming project. Let me know if you're interested!`,
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tmpl_offer',
    name: 'VIP Community Invite',
    content: `Hello! We are inviting select film enthusiasts to join our VIP preview club: https://moviemela-rose.vercel.app`,
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

const CAMPAIGN_STORAGE_KEY = 'toolnest_instagram_dm_campaign_v1';
const TEMPLATES_STORAGE_KEY = 'toolnest_instagram_dm_templates_v1';

export function saveCampaign(campaign: Campaign): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaign));
  } catch (err) {
    console.error('Failed to save campaign to localStorage:', err);
  }
}

export function loadCampaign(): Campaign | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Campaign;
  } catch (err) {
    console.error('Failed to load campaign from localStorage:', err);
    return null;
  }
}

export function clearCampaign(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear campaign from localStorage:', err);
  }
}

export function loadTemplates(): MessageTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch (err) {
    console.error('Failed to load templates from localStorage:', err);
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: MessageTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save templates to localStorage:', err);
  }
}

export function calculateStats(users: InstagramUser[]): CampaignStats {
  const total = users.length;
  let sent = 0;
  let pending = 0;
  let skipped = 0;
  let invalid = 0;

  for (const u of users) {
    if (u.status === 'sent') sent++;
    else if (u.status === 'skipped') skipped++;
    else if (u.status === 'invalid' || u.status === 'failed') invalid++;
    else pending++;
  }

  const completed = sent + skipped + invalid;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    sent,
    pending,
    skipped,
    invalid,
    percentage,
  };
}
