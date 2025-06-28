import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as brandingService from '../services/brandingService';

interface BrandingContextType {
  logoUrl: string | null;
  updateLogo: (newLogo: string | null) => void;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Asynchronously load the logo on initial app load to mimic a public API call
    const fetchLogo = async () => {
      setIsLoading(true);
      const storedLogo = await brandingService.getLogo();
      if (storedLogo) {
        setLogoUrl(storedLogo);
      }
      setIsLoading(false);
    };

    fetchLogo();
  }, []);

  const updateLogo = (newLogo: string | null) => {
    if (newLogo) {
      brandingService.saveLogo(newLogo);
      setLogoUrl(newLogo);
    } else {
      brandingService.removeLogo();
      setLogoUrl(null);
    }
  };

  return (
    <BrandingContext.Provider value={{ logoUrl, updateLogo, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
