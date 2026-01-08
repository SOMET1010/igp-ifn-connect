/**
 * Types pour le générateur de documentation PDF
 */

export interface PageDocumentation {
  id: string;
  name: string;
  route: string;
  category: 'public' | 'merchant' | 'agent' | 'cooperative' | 'admin' | 'system';
  description: string;
  features: string[];
  accessibility: string[];
  screenshot?: string; // Base64 de l'image uploadée
}

export interface DocumentationSection {
  id: string;
  title: string;
  titleEn: string;
  color: string;
  bgColor: string;
  icon: string;
  pages: PageDocumentation[];
}

export interface ScreenshotUploadState {
  [pageId: string]: string; // pageId -> base64 screenshot
}
