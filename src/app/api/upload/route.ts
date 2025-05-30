import { NextRequest, NextResponse } from "next/server";
import { addModel, uploadFileToStorage, generateUniqueFilename, getMimeTypeFromFilename } from "@/lib/models";
import { UploadResponse, SupportedMimeTypes } from "@/types/model";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB pour les images

const SUPPORTED_MIME_TYPES: SupportedMimeTypes[] = [
  'model/vnd.usdz+zip',
  'model/gltf-binary',
  'model/gltf+json'
];

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
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

function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `L'image ${file.name} est trop volumineuse (max 10MB)`
    };
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `L'image ${file.name} n'est pas un format supporté (JPG, PNG, WebP)`
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API called");
    
    // Check environment variables
    console.log("📋 Environment check:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
    });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!file) {
      console.log("❌ No file provided");
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    console.log("📁 File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
      hasThumbnail: !!thumbnailFile
    });

    const validation = validateFile(file);
    if (!validation.valid) {
      console.log("❌ File validation failed:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Valider l'image de prévisualisation si fournie
    let thumbnailUrl: string | undefined;
    let thumbnailPath: string | undefined;
    
    if (thumbnailFile) {
      console.log("🖼️ Thumbnail info:", {
        name: thumbnailFile.name,
        size: thumbnailFile.size,
        type: thumbnailFile.type
      });

      const thumbnailValidation = validateImage(thumbnailFile);
      if (!thumbnailValidation.valid) {
        console.log("❌ Thumbnail validation failed:", thumbnailValidation.error);
        return NextResponse.json(
          { success: false, error: thumbnailValidation.error },
          { status: 400 }
        );
      }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const mimeType = getMimeTypeFromFilename(filename);
    
    console.log("🔧 Generated filename:", filename);

    // Upload to Supabase Storage
    console.log("☁️ Uploading to Supabase Storage...");
    const { url, path } = await uploadFileToStorage(file, filename);
    console.log("✅ Upload successful:", { url, path });

    // Upload thumbnail if provided
    if (thumbnailFile) {
      console.log("☁️ Uploading thumbnail to Supabase Storage...");
      const thumbnailFilename = generateUniqueFilename(thumbnailFile.name);
      const thumbnailUpload = await uploadFileToStorage(thumbnailFile, thumbnailFilename, 'thumbnails');
      thumbnailUrl = thumbnailUpload.url;
      thumbnailPath = thumbnailUpload.path;
      console.log("✅ Thumbnail upload successful:", { thumbnailUrl, thumbnailPath });
    }

    // Add to database
    console.log("💾 Adding to database...");
    const model = await addModel(
      filename,
      file.name,
      file.size,
      mimeType,
      path,
      url,
      thumbnailUrl,
      thumbnailPath
    );
    console.log("✅ Database insert successful:", model.id);

    const response: UploadResponse = {
      success: true,
      model,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Upload error:", error);
    console.error("💥 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur lors du téléchargement" 
      },
      { status: 500 }
    );
  }
} 