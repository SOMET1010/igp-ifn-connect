import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour générer un fingerprint unique de l'appareil
 * Utilisé pour la vérification silencieuse (Layer 2)
 * 
 * Combine plusieurs signaux pour créer un identifiant stable :
 * - Canvas fingerprint
 * - Screen properties
 * - Timezone
 * - Language
 * - Platform
 */

interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

// Simple hash function (djb2)
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  // Convert to positive hex string
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Generate canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with various styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('JULABA 🇨🇮', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('JULABA 🇨🇮', 4, 17);
    
    // Get data URL and hash it
    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch {
    return 'canvas-error';
  }
}

// Get WebGL vendor info
function getWebGLInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';
    
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return hashString(`${vendor}|${renderer}`);
  } catch {
    return 'webgl-error';
  }
}

// Detect device type from user agent
function getDeviceName(): string {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) {
    if (ua.includes('mobile')) return 'Android Phone';
    return 'Android Tablet';
  }
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux';
  
  return 'Appareil inconnu';
}

export function useDeviceFingerprint() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateFingerprint = useCallback(() => {
    try {
      // Collect device signals
      const signals = {
        canvas: getCanvasFingerprint(),
        webgl: getWebGLInfo(),
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        touchPoints: navigator.maxTouchPoints,
        memory: (navigator as any).deviceMemory || 'unknown',
        cores: navigator.hardwareConcurrency || 'unknown',
      };
      
      // Combine all signals into one fingerprint
      const signalString = Object.values(signals).join('|');
      const fingerprint = hashString(signalString) + hashString(signalString.split('').reverse().join(''));
      
      const info: DeviceInfo = {
        fingerprint,
        deviceName: getDeviceName(),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: signals.timezone,
        language: signals.language,
        platform: signals.platform,
      };
      
      setDeviceInfo(info);
      setIsLoading(false);
      
      return info;
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    // Generate fingerprint on mount
    generateFingerprint();
  }, [generateFingerprint]);

  return {
    deviceInfo,
    fingerprint: deviceInfo?.fingerprint || null,
    deviceName: deviceInfo?.deviceName || null,
    isLoading,
    regenerate: generateFingerprint,
  };
}
