
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ClientAgent, ChatMessage, GroundingMetadata, GroundingChunk, ChatMessageAttachment } from '../types';
import { getClientAgentByIdentifier } from '../services/clientAgentService';
import { streamChatResponse } from '../services/geminiService';
import * as conversationService from '../services/conversationService';
import ChatWindow from '../components/chat/ChatWindow';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SHOW_FILE_REGEX = /\[SHOW_FILE:([^\]]+)\]/g;

const ChatInterfacePage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [agent, setAgent] = useState<ClientAgent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const pollingIntervalRef = useRef<number | null>(null);


  const setupConversation = useCallback(async (agentData: ClientAgent) => {
    const sessionConvId = sessionStorage.getItem(`gapp_conv_id_${agentData.id}`);
    if (sessionConvId) {
      const conv = await conversationService.getConversationById(sessionConvId);
      if (conv) {
        setConversationId(conv.id);
        setMessages(conv.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})));
        return;
      }
    }
    
    // Create a new conversation if none exists for this session
    const newConv = await conversationService.createConversation(agentData.id, agentData.ownerEmail || 'unknown');
    setConversationId(newConv.id);
    setMessages(newConv.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})));
    sessionStorage.setItem(`gapp_conv_id_${agentData.id}`, newConv.id);

  }, []);

  const fetchAgentDetails = useCallback(async () => {
    if (!identifier) {
      setError('Identificador do agente não fornecido.');
      setIsLoadingAgent(false);
      return;
    }
    setIsLoadingAgent(true);
    setError(null);
    try {
      const fetchedAgent = await getClientAgentByIdentifier(identifier);
      if (fetchedAgent) {
        if (fetchedAgent.status === 'inactive') {
          setError('Este serviço está temporariamente indisponível. Por favor, entre em contato com o administrador.');
          setAgent(null);
        } else {
          setAgent(fetchedAgent);
          await setupConversation(fetchedAgent);
        }
      } else {
        setError('Agente de chat não encontrado ou não configurado.');
      }
    } catch (err) {
      console.error("Error fetching agent details:", err);
      setError('Falha ao carregar informações do agente de chat.');
    } finally {
      setIsLoadingAgent(false);
    }
  }, [identifier, setupConversation]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  // Polling for human responses
  useEffect(() => {
    const poll = async () => {
      if (!conversationId || document.hidden) return;
      const conv = await conversationService.getConversationById(conversationId);
      if (conv && conv.messages.length > messages.length) {
        setMessages(conv.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})));
      }
    };

    if (conversationId) {
      pollingIntervalRef.current = window.setInterval(poll, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversationId, messages.length]);


  const handleSendMessage = async (text: string) => {
    if (!agent || !conversationId || !text.trim()) return;

    setIsSendingMessage(true);
    setCurrentGroundingChunks(undefined);

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add message to local state and persistent storage
    const updatedMessages = await conversationService.addMessageToConversation(conversationId, userMessage);
    setMessages(updatedMessages.map(m => ({...m, timestamp: new Date(m.timestamp)})));

    // Check if AI is paused before trying to get a response
    const currentConversation = await conversationService.getConversationById(conversationId);
    if (currentConversation?.aiStatus === 'paused') {
      setIsSendingMessage(false);
      // Optional: Add a system message indicating the agent is busy
      // For now, we just wait for the human to reply.
      return;
    }

    const agentMessageId = String(Date.now() + 1);
    const agentPlaceholder: ChatMessage = { id: agentMessageId, text: '', sender: 'agent', timestamp: new Date(), sentBy: 'ai' };
    
    setMessages(prev => [...prev, agentPlaceholder]);

    let fullAgentResponseText = "";
    
    try {
      const historyForGemini = [...updatedMessages]; 

      await streamChatResponse(
        agent.master_prompt,
        agent.geminiApiKey,
        text,
        historyForGemini,
        (chunkText, isFinal, groundingMetadata) => {
          fullAgentResponseText += chunkText;
          
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === agentMessageId) {
                const displayText = fullAgentResponseText.replace(SHOW_FILE_REGEX, "").trim();
                return { ...msg, text: displayText };
              }
              return msg;
            })
          );

          if (groundingMetadata?.groundingChunks) {
            setCurrentGroundingChunks(groundingMetadata.groundingChunks);
          }

          if (isFinal) {
            setIsSendingMessage(false);
            
            const fileMatches = [...fullAgentResponseText.matchAll(SHOW_FILE_REGEX)];
            let finalAgentMessageText = fullAgentResponseText.replace(SHOW_FILE_REGEX, "").trim();
            let finalAgentAttachment: ChatMessageAttachment | undefined = undefined;

            if (fileMatches.length > 0 && agent.attachments) {
              const fileNameToShow = fileMatches[0][1]; 
              const agentFile = agent.attachments.find(att => att.name === fileNameToShow);

              if (agentFile) {
                finalAgentAttachment = { data: agentFile.data, mimeType: agentFile.mimeType, type: agentFile.type, name: agentFile.name };
              }
            }
            
            const finalAgentMessage: ChatMessage = {
              id: agentMessageId,
              text: finalAgentMessageText,
              sender: 'agent',
              timestamp: new Date(),
              attachment: finalAgentAttachment,
              isAIRenderedAttachment: !!finalAgentAttachment,
              sentBy: 'ai',
            };
            
            // Persist the final AI message
            conversationService.addMessageToConversation(conversationId, finalAgentMessage, true);

            setMessages(prev => prev.map(m => m.id === agentMessageId ? finalAgentMessage : m));
          }
        },
        (err) => {
          console.error("Gemini API Error:", err);
          const errorMsg: ChatMessage = { id: agentMessageId, sender: 'agent', text: "Desculpe, ocorreu um erro ao processar sua solicitação.", timestamp: new Date(), sentBy: 'ai' };
          conversationService.addMessageToConversation(conversationId, errorMsg, true);
          setMessages(prev => prev.map(m => m.id === agentMessageId ? errorMsg : m));
          setError("Erro na comunicação com o assistente.");
          setIsSendingMessage(false);
        }
      );
    } catch (apiError) {
       console.error("Failed to send message via streamChatResponse:", apiError);
       setIsSendingMessage(false);
       const failMsg: ChatMessage = { id: agentMessageId, sender: 'agent', text: "Falha ao enviar mensagem. Tente novamente.", timestamp: new Date(), sentBy: 'ai' };
       conversationService.addMessageToConversation(conversationId, failMsg, true);
       setMessages(prev => prev.map(m => m.id === agentMessageId ? failMsg : m));
    }
  };

  if (!identifier) {
    return <Navigate to="/" replace />; 
  }

  if (isLoadingAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <LoadingSpinner size="w-16 h-16" />
        <p className="mt-4 text-lg text-gray-700">Carregando agente de chat...</p>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Indisponível</h2>
          <p className="text-gray-700">{error}</p>
          <Link to="/" className="mt-6 inline-block bg-brazil-blue text-white py-2 px-4 rounded hover:bg-blue-700">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }
  
  if (!agent) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
         <p className="text-gray-700">Agente de chat não disponível ou não encontrado.</p>
          <Link to="/" className="mt-6 inline-block bg-brazil-blue text-white py-2 px-4 rounded hover:bg-blue-700">
            Voltar para Início
          </Link>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-brazil-blue to-brazil-green p-2 sm:p-4">
      <div className="w-full max-w-2xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-h-[800px] md:max-h-[700px]">
         <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSendingMessage}
            agentName={agent?.name}
            isLoadingAgent={isLoadingAgent}
            groundingChunks={currentGroundingChunks}
          />
      </div>
    </div>
  );
};

export default ChatInterfacePage;
