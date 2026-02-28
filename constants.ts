

import { WidgetConfig, MessageType, Sender } from './types';

/**
 * ==============================================================================
 * KONFIGURACJA WIDGETU (WIDGET CONFIGURATION)
 * Tutaj możesz edytować ustawienia swojego chatbota.
 * ==============================================================================
 */

export const CONFIG: WidgetConfig = {
  // 1. WKLEJ SWÓJ WEBHOOK Z N8N TUTAJ:
  webhookUrl: 'https://n8n.srv1248886.hstgr.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat', 

  // 2. Branding i Teksty
  brandName: 'Asystent AI',
  brandSubtitle: 'Jestem dostępny',
  // URL to the White Icon (for use on Dark backgrounds)
  logoUrl: 'https://static.wixstatic.com/shapes/de1bc2_835a4a0ca8ec492f8c43e18886b48074.svg',
  
  // 3. Kolorystyka (Czarny/Onyx)
  primaryColor: '#111111', 
  
  // 4. Stopka (Tekst techniczny) - Obecnie zastąpiona logiem Zyne w ChatWidget.tsx
  poweredBy: 'AI może popełniać błędy | Technologia',

  // 5. Wiadomości startowe
  welcomeMessage: [
    {
      id: 'welcome-1',
      sender: Sender.BOT,
      type: MessageType.TEXT,
      text: "Cześć, jestem Atlas - Asystent AI, jak mogę ci dzisiaj pomóc?",
      timestamp: 'Teraz',
    }
  ]
};
