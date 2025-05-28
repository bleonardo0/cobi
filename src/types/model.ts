export interface Model3D {
  id: string;
  name: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  fileSize: number;
  uploadDate: string;
  mimeType: string;
  slug: string;
}

export interface UploadResponse {
  success: boolean;
  model?: Model3D;
  error?: string;
}

export interface ModelsResponse {
  models: Model3D[];
  total: number;
}

export type SupportedMimeTypes = 'model/vnd.usdz+zip' | 'model/gltf-binary' | 'model/gltf+json'; 