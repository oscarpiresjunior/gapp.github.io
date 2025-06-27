import { GoogleGenAI, Chat, GenerateContentResponse, Part, GroundingMetadata, Content } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { ChatMessage, ClientAgentAttachment, ChatMessageAttachment } from "../types";

// Store GoogleGenAI instances mapped by API key to reuse them
const aiInstances: Record<string, GoogleGenAI> = {};

const getAiInstance = (agentApiKey?: string): GoogleGenAI => {
  const apiKeyToUse = agentApiKey || process.env.API_KEY;
  if (!apiKeyToUse) {
    console.error("API_KEY is not available. Please ensure the API_KEY environment variable is configured or an agent-specific key is provided.");
    throw new Error("Gemini API Key is missing.");
  }

  if (!aiInstances[apiKeyToUse]) {
    aiInstances[apiKeyToUse] = new GoogleGenAI({ apiKey: apiKeyToUse });
  }
  return aiInstances[apiKeyToUse];
};

// This function creates a new, temporary chat instance for each request,
// making the service stateless and able to handle conversations managed externally.
const createStatelessChat = (
  masterPrompt: string, 
  history: ChatMessage[],
  agentApiKey?: string
): Chat => {
  const ai = getAiInstance(agentApiKey);

  const geminiHistory: Content[] = history
    .filter(msg => msg.sender === 'user' || (msg.sender === 'agent' && !msg.isAIRenderedAttachment))
    .map(msg => {
      const parts: Part[] = [];
      if (msg.text) { 
          parts.push({ text: msg.text });
      }
      
      // Ensure at least one part for Gemini
      if (parts.length === 0 && msg.text === "") { 
         parts.push({ text: "" }); 
      }

      // If the message was sent by a human owner, it's part of the 'model's history for context
      const role = msg.sender === 'user' ? 'user' : 'model';

      return {
        role: role,
        parts: parts,
      };
    });

  const chat = ai.chats.create({
    model: GEMINI_TEXT_MODEL,
    history: geminiHistory,
    config: {
      systemInstruction: {
        parts: [{ text: masterPrompt }]
      },
    },
  });
  return chat;
};

export const streamChatResponse = async (
  masterPrompt: string,
  agentSpecificApiKey: string | undefined,
  userMessageText: string,
  currentHistory: ChatMessage[], // The full history, including the latest user message
  onChunk: (chunkText: string, isFinal: boolean, groundingMetadata?: GroundingMetadata) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    // The history for creating the chat should NOT include the latest message,
    // which is passed to sendMessage separately.
    const historyForChat = currentHistory.slice(0, -1);
    const chat = createStatelessChat(masterPrompt, historyForChat, agentSpecificApiKey);
    
    const messageParts: Part[] = userMessageText ? [{ text: userMessageText }] : [{ text: "" }];

    const result = await chat.sendMessageStream({ message: messageParts });

    let accumulatedGroundingMeta: GroundingMetadata | undefined = undefined;
    for await (const chunk of result) {
      const chunkText = chunk.text;
      const groundingMeta = chunk.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
      if (groundingMeta) {
        accumulatedGroundingMeta = groundingMeta;
      }
      onChunk(chunkText, false, groundingMeta); 
    }
    onChunk("", true, accumulatedGroundingMeta); 

  } catch (error) {
    console.error("Error streaming chat response from Gemini:", error);
    onError(error instanceof Error ? error : new Error('Unknown Gemini API error'));
  }
};


export const getChatResponse = async (
  masterPrompt: string,
  agentSpecificApiKey: string | undefined,
  userMessageText: string,
  currentHistory: ChatMessage[]
): Promise<{text: string, groundingMetadata?: GroundingMetadata}> => {
  try {
    const historyForChat = currentHistory.slice(0, -1);
    const chat = createStatelessChat(masterPrompt, historyForChat, agentSpecificApiKey);
    
    const messageParts: Part[] = userMessageText ? [{ text: userMessageText }] : [{ text: "" }];

    const response: GenerateContentResponse = await chat.sendMessage({message: messageParts});
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    return { text: response.text, groundingMetadata };
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    throw error;
  }
};

// No longer needed as chat sessions are now stateless and managed per-request.
// export const resetChatSession = (agentIdentifier: string): void => {};
