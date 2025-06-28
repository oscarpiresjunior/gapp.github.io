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
    // Load the logo from localStorage on initial app load
    const storedLogo = brandingService.getLogo();
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
    setIsLoading(false);
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
