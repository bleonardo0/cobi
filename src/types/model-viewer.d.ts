declare namespace JSX {
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
        'shadow-intensity'?: number;
        'shadow-softness'?: number;
        'exposure'?: number;
        'tone-mapping'?: string;
        ref?: React.Ref<any>;
      },
      HTMLElement
    >;
  }
} 