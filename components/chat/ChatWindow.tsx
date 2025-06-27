
import React, { useRef, useEffect } from 'react';
import { ChatMessage, GroundingChunk, GroundingChunkWeb } from '../../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => void; // Updated: only messageText
  isSending: boolean;
  agentName?: string;
  isLoadingAgent: boolean; // For initial loading of agent details
  groundingChunks?: GroundingChunk[];
}

interface ProcessedWebSource {
  uri: string; // uri is confirmed to be a string after filtering
  title?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage, 
  isSending, 
  agentName,
  isLoadingAgent,
  groundingChunks
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderGroundingSources = () => {
    if (!groundingChunks || groundingChunks.length === 0) return null;
    
    const webSources: ProcessedWebSource[] = (groundingChunks || [])
      .map(chunk => chunk.web)
      // Ensure web is an object, web.uri is a non-empty string
      .filter((web): web is { uri: string; title?: string } => 
        typeof web === 'object' && web !== null && typeof web.uri === 'string' && web.uri.trim() !== ''
      )
      // Deduplicate based on uri
      .reduce((acc, current) => {
        if (!acc.find(item => item.uri === current.uri)) {
          acc.push(current);
        }
        return acc;
      }, [] as ProcessedWebSource[]);

    if (webSources.length === 0) return null;

    return (
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <p className="font-semibold mb-1">Fontes (Google Search):</p>
        <ul className="list-disc list-inside space-y-1">
          {webSources.map((source, index) => (
            <li key={index}>
              <a 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brazil-blue hover:underline"
                title={source.title || source.uri} // Use uri as fallback for title attribute
              >
                {source.title || source.uri} {/* Display title or uri */}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-brazil-blue text-white p-4 text-center sticky top-0 z-10">
        <h1 className="text-xl font-semibold">{agentName || 'Chat Agent'}</h1>
        {/* isLoadingAgent here refers to the initial loading of agent config, not message sending state */}
        {isLoadingAgent && <p className="text-xs text-yellow-300">Carregando agente...</p>}
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>
      
      {renderGroundingSources()}

      {/* ChatInput's onSendMessage prop now correctly matches its new signature */}
      <ChatInput onSendMessage={onSendMessage} isSending={isSending} />
    </div>
  );
};

export default ChatWindow;
