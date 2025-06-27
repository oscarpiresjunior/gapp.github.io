import { Conversation, ChatMessage, User } from '../types';
import { MOCK_CONVERSATIONS_KEY } from '../constants';

const getConversations = (): Conversation[] => {
  try {
    const data = localStorage.getItem(MOCK_CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading conversations from localStorage:", error);
    return [];
  }
};

const saveConversations = (conversations: Conversation[]) => {
  try {
    localStorage.setItem(MOCK_CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
  }
};

// --- Public API ---

export const getConversationsForUser = async (user: User | null): Promise<Conversation[]> => {
  if (!user) return [];
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const allConversations = getConversations();
  return allConversations
    .filter(c => c.ownerEmail === user.email)
    .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
};

export const getConversationById = async (id: string): Promise<Conversation | null> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  const allConversations = getConversations();
  const conversation = allConversations.find(c => c.id === id);
  return conversation || null;
};

export const createConversation = async (agentId: string, ownerEmail: string): Promise<Conversation> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const newConversation: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    agentId,
    ownerEmail,
    leadIdentifier: `Lead-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    messages: [
        {
            id: `msg-${Date.now()}`,
            text: 'Conversa iniciada.',
            sender: 'system',
            timestamp: new Date()
        }
    ],
    lastMessageTimestamp: Date.now(),
    aiStatus: 'active',
    isReadByOwner: false,
  };
  
  const allConversations = getConversations();
  allConversations.push(newConversation);
  saveConversations(allConversations);
  
  return newConversation;
};

export const addMessageToConversation = async (
  conversationId: string, 
  message: ChatMessage,
  // When replacing a placeholder, we don't want to just push.
  replaceLast?: boolean 
): Promise<ChatMessage[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const allConversations = getConversations();
  const convIndex = allConversations.findIndex(c => c.id === conversationId);

  if (convIndex === -1) {
    console.error("Conversation not found for adding message.");
    return [];
  }
  
  const conversation = allConversations[convIndex];
  
  if (replaceLast) {
    conversation.messages[conversation.messages.length - 1] = message;
  } else {
    conversation.messages.push(message);
  }
  
  conversation.lastMessageTimestamp = new Date(message.timestamp).getTime();
  
  // A new message from a user makes it "unread" for the owner.
  if(message.sender === 'user'){
      conversation.isReadByOwner = false;
  }
  
  allConversations[convIndex] = conversation;
  saveConversations(allConversations);

  return conversation.messages;
};

export const updateConversationStatus = async (
  conversationId: string, 
  newStatus: 'active' | 'paused'
): Promise<Conversation | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allConversations = getConversations();
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) {
        console.error("Conversation not found for updating status.");
        return null;
    }

    allConversations[convIndex].aiStatus = newStatus;

    // Add a system message to log the handoff
    const systemMessageText = newStatus === 'paused'
        ? 'Atendimento por IA pausado. Humano assumiu.'
        : 'Atendimento por IA retomado.';
    
    allConversations[convIndex].messages.push({
        id: `msg-${Date.now()}`,
        text: systemMessageText,
        sender: 'system',
        timestamp: new Date(),
    });


    saveConversations(allConversations);
    return allConversations[convIndex];
};


export const markAsRead = async (conversationId: string): Promise<Conversation | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allConversations = getConversations();
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return null;
    
    allConversations[convIndex].isReadByOwner = true;
    saveConversations(allConversations);
    return allConversations[convIndex];
};