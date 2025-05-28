import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelCard from '@/components/ModelCard';
import { Model3D } from '@/types/model';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, variants, initial, animate, whileHover, className, ...props }: any) => 
      <div className={className} {...props}>{children}</div>,
  },
}));

// Mock @google/model-viewer
jest.mock('@google/model-viewer', () => ({}));

const mockModel: Model3D = {
  id: '1',
  name: 'Test Model',
  filename: 'test-model.usdz',
  url: '/models/test-model.usdz',
  fileSize: 1024000,
  uploadDate: '2024-01-01T00:00:00.000Z',
  mimeType: 'model/vnd.usdz+zip',
  slug: 'test-model',
};

describe('ModelCard', () => {
  it('renders model information correctly', () => {
    render(<ModelCard model={mockModel} />);
    
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('USDZ')).toBeInTheDocument();
    expect(screen.getByText('1000 KB')).toBeInTheDocument();
    expect(screen.getByText('Voir détails →')).toBeInTheDocument();
  });

  it('shows AR button for USDZ models', () => {
    render(<ModelCard model={mockModel} />);
    
    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('shows GLB format for non-USDZ models', () => {
    const glbModel = {
      ...mockModel,
      mimeType: 'model/gltf-binary',
      filename: 'test-model.glb',
    };
    
    render(<ModelCard model={glbModel} />);
    
    expect(screen.getByText('GLB')).toBeInTheDocument();
    expect(screen.queryByText('AR')).not.toBeInTheDocument();
  });

  it('formats upload date correctly', () => {
    render(<ModelCard model={mockModel} />);
    
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });
}); 