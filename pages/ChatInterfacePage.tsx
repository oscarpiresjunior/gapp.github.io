import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ClientAgent, ChatMessage, GroundingMetadata, GroundingChunk, ChatMessageAttachment, ClientAgentAttachment } from '../types';
import { getClientAgentByIdentifier } from '../services/clientAgentService';
import { streamChatResponse, resetChatSession } from '../services/geminiService';
import ChatWindow from '../components/chat/ChatWindow'; // ChatWindow itself doesn't need changes for this logic
import LoadingSpinner from '../components/common/LoadingSpinner';

// Regex to find [SHOW_FILE:filename.ext]
const SHOW_FILE_REGEX = /\[SHOW_FILE:([^\]]+)\]/g;

const ChatInterfacePage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [agent, setAgent] = useState<ClientAgent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGroundingChunks, setCurrentGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);

  useEffect(() => {
    if (identifier) {
      // Reset chat session specifically for this agent.
      // The API key is passed during the call, so no need to pass it to resetChatSession.
      resetChatSession(identifier); 
      setMessages([]); 
      setCurrentGroundingChunks(undefined);
    }
  }, [identifier]);

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
          setError(`O agente "${fetchedAgent.name}" está temporariamente indisponível.`);
          setAgent(null);
        } else {
          setAgent(fetchedAgent);
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
  }, [identifier]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  const handleSendMessage = async (text: string) => { // Removed file parameter
    if (!agent || !identifier || !text.trim()) return;

    setIsSendingMessage(true);
    setCurrentGroundingChunks(undefined);

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      text,
      sender: 'user',
      timestamp: new Date(),
      // No user attachment handling here anymore
    };
    setMessages(prev => [...prev, userMessage]);
    
    const agentMessageId = String(Date.now() + 1);
    // Add a placeholder for the agent's response
    setMessages(prev => [...prev, { id: agentMessageId, text: '', sender: 'agent', timestamp: new Date() }]);
    
    let fullAgentResponseText = "";
    let accumulatedTextForDisplay = ""; // Text cleaned of [SHOW_FILE] directives

    try {
      const historyForGemini = [...messages, userMessage]; // Pass history *including* current user message

      await streamChatResponse(
        identifier,
        agent.master_prompt,
        agent.geminiApiKey, // Pass agent-specific API key
        text, // User's text message
        historyForGemini,
        (chunkText, isFinal, groundingMetadata) => {
          fullAgentResponseText += chunkText;
          accumulatedTextForDisplay += chunkText;
          
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === agentMessageId) {
                // Clean the text for display (remove SHOW_FILE directives)
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
            
            // Process [SHOW_FILE:] directives from the complete response
            const fileMatches = [...fullAgentResponseText.matchAll(SHOW_FILE_REGEX)];
            let finalAgentMessageText = fullAgentResponseText.replace(SHOW_FILE_REGEX, "").trim();
            let finalAgentAttachment: ChatMessageAttachment | undefined = undefined;

            if (fileMatches.length > 0 && agent.attachments) {
              // For simplicity, use the first matched file. A more complex UI might handle multiple.
              const fileNameToShow = fileMatches[0][1]; 
              const agentFile = agent.attachments.find(att => att.name === fileNameToShow);

              if (agentFile) {
                finalAgentAttachment = {
                  data: agentFile.data,
                  mimeType: agentFile.mimeType,
                  type: agentFile.type,
                  name: agentFile.name,
                };
                 // Add a system message or modify agent message to show the file
                 // For now, let's update the agent's message to include the attachment
              } else {
                 // Optionally, add a note if file mentioned by AI is not found
                 console.warn(`AI tried to show file '${fileNameToShow}', but it was not found in agent attachments.`);
                 finalAgentMessageText += `\n(Nota: Tentei mostrar o arquivo '${fileNameToShow}', mas não o encontrei.)`;
              }
            }
            
            const finalAgentMessage: ChatMessage = {
              id: agentMessageId,
              text: finalAgentMessageText,
              sender: 'agent',
              timestamp: new Date(),
              attachment: finalAgentAttachment,
              isAIRenderedAttachment: !!finalAgentAttachment,
            };

            setMessages(prev => {
                const msgs = [...prev];
                const agentMsgIndex = msgs.findIndex(m => m.id === agentMessageId);
                if (agentMsgIndex > -1) {
                    msgs[agentMsgIndex] = finalAgentMessage;
                } else { // Should not happen if placeholder was added
                    msgs.push(finalAgentMessage);
                }
                return msgs;
            });
          }
        },
        (err) => {
          console.error("Gemini API Error:", err);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === agentMessageId ? { ...msg, text: "Desculpe, ocorreu um erro ao processar sua solicitação." } : msg
            )
          );
          setError("Erro na comunicação com o assistente.");
          setIsSendingMessage(false);
        }
      );
    } catch (apiError) {
       console.error("Failed to send message via streamChatResponse:", apiError);
       setIsSendingMessage(false);
       setMessages(prev =>
         prev.map(msg =>
           msg.id === agentMessageId ? { ...msg, text: "Falha ao enviar mensagem. Tente novamente." } : msg
         )
       );
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

  if (error && !agent) { // Show error prominently if agent loading failed
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700">{error}</p>
          <Link to="/" className="mt-6 inline-block bg-brazil-blue text-white py-2 px-4 rounded hover:bg-blue-700">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }
  
  if (!agent) { // Fallback if no agent and no specific error (e.g. inactive but no error set)
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
         <p className="text-gray-700">Agente de chat não disponível ou não encontrado.</p>
          <Link to="/" className="mt-6 inline-block bg-brazil-blue text-white py-2 px-4 rounded hover:bg-blue-700">
            Voltar para Início
          </Link>
      </div>
    );
  }
  
  // Render chat window if agent is loaded, even if there was a non-critical error previously (now cleared)
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-brazil-blue to-brazil-green p-2 sm:p-4">
      <div className="w-full max-w-2xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-h-[800px] md:max-h-[700px]">
         <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage} // onSendMessage now only takes text
            isSending={isSendingMessage}
            agentName={agent?.name}
            isLoadingAgent={isLoadingAgent} // This will be false here, but kept for ChatWindow prop consistency
            groundingChunks={currentGroundingChunks}
          />
      </div>
    </div>
  );
};

export default ChatInterfacePage;