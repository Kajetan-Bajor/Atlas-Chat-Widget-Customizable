
import React, { useState, useRef, useEffect } from 'react';
import { CONFIG } from '../constants';
import { Message, MessageType, Sender } from '../types';
import { sendMessageToWebhook } from '../services/n8nService';
import ChatBubble from './ChatBubble';
import { SendIcon, XIcon, HistoryIcon, TrashIcon, ArrowLeftIcon, PlusIcon } from './Icons';

interface ChatSession {
    id: string;
    messages: Message[];
    timestamp: number;
    preview: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  // State for multiple sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [view, setView] = useState<'chat' | 'history'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Sessions from LocalStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('atlas_chat_sessions');
    if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        // If sessions exist, pick the most recent one or create new if none
        if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
        } else {
            createNewSession();
        }
    } else {
        // Fallback for migration from single-session version
        const legacyMsgs = localStorage.getItem('atlas_chat_messages');
        if (legacyMsgs) {
            const msgs = JSON.parse(legacyMsgs);
            const newSession: ChatSession = {
                id: localStorage.getItem('chat_session_id') || Date.now().toString(),
                messages: msgs,
                timestamp: Date.now(),
                preview: msgs[msgs.length - 1]?.text || 'Rozmowa'
            };
            setSessions([newSession]);
            setCurrentSessionId(newSession.id);
            localStorage.removeItem('atlas_chat_messages'); // Clean up legacy
        } else {
            createNewSession();
        }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('atlas_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Helper to get current messages
  const getCurrentMessages = () => {
    const session = sessions.find(s => s.id === currentSessionId);
    return session ? session.messages : [];
  };

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
        id: newId,
        messages: CONFIG.welcomeMessage || [],
        timestamp: Date.now(),
        preview: CONFIG.welcomeMessage?.[0]?.text || 'Nowa rozmowa'
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setView('chat');
    setHasStarted(false); // Reset start button for new chat
    localStorage.setItem('chat_session_id', newId);
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
            return {
                ...s,
                messages: newMessages,
                timestamp: Date.now(),
                preview: newMessages[newMessages.length - 1]?.text || s.preview
            };
        }
        return s;
    }));
  };

  const deleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== idToDelete);
    setSessions(newSessions);
    
    // If we deleted the active session, switch to another or create new
    if (currentSessionId === idToDelete) {
        if (newSessions.length > 0) {
            setCurrentSessionId(newSessions[0].id);
        } else {
            // Don't create immediately to avoid loop, just set empty? 
            // Better to create a clean state
            createNewSession(); 
        }
    }
    // Update LocalStorage immediately
    localStorage.setItem('atlas_chat_sessions', JSON.stringify(newSessions));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && view === 'chat') {
        setTimeout(scrollToBottom, 100); 
    }
  }, [sessions, isOpen, hasStarted, view, currentSessionId]);

  useEffect(() => {
    if (hasStarted && isOpen && view === 'chat') {
        setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [hasStarted, isOpen, view]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSessionId) return;

    const currentMsgs = getCurrentMessages();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: Sender.USER,
      type: MessageType.TEXT,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMsgs = [...currentMsgs, userMsg];
    updateCurrentSession(updatedMsgs);
    setInputValue('');
    setIsTyping(true);

    const responseText = await sendMessageToWebhook(userMsg.text, updatedMsgs);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: Sender.BOT,
      type: MessageType.TEXT,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    updateCurrentSession([...updatedMsgs, botMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Header Logic
  const Header = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 sm:rounded-t-[32px] sticky top-0 z-20">
      {/* Left Side: Back Arrow (History Mode) OR Brand Info (Chat Mode) */}
      <div className="flex items-center space-x-3">
        {view === 'history' ? (
             <button onClick={() => setView('chat')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeftIcon className="w-6 h-6 text-onyx" />
             </button>
        ) : (
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-t from-[#0E1013] to-[#2A2A32] flex items-center justify-center">
                    <img src={CONFIG.logoUrl} alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
        )}
        
        <div className="flex flex-col justify-center min-h-[40px]">
            <span className={`text-gray-900 leading-tight ${view === 'chat' ? 'font-semibold text-lg sm:text-base' : 'font-bold text-base sm:text-sm'}`}>
                {view === 'history' ? 'Historia' : CONFIG.brandName}
            </span>
            {view === 'history' && (
                <span className="text-xs text-gray-500 leading-tight">
                    Twoje rozmowy
                </span>
            )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-1">
        {/* History Toggle */}
        {view === 'chat' && (
            <button 
                onClick={() => setView('history')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-onyx"
                aria-label="History"
            >
                <HistoryIcon className="w-5 h-5" />
            </button>
        )}
        
        {/* New Chat (Visible in History) */}
        {view === 'history' && (
             <button 
                onClick={createNewSession}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-onyx"
                aria-label="New Chat"
             >
                <PlusIcon className="w-6 h-6" />
             </button>
        )}

        {/* Close Button */}
        <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-onyx"
            aria-label="Close chat"
        >
            <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
            fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-t from-[#0E1013] to-[#2A2A32] text-white shadow-lg flex items-center justify-center border border-white/20
            hover:scale-105 hover:bg-onyx-light z-50 group
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isOpen ? 'opacity-0 scale-0 pointer-events-none rotate-90' : 'opacity-100 scale-100 pointer-events-auto rotate-0'}
        `}
      >
        <img src={CONFIG.logoUrl} alt="Chat" className="w-8 h-8 object-contain brightness-0 invert" />
      </button>

      {/* Main Window */}
      <div 
        className={`
            fixed left-0 right-0 bottom-0 top-[20px] sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[370px]
            sm:h-[calc(100vh-2rem)] sm:max-h-[700px]
            bg-gray-50 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden z-50 flex flex-col font-sans border border-gray-100 
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right
            ${isOpen 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible' 
                : 'opacity-0 scale-95 translate-y-12 sm:translate-y-10 pointer-events-none invisible'}
        `}
      >
        <Header />

        {/* Content Area */}
        {view === 'history' ? (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 no-scrollbar">
                {sessions.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">Brak historii rozmów.</div>
                )}
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => { setCurrentSessionId(session.id); setView('chat'); setHasStarted(true); }}
                            className={`
                                group relative p-4 rounded-2xl cursor-pointer border transition-all duration-200
                                ${session.id === currentSessionId ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-100/50 border-transparent hover:bg-white hover:shadow-sm'}
                            `}
                        >
                            <div className="pr-10">
                                <p className="font-semibold text-gray-800 text-sm mb-1">
                                    {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <p className="text-xs text-gray-500 truncate line-clamp-1">{session.preview}</p>
                            </div>

                            {/* Delete Button (Hover) - Styled exactly as requested */}
                            <button
                                onClick={(e) => deleteSession(e, session.id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-100 p-2 rounded-lg hover:scale-105"
                                title="Usuń czat"
                            >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            /* Chat View */
            <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50">
                <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
                     <div className="flex-1 flex flex-col">
                        {getCurrentMessages().map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                        {isTyping && (
                            <div className="flex w-full mb-4 justify-start animate-fade-in-up">
                                <div className="bg-white rounded-3xl rounded-bl-none border border-gray-100 px-4 py-3 shadow-sm">
                                    <div className="flex space-x-0.5">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Spacer to prevent text hidden behind disclaimer */}
                        {hasStarted && showDisclaimer && <div className="h-16 flex-shrink-0 w-full"></div>}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Disclaimer */}
                {hasStarted && showDisclaimer && (
                    <div className="absolute bottom-2 left-3 right-3 sm:left-4 sm:right-4 z-10 animate-fade-in-up">
                        <div className="bg-white p-[10px] rounded-3xl shadow-lg border border-gray-100 relative">
                             <div className="pr-5 text-[10px] text-gray-500 leading-snug text-center">
                                Korzystając z czatu, akceptujesz przetwarzanie i monitorowanie przebiegu rozmowy oraz Twoich danych przez nas i naszych partnerów, zgodnie z <a href="https://www.zyne.chat/documents/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 font-medium">Polityką Prywatności</a>
                             </div>
                             <button 
                                onClick={() => setShowDisclaimer(false)}
                                className="absolute right-1 top-1 p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                             >
                                <XIcon className="w-3 h-3" />
                             </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Footer (Only in Chat Mode) */}
        {view === 'chat' && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 z-30 relative">
            {!hasStarted ? (
                <button
                onClick={() => setHasStarted(true)}
                className="w-full bg-gradient-to-t from-[#0E1013] to-[#2A2A32] hover:bg-onyx-light text-white font-medium py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center text-base sm:text-sm"
                >
                Porozmawiajmy
                </button>
            ) : (
                <div className="relative flex items-center bg-white rounded-full shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400 transition-all">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Napisz wiadomość..."
                    className="w-full py-3.5 pl-4 pr-12 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base sm:text-sm rounded-full"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className={`absolute right-3 p-2 rounded-full transition-colors ${
                    inputValue.trim() ? 'text-onyx hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                    }`}
                >
                    <SendIcon className="w-6 h-6" />
                </button>
                </div>
            )}
            
            <div className="mt-3 flex justify-center">
                <a 
                    href="https://www.zyne.chat" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-50 hover:opacity-80 transition-opacity duration-300"
                >
                    <img 
                        src="https://static.wixstatic.com/shapes/d25ad0_9984db4a72dd458790e546ab1b714ebd.svg" 
                        alt="Zyne.chat" 
                        className="h-4 w-auto"
                    />
                </a>
            </div>
            </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
