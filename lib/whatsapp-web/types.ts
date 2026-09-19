export type ConnectionStatus = 'DISCONNECTED' | 'PAIRING' | 'CONNECTED';
export type ConnectionMethod = 'QR' | 'PAIRING_CODE';

export interface WhatsAppWebSession {
  connected: boolean;
  phoneNumber?: string;
  connectedAt?: string;
  method: ConnectionMethod;
  deviceId?: string;
  profileName?: string;
  workerOnline?: boolean;
}

export type ContactSendStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';

export interface WebContact {
  id: string;
  name: string;
  phoneNumber: string; // E.164 formatted or digits
  status: ContactSendStatus;
  sentAt?: string;
  error?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  content: string;
}

export interface CampaignSenderState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  delaySeconds: number;
  logs: Array<{
    id: string;
    timestamp: string;
    contactName: string;
    phoneNumber: string;
    status: ContactSendStatus;
    message: string;
  }>;
}
