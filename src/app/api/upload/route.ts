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

    // Parse form data with error handling
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.log("❌ Failed to parse form data:", error);
      return NextResponse.json(
        { success: false, error: "Données de formulaire invalides" },
        { status: 400 }
      );
    }

    const glbFile = formData.get("glbFile") as File | null;
    const usdzFile = formData.get("usdzFile") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    
    // Récupérer la catégorie et les tags
    const category = formData.get("category") as string || 'autres';
    const tagsString = formData.get("tags") as string || '[]';
    let tags: string[] = [];
    
    try {
      tags = JSON.parse(tagsString);
    } catch (error) {
      console.log("⚠️ Failed to parse tags, using empty array:", error);
      tags = [];
    }

    // Récupérer les nouveaux champs restaurant
    const priceString = formData.get("price") as string;
    const price = priceString ? parseFloat(priceString) : undefined;
    const shortDescription = formData.get("shortDescription") as string || undefined;
    const allergensString = formData.get("allergens") as string || '[]';
    let allergens: string[] = [];
    
    try {
      allergens = JSON.parse(allergensString);
    } catch (error) {
      console.log("⚠️ Failed to parse allergens, using empty array:", error);
      allergens = [];
    }

    if (!glbFile && !usdzFile) {
      console.log("❌ No files provided");
      return NextResponse.json(
        { success: false, error: "Aucun fichier GLB ou USDZ fourni" },
        { status: 400 }
      );
    }

    console.log("📁 Files info:", {
      glb: glbFile ? { name: glbFile.name, size: glbFile.size, type: glbFile.type } : null,
      usdz: usdzFile ? { name: usdzFile.name, size: usdzFile.size, type: usdzFile.type } : null,
      hasThumbnail: !!thumbnailFile,
      category,
      tags,
      price,
      shortDescription,
      allergens
    });

    // Valider les fichiers
    if (glbFile) {
      const glbValidation = validateFile(glbFile);
      if (!glbValidation.valid) {
        console.log("❌ GLB file validation failed:", glbValidation.error);
        return NextResponse.json(
          { success: false, error: glbValidation.error },
          { status: 400 }
        );
      }
    }

    if (usdzFile) {
      const usdzValidation = validateFile(usdzFile);
      if (!usdzValidation.valid) {
        console.log("❌ USDZ file validation failed:", usdzValidation.error);
        return NextResponse.json(
          { success: false, error: usdzValidation.error },
          { status: 400 }
        );
      }
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

    // Variables pour les uploads
    let glbUrl: string | undefined;
    let glbPath: string | undefined;
    let usdzUrl: string | undefined;
    let usdzPath: string | undefined;
    let primaryFile: File = glbFile || usdzFile!;
    let primaryFilename: string = '';
    let primaryMimeType: SupportedMimeTypes = 'model/gltf-binary';

    // Upload GLB file
    if (glbFile) {
      const glbFilename = generateUniqueFilename(glbFile.name);
      console.log("☁️ Uploading GLB to Supabase Storage...");
      const glbUpload = await uploadFileToStorage(glbFile, glbFilename);
      glbUrl = glbUpload.url;
      glbPath = glbUpload.path;
      console.log("✅ GLB upload successful:", { glbUrl, glbPath });
      
      // Le GLB devient le fichier principal
      primaryFile = glbFile;
      primaryFilename = glbFilename;
      primaryMimeType = getMimeTypeFromFilename(glbFilename) as SupportedMimeTypes;
    }

    // Upload USDZ file
    if (usdzFile) {
      const usdzFilename = generateUniqueFilename(usdzFile.name);
      console.log("☁️ Uploading USDZ to Supabase Storage...");
      const usdzUpload = await uploadFileToStorage(usdzFile, usdzFilename);
      usdzUrl = usdzUpload.url;
      usdzPath = usdzUpload.path;
      console.log("✅ USDZ upload successful:", { usdzUrl, usdzPath });
      
      // Si pas de GLB, le USDZ devient le fichier principal
      if (!glbFile) {
        primaryFile = usdzFile;
        primaryFilename = usdzFilename;
        primaryMimeType = getMimeTypeFromFilename(usdzFilename) as SupportedMimeTypes;
      }
    }

    // Upload thumbnail if provided
    if (thumbnailFile) {
      console.log("☁️ Uploading thumbnail to Supabase Storage...");
      const thumbnailFilename = generateUniqueFilename(thumbnailFile.name);
      const thumbnailUpload = await uploadFileToStorage(thumbnailFile, thumbnailFilename, 'thumbnails');
      thumbnailUrl = thumbnailUpload.url;
      thumbnailPath = thumbnailUpload.path;
      console.log("✅ Thumbnail upload successful:", { thumbnailUrl, thumbnailPath });
    }

    // Calculer le nom du modèle à partir des fichiers
    const modelName = glbFile ? 
      glbFile.name.replace(/\.[^/.]+$/, "") : 
      usdzFile!.name.replace(/\.[^/.]+$/, "");

    // Add to database
    console.log("💾 Adding to database...");
    const model = await addModel(
      primaryFilename,
      modelName,
      primaryFile.size,
      primaryMimeType,
      glbPath || usdzPath!,
      glbUrl || usdzUrl!,
      thumbnailUrl,
      thumbnailPath,
      glbUrl,
      glbPath,
      usdzUrl,
      usdzPath,
      category,
      tags,
      price,
      shortDescription,
      allergens
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
    
    // Ensure we always return valid JSON
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur lors du téléchargement" 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 