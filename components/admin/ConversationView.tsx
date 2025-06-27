
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage } from '../../types';
import * as conversationService from '../../services/conversationService';
import MessageBubble from '../chat/MessageBubble';
import ChatInput from '../chat/ChatInput';

interface ConversationViewProps {
  conversation: Conversation;
  onUpdate: (conversation: Conversation) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onUpdate }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleStatusToggle = async () => {
    setIsUpdatingStatus(true);
    const newStatus = conversation.aiStatus === 'active' ? 'paused' : 'active';
    const updatedConv = await conversationService.updateConversationStatus(conversation.id, newStatus);
    if (updatedConv) {
      onUpdate(updatedConv);
    }
    setIsUpdatingStatus(false);
  };
  
  const handleSendMessage = async (text: string) => {
      if (!text.trim()) return;
      setIsSending(true);
      const humanMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          text,
          sender: 'agent', // Appears as agent to the lead
          sentBy: 'human', // But is marked as human-sent
          timestamp: new Date(),
      };
      
      await conversationService.addMessageToConversation(conversation.id, humanMessage);
      const updatedConv = await conversationService.getConversationById(conversation.id);
      if(updatedConv){
        onUpdate(updatedConv);
      }
      setIsSending(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-between items-start bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{conversation.leadIdentifier}</h3>
          
          {/* --- NEW: Display Lead Info --- */}
          {(conversation.leadName || conversation.leadEmail) && (
             <div className="mt-1 border-t pt-2">
                {conversation.leadName && <p className="text-sm text-gray-700"><strong>Nome:</strong> {conversation.leadName}</p>}
                {conversation.leadEmail && <p className="text-sm text-gray-700"><strong>Email:</strong> {conversation.leadEmail}</p>}
             </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">ID da Conversa: {conversation.id}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${conversation.aiStatus === 'active' ? 'text-green-600' : 'text-blue-600'}`}>
                    {conversation.aiStatus === 'active' ? 'Atendimento por IA' : 'Atendimento Humano'}
                </span>
                <button
                    role="switch"
                    aria-checked={conversation.aiStatus === 'active'}
                    onClick={handleStatusToggle}
                    disabled={isUpdatingStatus}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brazil-blue disabled:opacity-50 ${
                    conversation.aiStatus === 'active' ? 'bg-brazil-green' : 'bg-blue-500'
                    }`}
                    aria-label={conversation.aiStatus === 'active' ? 'Pausar IA e assumir' : 'Retomar atendimento por IA'}
                >
                    <span
                    aria-hidden="true"
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        conversation.aiStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    />
                </button>
            </div>
        </div>
      </div>
      
      {/* Message Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-2 bg-gray-100">
        {conversation.messages.map((msg, index) => (
          <MessageBubble key={`${msg.id}-${index}`} message={{...msg, timestamp: new Date(msg.timestamp)}} viewContext="crm" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
       {conversation.aiStatus === 'paused' && (
         <div className="flex-shrink-0">
             <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
         </div>
       )}
    </div>
  );
};

export default ConversationView;
