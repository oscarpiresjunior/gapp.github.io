export interface ClientAgentAttachment {
  id: string; // Unique ID for the attachment file
  name: string;
  mimeType: string;
  data: string; // base64 encoded data
  type: 'image' | 'video'; // To help with rendering
  size: number; // File size in bytes
}

export interface ClientAgent {
  id: string;
  name: string;
  url_identifier: string; 
  master_prompt: string;
  status: 'active' | 'inactive';
  created_at: string; 
  geminiApiKey?: string; // Optional API key for this specific agent
  attachments?: ClientAgentAttachment[]; // Files associated with the agent
}

export interface ChatMessageAttachment {
  type: 'image' | 'video';
  data: string; // base64 encoded data
  mimeType: string;
  name?: string; // Original file name, optional
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  attachment?: ChatMessageAttachment; // For displaying files in chat, whether from user or agent
  isAIRenderedAttachment?: boolean; // Flag to indicate if attachment was added by AI's [SHOW_FILE:]
}

// For form handling
export type ClientAgentFormData = Omit<ClientAgent, 'id' | 'created_at' | 'status' | 'attachments'> & { 
  status?: 'active' | 'inactive';
  attachments?: ClientAgentAttachment[]; // For handling during form submission
  geminiApiKey?: string;
};

// For Google Search Grounding Chunks
export interface GroundingChunkWeb {
  uri?: string; // Made optional to match @google/genai
  title?: string; // Made optional to match @google/genai
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}