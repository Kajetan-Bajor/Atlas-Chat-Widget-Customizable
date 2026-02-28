import { CONFIG } from '../constants';
import { Sender } from '../types';

// Helper to find the best text candidate in an unknown JSON structure
const findResponseText = (data: any): string | null => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  
  // Handle Array: n8n often returns [{ output: "..." }]
  if (Array.isArray(data)) {
    return data.length > 0 ? findResponseText(data[0]) : null;
  }

  if (typeof data === 'object') {
    // 1. Check Standard Keys (High Confidence)
    const priorityKeys = ['output', 'text', 'message', 'answer', 'response', 'reply', 'content', 'result'];
    for (const key of priorityKeys) {
      if (data[key] && typeof data[key] === 'string') return data[key];
    }
    
    // 2. Check nested 'data' or 'json' properties often found in n8n structures
    if (data.data) return findResponseText(data.data);
    if (data.json) return findResponseText(data.json);
    
    // 3. Fallback: If object has only one key and it's a string, use it.
    const keys = Object.keys(data);
    if (keys.length === 1 && typeof data[keys[0]] === 'string') {
        return data[keys[0]];
    }
    
    // 4. Deep search (Recursive)
    for (const key of Object.keys(data)) {
        if (typeof data[key] === 'object') {
            const found = findResponseText(data[key]);
            if (found) return found;
        }
    }
  }

  return null;
};

export const sendMessageToWebhook = async (message: string, history: any[] = []): Promise<string> => {
  try {
    if (!CONFIG.webhookUrl || CONFIG.webhookUrl.includes('your-webhook-url')) {
      return new Promise(resolve => setTimeout(() => resolve("Konfiguracja URL webhooka jest niepoprawna."), 1000));
    }

    const sessionId = localStorage.getItem('chat_session_id') || `sess_${Math.random().toString(36).substr(2, 9)}`;
    
    // FIX FOR "Error in workflow":
    // Do NOT send the history array. n8n AI Agents use server-side memory (Window Buffer Memory) keyed by sessionId.
    // Sending a complex 'history' JSON often breaks the webhook parsing or confuses the agent node.
    const payload = {
        message,        
        chatInput: message, // Primary key for n8n AI Agent
        input: message,     
        question: message,
        sessionId: sessionId 
    };

    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown');
        console.error('n8n Server Error:', response.status, errorText);
        throw new Error(`Błąd serwera n8n (${response.status})`);
    }

    const data = await response.json();
    console.log('n8n Raw Response:', data);

    let reply = findResponseText(data);

    // FIX: Catch the specific n8n error message if it leaks into the 200 OK response
    if (reply === 'Error in workflow') {
        console.error('n8n returned "Error in workflow". Check n8n execution logs.');
        return "Przepraszam, wystąpił błąd po stronie serwera (n8n workflow error). Spróbuj ponownie później.";
    }

    return reply || "Otrzymano odpowiedź z serwera, ale nie znaleziono tekstu. Sprawdź węzeł wyjściowy w n8n.";

  } catch (error: any) {
    console.error("Error sending message to n8n:", error);
    return "Przepraszamy, wystąpił problem z połączeniem.";
  }
};