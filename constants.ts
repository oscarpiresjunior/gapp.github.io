// WARNING: Storing credentials like this is insecure for production applications.
// These should be handled by a secure backend authentication system and environment variables.
// For this MVP frontend simulation, they are defined here.

// Hardcoded admin credentials removed in favor of a mock user system.
// export const ADMIN_USERNAME = "gestor";
// export const ADMIN_PASSWORD = "cambinda@2025#";

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
// process.env.API_KEY is expected to be set in the environment.
// In a real frontend app, this would be injected at build time or (less securely) configured.
// Exposing API keys on the client-side is a security risk. A backend proxy is recommended.
// The API key is now directly accessed in geminiService.ts via process.env.API_KEY as a fallback.

export const MOCK_CLIENT_AGENTS_KEY = 'gappchat_mock_client_agents';
export const MOCK_USERS_KEY = 'gappchat_mock_users';
export const SESSION_USER_KEY = 'gappchat_session_user_email';
export const MOCK_CONVERSATIONS_KEY = 'gappchat_conversations'; // New key for CRM
export const BRANDING_LOGO_KEY = 'gappchat_branding_logo'; // New key for custom logo