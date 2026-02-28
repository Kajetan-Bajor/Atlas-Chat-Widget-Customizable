export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  CARD = 'card', // For the specific Status Page/App buttons shown in image
}

export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatAction {
  label: string;
  url?: string;
  actionId?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  type: MessageType;
  timestamp: string;
  actions?: ChatAction[]; // For buttons like "Status Page"
}

export interface WidgetConfig {
  webhookUrl: string;
  brandName: string;
  brandSubtitle: string;
  logoUrl: string;
  primaryColor: string; // The "Onyx" color
  poweredBy: string;
  welcomeMessage?: Message[];
}