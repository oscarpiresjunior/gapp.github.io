import { BRANDING_LOGO_KEY } from '../constants';

/**
 * Saves the logo as a base64 string to localStorage.
 * @param base64Logo The base64 representation of the logo image.
 */
export const saveLogo = (base64Logo: string): void => {
  try {
    localStorage.setItem(BRANDING_LOGO_KEY, base64Logo);
  } catch (error) {
    console.error("Error saving logo to localStorage:", error);
  }
};

/**
 * Retrieves the logo base64 string from localStorage, simulating an async API call.
 * @returns A promise that resolves to the base64 string or null if not found.
 */
export const getLogo = async (): Promise<string | null> => {
  // Simulate a short network delay for fetching public data
  await new Promise(resolve => setTimeout(resolve, 50));
  try {
    return localStorage.getItem(BRANDING_LOGO_KEY);
  } catch (error)
 {
    console.error("Error retrieving logo from localStorage:", error);
    return null;
  }
};

/**
 * Removes the logo from localStorage.
 */
export const removeLogo = (): void => {
  try {
    localStorage.removeItem(BRANDING_LOGO_KEY);
  } catch (error) {
    console.error("Error removing logo from localStorage:", error);
  }
};
