/**
 * AppShell - Layout principal de l'application
 * 
 * Contient les éléments globaux (banners, indicators, toasters)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from '@/components/shared/DemoBanner';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { AudioPlayingIndicator } from '@/components/shared/AudioPlayingIndicator';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <DemoBanner />
      <OfflineIndicator />
      <AudioPlayingIndicator />
      {children || <Outlet />}
    </>
  );
}

export default AppShell;
