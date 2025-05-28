import { Model3D } from "@/types/model";
import { generateSlug, getMimeTypeFromExtension } from "./utils";
import fs from "fs/promises";
import path from "path";

const MODELS_DIR = path.join(process.cwd(), "public", "models");
const MODELS_DATA_FILE = path.join(process.cwd(), "data", "models.json");

// Ensure directories exist
export async function ensureDirectories() {
  try {
    await fs.mkdir(MODELS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(MODELS_DATA_FILE), { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
}

// Load models from JSON file
export async function loadModels(): Promise<Model3D[]> {
  try {
    await ensureDirectories();
    const data = await fs.readFile(MODELS_DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save models to JSON file
export async function saveModels(models: Model3D[]): Promise<void> {
  try {
    await ensureDirectories();
    await fs.writeFile(MODELS_DATA_FILE, JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("Error saving models:", error);
    throw error;
  }
}

// Add a new model
export async function addModel(
  filename: string,
  originalName: string,
  fileSize: number
): Promise<Model3D> {
  const models = await loadModels();
  
  const model: Model3D = {
    id: Date.now().toString(),
    name: originalName.replace(/\.[^/.]+$/, ""), // Remove extension
    filename,
    url: `/models/${filename}`,
    fileSize,
    uploadDate: new Date().toISOString(),
    mimeType: getMimeTypeFromExtension(filename),
    slug: generateSlug(originalName),
  };

  models.push(model);
  await saveModels(models);
  
  return model;
}

// Get model by slug
export async function getModelBySlug(slug: string): Promise<Model3D | null> {
  const models = await loadModels();
  return models.find(model => model.slug === slug) || null;
}

// Get all models
export async function getAllModels(): Promise<Model3D[]> {
  return await loadModels();
}

// Delete a model
export async function deleteModel(id: string): Promise<boolean> {
  try {
    const models = await loadModels();
    const modelIndex = models.findIndex(model => model.id === id);
    
    if (modelIndex === -1) {
      return false;
    }

    const model = models[modelIndex];
    
    // Delete file from filesystem
    const filePath = path.join(MODELS_DIR, model.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn("Could not delete file:", filePath);
    }

    // Remove from models array
    models.splice(modelIndex, 1);
    await saveModels(models);
    
    return true;
  } catch (error) {
    console.error("Error deleting model:", error);
    return false;
  }
} 