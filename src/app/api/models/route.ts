import { NextResponse } from "next/server";
import { getAllModels } from "@/lib/models";
import { ModelsResponse, convertSupabaseToModel, SupabaseModel } from "@/types/model";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    
    const models = await getAllModels();
    
    // Filtrer par restaurant si l'ID est fourni
    const filteredModels = restaurantId 
      ? models.filter(model => model.restaurantId === restaurantId)
      : models;
    
    console.log(`📊 API Models: ${filteredModels.length}/${models.length} modèles retournés ${restaurantId ? `pour restaurant ${restaurantId}` : '(tous restaurants)'}`);
    
    const response: ModelsResponse = {
      models: filteredModels,
      total: filteredModels.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des modèles" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 