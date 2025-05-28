declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          ar?: boolean;
          'ar-modes'?: string;
          'ios-src'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'interaction' | 'manual';
          'environment-image'?: string;
          'skybox-image'?: string;
          poster?: string;
          seamlessPoster?: boolean;
          'shadow-intensity'?: number;
          'shadow-softness'?: number;
          'camera-orbit'?: string;
          'camera-target'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'min-field-of-view'?: string;
          'max-field-of-view'?: string;
          bounds?: 'tight' | 'legacy';
          'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
          'interaction-prompt-style'?: 'basic' | 'wiggle';
          'interaction-prompt-threshold'?: number;
          'auto-rotate-delay'?: number;
          'rotation-per-second'?: string;
          animation?: boolean;
          'animation-name'?: string;
          'animation-crossfade-duration'?: number;
          variant?: string;
          orientation?: string;
          scale?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
    }
  }
}

export {}; 