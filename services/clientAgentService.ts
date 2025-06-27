import { ClientAgent, ClientAgentFormData, ClientAgentAttachment } from '../types';
import { MOCK_CLIENT_AGENTS_KEY } from '../constants';

// Initialize with some mock data if localStorage is empty
const initializeMockData = (): ClientAgent[] => {
  const defaultAgents: ClientAgent[] = [
    {
      id: '1',
      name: 'Startup Social',
      url_identifier: 'startupsocial',
      master_prompt: `You are a helpful assistant for Startup Social. Your goal is to provide information about our services and encourage users to sign up for our newsletter. Be friendly and engaging. 
Our main services are: community building, social media strategy, and content creation. Our newsletter offers weekly tips on social impact.
When asked for a payment link, provide this one: https://payment.example.com/startup. Our website is www.startupsocial.example.com.
You have access to the following files:
- 'startup_social_logo.png' (image)
If you want to show a file, include [SHOW_FILE:filename.ext] in your response. For example, to show the logo, say [SHOW_FILE:startup_social_logo.png].`,
      status: 'active',
      created_at: new Date().toISOString(),
      geminiApiKey: '', // Example: 'SPECIFIC_API_KEY_FOR_STARTUP_SOCIAL'
      attachments: [
        // Example attachment (you'd need actual base64 data for a real logo)
        // { 
        //   id: 'logo1', 
        //   name: 'startup_social_logo.png', 
        //   mimeType: 'image/png', 
        //   data: 'iVBORw0KGgoAAAANSUhEUgAAAAUA...', // placeholder base64
        //   type: 'image',
        //   size: 1024 // placeholder size
        // }
      ],
    },
    {
      id: '2',
      name: 'Print Foods AI',
      url_identifier: 'printfoods',
      master_prompt: `You are an expert culinary assistant for Print Foods, a company specializing in 3D printed food. 
Answer questions about our innovative food printing technology, suggest recipes that can be made with our printers, and explain the benefits of 3D printed food (customization, sustainability, novel textures). Be enthusiastic and futuristic.
You have access to the following files:
- 'printed_burger.jpg' (image) - A delicious 3D printed burger.
- 'food_printer_demo.mp4' (video) - A demonstration of our food printer.
To show a file, include [SHOW_FILE:filename.ext] in your response. For example: [SHOW_FILE:printed_burger.jpg].`,
      status: 'active',
      created_at: new Date().toISOString(),
      geminiApiKey: '',
      attachments: [],
    },
  ];
  
  try {
    const storedAgents = localStorage.getItem(MOCK_CLIENT_AGENTS_KEY);
    if (!storedAgents) {
      localStorage.setItem(MOCK_CLIENT_AGENTS_KEY, JSON.stringify(defaultAgents));
      return defaultAgents;
    }
    const parsedAgents = JSON.parse(storedAgents);
    // Ensure attachments is always an array
    return parsedAgents.map((agent: ClientAgent) => ({
      ...agent,
      attachments: agent.attachments || []
    }));
  } catch (error) {
    console.error("Error with localStorage initialization:", error);
    // Ensure attachments is always an array for default agents too
    return defaultAgents.map(agent => ({
      ...agent,
      attachments: agent.attachments || []
    }));
  }
};

let agents: ClientAgent[] = initializeMockData();

const persistAgents = () => {
  try {
    localStorage.setItem(MOCK_CLIENT_AGENTS_KEY, JSON.stringify(agents));
  } catch (error) {
    console.error("Error persisting agents to localStorage:", error);
  }
};

export const getClientAgents = async (): Promise<ClientAgent[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return agents.map(agent => ({ ...agent, attachments: agent.attachments || [] })); // Return a copy
};

export const getClientAgentById = async (id: string): Promise<ClientAgent | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const agent = agents.find(agent => agent.id === id);
  return agent ? { ...agent, attachments: agent.attachments || [] } : undefined;
};

export const getClientAgentByIdentifier = async (identifier: string): Promise<ClientAgent | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const agent = agents.find(agent => agent.url_identifier === identifier);
  return agent ? { ...agent, attachments: agent.attachments || [] } : undefined;
};

export const addClientAgent = async (formData: ClientAgentFormData): Promise<ClientAgent> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newAgent: ClientAgent = {
    // id, created_at, status are part of ClientAgent but not ClientAgentFormData (except status)
    // attachments are part of ClientAgentFormData here due to direct form pass-through
    id: String(Date.now() + Math.random()), 
    created_at: new Date().toISOString(),
    name: formData.name,
    url_identifier: formData.url_identifier,
    master_prompt: formData.master_prompt,
    status: formData.status || 'active',
    geminiApiKey: formData.geminiApiKey || '',
    attachments: formData.attachments || [],
  };
  agents.push(newAgent);
  persistAgents();
  return newAgent;
};

export const updateClientAgent = async (id: string, formData: Partial<ClientAgentFormData>): Promise<ClientAgent | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const agentIndex = agents.findIndex(agent => agent.id === id);
  if (agentIndex !== -1) {
    // Ensure attachments are preserved or updated correctly
    const updatedAgent = { 
      ...agents[agentIndex], 
      ...formData,
      attachments: formData.attachments !== undefined ? formData.attachments : agents[agentIndex].attachments,
    } as ClientAgent;
    agents[agentIndex] = updatedAgent;
    persistAgents();
    return agents[agentIndex];
  }
  return undefined;
};

export const deleteClientAgent = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const initialLength = agents.length;
  agents = agents.filter(agent => agent.id !== id);
  persistAgents();
  return agents.length < initialLength;
};