'use client';

import { useEffect, useRef, forwardRef } from 'react';

interface ModelViewerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const ModelViewer = forwardRef<HTMLElement, ModelViewerProps>(
  ({ src, alt, className, style, children }, ref) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      // Dynamically import model-viewer for client-side only
      import('@google/model-viewer').then(() => {
        // model-viewer is now loaded
      });
    }, []);

    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = elementRef.current;
      }
    }, [ref]);

    return (
      <div
        ref={elementRef as any}
        dangerouslySetInnerHTML={{
          __html: `
            <model-viewer
              src="${src}"
              alt="${alt}"
              auto-rotate
              camera-controls
              ar
              ar-modes="webxr scene-viewer quick-look"
              ios-src="${src}"
              loading="lazy"
              reveal="interaction"
              class="${className || ''}"
              style="${style ? Object.entries(style).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ') : ''}"
            >
              ${children ? `<div slot="progress-bar" class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>` : ''}
            </model-viewer>
          `
        }}
      />
    );
  }
);

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer; 