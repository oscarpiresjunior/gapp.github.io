import React from 'react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  viewContext?: 'public' | 'crm'; // To differentiate display logic
}

const linkifyText = (text: string, isUser: boolean): React.ReactNode[] => {
    // Regex to find URLs (http, https, ftp, file) and www domains.
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const matches = [...text.matchAll(urlRegex)];

    if (matches.length === 0) {
        return [text]; // Return text as is if no links
    }
    
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
        const url = match[0];
        const startIndex = match.index!;

        // Add text before the link
        if (startIndex > lastIndex) {
            result.push(text.substring(lastIndex, startIndex));
        }

        const href = url.startsWith('www.') ? `http://${url}` : url;
        const linkClassName = isUser 
            ? 'text-yellow-300 hover:underline font-semibold' // Style for user links
            : 'text-blue-600 hover:underline font-semibold'; // Style for agent links

        // Add the link
        result.push(
            <a key={`link-${i}`} href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                {url}
            </a>
        );

        lastIndex = startIndex + url.length;
    });

    // Add any remaining text after the last link
    if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
    }

    return result;
}


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, viewContext = 'public' }) => {
  const isUser = message.sender === 'user';
  const isAgent = message.sender === 'agent';
  const isSystem = message.sender === 'system';
  
  // In CRM view, human-sent messages are aligned to the right like user messages
  const isHumanAgentInCrm = viewContext === 'crm' && isAgent && message.sentBy === 'human';

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">{message.text}</span>
      </div>
    );
  }

  const attachment = message.attachment;

  const bubbleAlignment = isUser || isHumanAgentInCrm ? 'justify-end' : 'justify-start';
  
  let bubbleStyles = '';
  if (isUser) {
    bubbleStyles = 'bg-brazil-green text-white rounded-br-none';
  } else if (isHumanAgentInCrm) {
    bubbleStyles = 'bg-blue-500 text-white rounded-br-none'; // Different color for human agent
  } else { // AI agent
    bubbleStyles = 'bg-white text-gray-800 rounded-bl-none border border-gray-200';
  }

  return (
    <div className={`flex my-2 ${bubbleAlignment}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow break-words ${bubbleStyles}`}
      >
        {attachment && (
          <div className="mb-2">
            {attachment.type === 'image' && (
              <img 
                src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                alt={attachment.name || 'Imagem anexada'}
                className="rounded-lg max-w-full h-auto max-h-60 object-contain" 
              />
            )}
            {attachment.type === 'video' && (
              <video 
                controls 
                src={`data:${attachment.mimeType};base64,${attachment.data}`}
                className="rounded-lg max-w-full h-auto max-h-60"
                aria-label={attachment.name || 'Vídeo anexado'}
              >
                Seu navegador não suporta a tag de vídeo. ({attachment.name || 'vídeo'})
              </video>
            )}
          </div>
        )}
        {message.text && <p className="whitespace-pre-wrap">{linkifyText(message.text, isUser || isHumanAgentInCrm)}</p>}
        {isHumanAgentInCrm && (
            <p className="text-xs text-blue-200 mt-1 text-right">Enviado por Você</p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
