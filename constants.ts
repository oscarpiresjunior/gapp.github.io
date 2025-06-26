
// WARNING: Storing credentials like this is insecure for production applications.
// These should be handled by a secure backend authentication system and environment variables.
// For this MVP frontend simulation, they are defined here.
export const ADMIN_USERNAME = "gestor";
export const ADMIN_PASSWORD = "cambinda@2025#";

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
// process.env.API_KEY is expected to be set in the environment.
// In a real frontend app, this would be injected at build time or (less securely) configured.
// Exposing API keys on the client-side is a security risk. A backend proxy is recommended.
export const API_KEY = process.env.API_KEY;

export const MOCK_CLIENT_AGENTS_KEY = 'gapp_mock_client_agents';
