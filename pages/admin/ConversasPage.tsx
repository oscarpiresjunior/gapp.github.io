import React, { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../../types';
import * as conversationService from '../../services/conversationService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConversationList from '../../components/admin/ConversationList';
import ConversationView from '../../components/admin/ConversationView';

const ConversasPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const convos = await conversationService.getConversationsForUser(user);
      setConversations(convos);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar as conversas.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch and polling
  useEffect(() => {
    setIsLoading(true);
    fetchConversations();
    
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchConversations]);
  
  // When conversations update, check if the selected one needs updating
  useEffect(() => {
    if (selectedConversation) {
        const updatedSelected = conversations.find(c => c.id === selectedConversation.id);
        if (updatedSelected) {
            // Avoid re-render if messages are identical
            if (JSON.stringify(updatedSelected.messages) !== JSON.stringify(selectedConversation.messages)) {
                 setSelectedConversation(updatedSelected);
            }
        } else {
            setSelectedConversation(null); // It was deleted or is no longer available
        }
    }
  }, [conversations, selectedConversation]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark as read when selected
    if (!conversation.isReadByOwner) {
        const updatedConv = await conversationService.markAsRead(conversation.id);
        if (updatedConv) {
            setConversations(prev => prev.map(c => c.id === conversation.id ? updatedConv : c));
        }
    }
  };
  
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Caixa de Entrada</h2>
        <p className="text-gray-600 mt-1">Visualize e gerencie as conversas dos seus agentes.</p>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      <div className="flex-grow flex border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Left Pane: Conversation List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Right Pane: Conversation View */}
        <div className="w-2/3 flex flex-col">
           {selectedConversation ? (
            <ConversationView
                key={selectedConversation.id} // Re-mount when conversation changes
                conversation={selectedConversation}
                onUpdate={(updatedConv) => {
                    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
                    setSelectedConversation(updatedConv);
                }}
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-4 text-xl font-semibold text-gray-600">Selecione uma conversa</h3>
              <p className="mt-1 text-gray-500">Escolha uma conversa da lista para ver o histórico e interagir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversasPage;