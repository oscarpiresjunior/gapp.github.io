import { GoogleGenAI, Chat, GenerateContentResponse, Part, GroundingMetadata, Content } from "@google/genai";
import { API_KEY as FALLBACK_API_KEY, GEMINI_TEXT_MODEL } from '../constants';
import { ChatMessage, ClientAgentAttachment, ChatMessageAttachment } from "../types"; // ChatMessageAttachment used for display

// Store GoogleGenAI instances mapped by API key to reuse them
const aiInstances: Record<string, GoogleGenAI> = {};
const chatInstances: Record<string, Chat> = {}; // Key: agentIdentifier

const getAiInstance = (agentApiKey?: string): GoogleGenAI => {
  const apiKeyToUse = agentApiKey || FALLBACK_API_KEY;
  if (!apiKeyToUse) {
    // This should ideally not happen if FALLBACK_API_KEY is set or agentApiKey is required
    console.error("API_KEY is not available. Please ensure the API_KEY environment variable is configured or an agent-specific key is provided.");
    throw new Error("Gemini API Key is missing.");
  }

  if (!aiInstances[apiKeyToUse]) {
    aiInstances[apiKeyToUse] = new GoogleGenAI({ apiKey: apiKeyToUse });
  }
  return aiInstances[apiKeyToUse];
};


const getChatInstance = (
  agentIdentifier: string, 
  masterPrompt: string, 
  history: ChatMessage[],
  agentApiKey?: string
): Chat => {
  // Chat instance key should be unique per agent AND potentially API key if sessions are isolated by key
  // For simplicity, agentIdentifier is the primary key for chat session.
  // If API key changes for an agent, resetChatSession should be called.
  if (chatInstances[agentIdentifier]) {
    // TODO: Potentially verify if masterPrompt or API key has changed and re-initialize if needed.
    // For now, assume it's stable for the session or resetChatSession is called externally on changes.
    return chatInstances[agentIdentifier];
  }

  const ai = getAiInstance(agentApiKey);

  const geminiHistory: Content[] = history
    .filter(msg => msg.sender === 'user' || (msg.sender === 'agent' && !msg.isAIRenderedAttachment)) // Exclude pure attachment display messages from history
    .map(msg => {
      // Agent attachments (ClientAgentAttachment) are part of master_prompt's instructions.
      // ChatMessageAttachment is for files *sent by user in chat* (removed for now) or *rendered by AI*.
      // For history, we only care about the text parts, unless the model supports image history directly
      // and those images were part of the turn (not just referenced by [SHOW_FILE]).
      // The current [SHOW_FILE] mechanism means images are rendered client-side, not part of AI's direct input history as images.
      const parts: Part[] = [];
      if (msg.text) { 
          parts.push({ text: msg.text });
      }
      
      // If user-sent attachments were re-enabled, they would be added here to history for the AI.
      // if (msg.attachment && msg.sender === 'user') {
      //   parts.push({
      //     inlineData: {
      //       mimeType: msg.attachment.mimeType,
      //       data: msg.attachment.data,
      //     },
      //   });
      // }
      
      // Ensure at least one part for Gemini
      if (parts.length === 0 && msg.text === "") { 
         parts.push({ text: "" }); 
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });

  const chat = ai.chats.create({
    model: GEMINI_TEXT_MODEL,
    history: geminiHistory,
    config: {
      systemInstruction: masterPrompt,
    },
  });
  chatInstances[agentIdentifier] = chat;
  return chat;
};

export const streamChatResponse = async (
  agentIdentifier: string,
  masterPrompt: string,
  agentSpecificApiKey: string | undefined, // Added agent's API key
  userMessageText: string,
  currentHistory: ChatMessage[], // This history already includes the latest user message
  onChunk: (chunkText: string, isFinal: boolean, groundingMetadata?: GroundingMetadata) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    // The currentHistory ALREADY includes the latest user message with its text.
    // No separate attachment is passed here as user file uploads in chat are removed.
    // Agent files are referenced in master_prompt and handled by [SHOW_FILE:]
    const chat = getChatInstance(agentIdentifier, masterPrompt, currentHistory, agentSpecificApiKey);
    
    const messageParts: Part[] = [];
    if (userMessageText) {
        messageParts.push({ text: userMessageText });
    } else {
        // Gemini requires at least one part. If text is empty (e.g. user just hit send by mistake or future feature)
        messageParts.push({ text: "" }); 
    }

    const result = await chat.sendMessageStream({ message: messageParts }); // Changed 'parts' to 'message'

    let accumulatedGroundingMeta: GroundingMetadata | undefined = undefined;
    for await (const chunk of result) {
      const chunkText = chunk.text;
      const groundingMeta = chunk.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
      if (groundingMeta) {
        accumulatedGroundingMeta = groundingMeta; // Keep the latest grounding metadata
      }
      onChunk(chunkText, false, groundingMeta); 
    }
    // The 'isFinal' call uses the last known accumulated grounding metadata from the stream.
    onChunk("", true, accumulatedGroundingMeta); 

  } catch (error) {
    console.error("Error streaming chat response from Gemini:", error);
    onError(error instanceof Error ? error : new Error('Unknown Gemini API error'));
  }
};


// getChatResponse (non-streaming) might be less used now but updated for consistency
export const getChatResponse = async (
  agentIdentifier: string,
  masterPrompt: string,
  agentSpecificApiKey: string | undefined,
  userMessageText: string,
  currentHistory: ChatMessage[]
): Promise<{text: string, groundingMetadata?: GroundingMetadata}> => {
  try {
    const chat = getChatInstance(agentIdentifier, masterPrompt, currentHistory, agentSpecificApiKey);
    
    const messageParts: Part[] = [];
     if (userMessageText) {
        messageParts.push({ text: userMessageText });
    } else {
        messageParts.push({ text: "" });
    }

    const response: GenerateContentResponse = await chat.sendMessage({message: messageParts}); // Changed 'parts' to 'message'
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    return { text: response.text, groundingMetadata };
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    throw error;
  }
};

export const resetChatSession = (agentIdentifier: string): void => {
  // Also clear the AI instance if it was agent-specific and no other chat uses it?
  // For now, just deleting the chat session instance is fine.
  // AI instances are cached by API key, so they are reused.
  delete chatInstances[agentIdentifier];
};