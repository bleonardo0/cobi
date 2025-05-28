import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { addModel } from "@/lib/models";
import { UploadResponse, SupportedMimeTypes } from "@/types/model";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "models");

const SUPPORTED_MIME_TYPES: SupportedMimeTypes[] = [
  'model/vnd.usdz+zip',
  'model/gltf-binary',
  'model/gltf+json'
];

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier ${file.name} est trop volumineux (max 50MB)`
    };
  }

  const isValidMimeType = SUPPORTED_MIME_TYPES.includes(file.type as SupportedMimeTypes);
  const hasValidExtension = /\.(usdz|glb|gltf)$/i.test(file.name);

  if (!isValidMimeType && !hasValidExtension) {
    return {
      valid: false,
      error: `Le fichier ${file.name} n'est pas un format supporté (USDZ, GLB, GLTF)`
    };
  }

  return { valid: true };
}

function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  const cleanBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${cleanBaseName}-${timestamp}-${randomString}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const filename = generateUniqueFilename(file.name);
    const filePath = path.join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    const model = await addModel(filename, file.name, file.size);

    const response: UploadResponse = {
      success: true,
      model,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur lors du téléchargement" 
      },
      { status: 500 }
    );
  }
} 