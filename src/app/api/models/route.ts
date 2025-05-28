import { NextResponse } from "next/server";
import { getAllModels } from "@/lib/models";
import { ModelsResponse } from "@/types/model";

export async function GET() {
  try {
    const models = await getAllModels();
    
    const response: ModelsResponse = {
      models,
      total: models.length,
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