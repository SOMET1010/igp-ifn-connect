/**
 * AppShell - Layout principal de l'application
 * 
 * Contient les éléments globaux (banners, indicators, toasters)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner, OfflineIndicator, AudioPlayingIndicator } from '@/shared/ui';

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
