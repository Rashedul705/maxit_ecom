'use client';

import React, { createContext, useContext } from 'react';
import { SiteSetting } from './types';

interface SettingsContextValue {
  settings: SiteSetting | null;
  hotline: string;
  telHref: string;
}

const DEFAULT_HOTLINE = '+8801733-272445';

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  hotline: DEFAULT_HOTLINE,
  telHref: `tel:${DEFAULT_HOTLINE.replace(/[^0-9+]/g, '')}`,
});

export const SettingsProvider: React.FC<{
  settings?: SiteSetting | null;
  children: React.ReactNode;
}> = ({ settings = null, children }) => {
  const hotline =
    settings?.header?.hotline ||
    settings?.contact?.phone ||
    settings?.phone ||
    DEFAULT_HOTLINE;
  const telHref = `tel:${hotline.replace(/[^0-9+]/g, '')}`;

  return (
    <SettingsContext.Provider value={{ settings, hotline, telHref }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
