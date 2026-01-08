/**
 * Carte de documentation d'une page
 */

import React from 'react';
import { Check, Route, Sparkles, Accessibility } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageDocumentation } from '../../types/documentation.types';
import { ScreenshotUploader } from './ScreenshotUploader';
import { getCategoryColor } from '../../data/pagesDocumentation';

interface PageDocumentationCardProps {
  page: PageDocumentation;
  screenshot?: string;
  onUploadScreenshot: (pageId: string, base64: string) => void;
  onRemoveScreenshot: (pageId: string) => void;
}

export const PageDocumentationCard: React.FC<PageDocumentationCardProps> = ({
  page,
  screenshot,
  onUploadScreenshot,
  onRemoveScreenshot,
}) => {
  const categoryColor = getCategoryColor(page.category);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight">
              {page.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Route className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {page.route}
              </code>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="flex-shrink-0"
            style={{ 
              borderColor: categoryColor, 
              color: categoryColor,
              backgroundColor: `${categoryColor}10`
            }}
          >
            {screenshot ? (
              <Check className="h-3 w-3 mr-1" />
            ) : null}
            {screenshot ? 'Capture' : 'Sans capture'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {page.description}
        </p>

        {/* Fonctionnalités */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Fonctionnalités</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {page.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span>{feature}</span>
              </li>
            ))}
            {page.features.length > 4 && (
              <li className="text-xs text-muted-foreground/70 italic">
                +{page.features.length - 4} autres fonctionnalités
              </li>
            )}
          </ul>
        </div>

        {/* Accessibilité */}
        {page.accessibility.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Accessibility className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Accessibilité</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {page.accessibility.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Zone d'upload de capture */}
        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-2">Capture d'écran</div>
          <ScreenshotUploader
            pageId={page.id}
            screenshot={screenshot}
            onUpload={onUploadScreenshot}
            onRemove={onRemoveScreenshot}
          />
        </div>
      </CardContent>
    </Card>
  );
};
