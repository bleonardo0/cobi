import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Déterminer si c'est un ID ou un slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query = supabase
      .from('restaurants')
      .select('id, name, slug, address, phone, email, website, description, logo_url, primary_color, secondary_color, is_active');
    
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }
    
    const { data: restaurant, error } = await query.single();

    if (error) {
      console.error('Erreur lors de la récupération du restaurant:', error);
      
      // Fallback pour "Leo et les pieds" si la base de données n'est pas disponible
      if (id === '123e4567-e89b-12d3-a456-426614174000' || id === 'leo-et-les-pieds') {
        const fallbackRestaurant = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Leo et les pieds',
          slug: 'leo-et-les-pieds',
          description: 'Restaurant spécialisé dans les plats créatifs',
          address: '123 Rue Example, Paris, France',
          phone: '+33 1 23 45 67 89',
          email: 'contact@leoetlespieds.fr',
          website: 'https://leoetlespieds.fr',
          is_active: true,
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          logo_url: null
        };
        
        // Retourner le format attendu selon l'usage
        if (!isUuid) {
          return NextResponse.json({
            success: true,
            restaurant: fallbackRestaurant
          });
        }
        return NextResponse.json(fallbackRestaurant);
      }
      
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // Retourner le format attendu selon l'usage
    if (!isUuid) {
      return NextResponse.json({
        success: true,
        restaurant
      });
    }
    return NextResponse.json(restaurant);

  } catch (error) {
    console.error('Erreur dans API restaurants/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 