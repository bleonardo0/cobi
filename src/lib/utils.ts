import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SupportedMimeTypes } from "@/types/model";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function validateFileType(file: File): boolean {
  const supportedTypes: SupportedMimeTypes[] = [
    'model/vnd.usdz+zip',
    'model/gltf-binary',
    'model/gltf+json'
  ];
  
  return supportedTypes.includes(file.type as SupportedMimeTypes) ||
         file.name.toLowerCase().endsWith('.usdz') ||
         file.name.toLowerCase().endsWith('.glb') ||
         file.name.toLowerCase().endsWith('.gltf');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMimeTypeFromExtension(filename: string): SupportedMimeTypes {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'usdz':
      return 'model/vnd.usdz+zip';
    case 'glb':
      return 'model/gltf-binary';
    case 'gltf':
      return 'model/gltf+json';
    default:
      return 'model/gltf-binary';
  }
} 