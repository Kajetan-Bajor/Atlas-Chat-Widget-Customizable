
import React from 'react';
import { CONFIG } from '../constants';
import { Message, MessageType, Sender } from '../types';
import { ExternalLinkIcon } from './Icons';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  // Helper to render text with clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        let cleanUrl = part;
        let suffix = '';
        const trailingChars = ['.', ',', '!', '?', ')', ']', ';', ':'];
        
        while (cleanUrl.length > 0 && trailingChars.includes(cleanUrl[cleanUrl.length - 1])) {
             suffix = cleanUrl[cleanUrl.length - 1] + suffix;
             cleanUrl = cleanUrl.slice(0, -1);
        }

        return (
          <React.Fragment key={index}>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-words underline ${isUser ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'}`}
            >
              {cleanUrl}
            </a>
            {suffix}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex flex-col items-center justify-center my-6 space-y-3 animate-fade-in-up">
        <p className="text-gray-500 text-sm text-center max-w-[80%] leading-relaxed">
          {message.text}
        </p>
        <div className="flex items-center space-x-3 w-full justify-center">
            <div className="h-[1px] bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium">{message.timestamp}</span>
            <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>
      </div>
    );
  }

  // Specific "Card" style for the Status Page buttons
  if (message.type === MessageType.CARD) {
    return (
      <div className="flex justify-start mb-4 animate-fade-in-up">
        <div className="bg-white rounded-3xl p-4 shadow-soft max-w-[85%] border border-gray-100">
           {/* Card Content if any text exists */}
           {message.text !== 'Quick Actions' && <p className="mb-3 text-gray-800 text-sm whitespace-pre-line text-pretty">{renderTextWithLinks(message.text)}</p>}
           
           <div className="space-y-2">
             {message.actions?.map((action, idx) => (
               <a 
                 key={idx} 
                 href={action.url || '#'} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-between w-full bg-gray-200/50 hover:bg-gray-200 transition-colors text-onyx font-semibold py-3 px-4 rounded-xl text-sm group"
               >
                 <span>{action.label}</span>
                 <ExternalLinkIcon className="w-4 h-4 text-gray-500 group-hover:text-onyx transition-colors" />
               </a>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up group`}>
      <div
        className={`
          relative max-w-[85%] sm:max-w-[80%] w-fit px-4 py-3 sm:px-5 sm:py-3.5 text-[15px] sm:text-sm leading-relaxed break-words shadow-sm
          ${isUser 
            ? 'bg-gradient-to-t from-[#0E1013] to-[#2A2A32] text-white rounded-3xl rounded-br-none' 
            : 'bg-white text-gray-800 rounded-3xl rounded-bl-none border border-gray-100'}
        `}
      >
        <p className="whitespace-pre-line text-pretty">{renderTextWithLinks(message.text)}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
