/**
 * Hook React pour la gestion de l'imprimante Bluetooth
 */

import { useState, useEffect, useCallback } from 'react';
import type { PrinterDevice, PrinterConnectionStatus } from '../types/printer.types';
import { printerService } from '../services/printerService';
import { printerQueue } from '../services/printerQueue';

export interface UsePrinterReturn {
  // État
  status: PrinterConnectionStatus;
  device: PrinterDevice | null;
  savedDevice: PrinterDevice | null;
  isSupported: boolean;
  isPrinting: boolean;
  pendingJobs: number;
  
  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  printTest: () => Promise<boolean>;
  processQueue: () => Promise<void>;
}

export function usePrinter(): UsePrinterReturn {
  const [status, setStatus] = useState<PrinterConnectionStatus>(printerService.getStatus());
  const [device, setDevice] = useState<PrinterDevice | null>(printerService.getDevice());
  const [isPrinting, setIsPrinting] = useState(false);
  const [pendingJobs, setPendingJobs] = useState(0);

  const isSupported = printerService.isSupported();
  const savedDevice = printerService.getSavedDevice();

  // Abonnement aux événements imprimante
  useEffect(() => {
    const unsubscribePrinter = printerService.subscribe((event) => {
      switch (event.type) {
        case 'connected':
          setStatus('connected');
          setDevice(event.data as PrinterDevice);
          break;
        case 'disconnected':
          setStatus('disconnected');
          setDevice(null);
          break;
        case 'error':
          setStatus('error');
          break;
        case 'printing':
          setIsPrinting(true);
          break;
        case 'printed':
          setIsPrinting(false);
          break;
      }
    });

    const unsubscribeQueue = printerQueue.subscribe(setPendingJobs);

    // Auto-process queue setup
    const unsubscribeAutoProcess = printerQueue.setupAutoProcess();

    return () => {
      unsubscribePrinter();
      unsubscribeQueue();
      unsubscribeAutoProcess();
    };
  }, []);

  const connect = useCallback(async () => {
    setStatus('connecting');
    const success = await printerService.connect();
    if (!success) {
      setStatus('disconnected');
    }
    return success;
  }, []);

  const disconnect = useCallback(() => {
    printerService.disconnect();
  }, []);

  const printTest = useCallback(async () => {
    return printerService.printTest();
  }, []);

  const processQueue = useCallback(async () => {
    await printerQueue.processQueue();
  }, []);

  return {
    status,
    device,
    savedDevice,
    isSupported,
    isPrinting,
    pendingJobs,
    connect,
    disconnect,
    printTest,
    processQueue,
  };
}
