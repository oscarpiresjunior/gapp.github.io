import React from 'react';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null | undefined;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {

    const getStatusIndicator = (conv: Conversation) => {
        if (conv.aiStatus === 'paused') return '⏸️ Humano';
        return '🗣️ IA Ativa';
    }

    const getLastMessageSnippet = (conv: Conversation): string => {
        if (conv.messages.length === 0) return 'Nenhuma mensagem ainda.';
        const lastMsg = conv.messages[conv.messages.length - 1];
        if (lastMsg.sender === 'system') return `(${lastMsg.text})`;
        let prefix = '';
        if (lastMsg.sender === 'user') {
            prefix = 'Lead: ';
        } else if (lastMsg.sender === 'agent' && lastMsg.sentBy === 'human') {
            prefix = 'Você: ';
        } else {
            prefix = 'IA: ';
        }
        return prefix + (lastMsg.text.length > 35 ? lastMsg.text.substring(0, 35) + '...' : lastMsg.text);
    }
  
  if (conversations.length === 0) {
    return (
        <div className="p-4 text-center text-gray-500">
            <p>Nenhuma conversa encontrada.</p>
        </div>
    );
  }

  return (
    <div className="h-full">
      <ul className="divide-y divide-gray-200">
        {conversations.map(conv => (
          <li
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${
              selectedConversationId === conv.id ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-brazil-blue truncate">{conv.leadIdentifier}</h4>
              <span className="text-xs text-gray-500">
                {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate" title={getLastMessageSnippet(conv)}>
              {getLastMessageSnippet(conv)}
            </p>
            <div className="flex items-center justify-between mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                    {getStatusIndicator(conv)}
                </span>
                {!conv.isReadByOwner && (
                    <span className="w-3 h-3 bg-brazil-green rounded-full" title="Não lida"></span>
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
