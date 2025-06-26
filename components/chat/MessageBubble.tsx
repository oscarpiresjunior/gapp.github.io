import React from 'react';
import { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  // const isAgent = message.sender === 'agent'; // No longer needed for specific styling here
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">{message.text}</span>
      </div>
    );
  }

  const attachment = message.attachment;

  return (
    <div className={`flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow break-words ${
          isUser
            ? 'bg-brazil-green text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
        }`}
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
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {/* Optional: Display timestamp */}
        {/* <p className={`text-xs mt-1 ${isUser ? 'text-green-200' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p> */}
      </div>
    </div>
  );
};

export default MessageBubble;