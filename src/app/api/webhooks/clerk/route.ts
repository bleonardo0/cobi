import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const headers = {
      'svix-id': request.headers.get('svix-id') ?? '',
      'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
      'svix-signature': request.headers.get('svix-signature') ?? '',
    };

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
    }

    let event;
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(payload, headers) as any;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
    }

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    console.log('🔔 Clerk webhook event:', event.type, 'for user:', email_addresses?.[0]?.email_address);

    switch (event.type) {
      case 'user.created':
        await handleUserCreated(id, email_addresses, first_name, last_name, image_url);
        break;
      case 'user.updated':
        await handleUserUpdated(id, email_addresses, first_name, last_name, image_url);
        break;
      case 'user.deleted':
        await handleUserDeleted(id);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleUserCreated(
  clerkId: string,
  email_addresses: any[],
  first_name: string,
  last_name: string,
  image_url: string
) {
  try {
    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      console.error('No email found for user:', clerkId);
      return;
    }

    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Utilisateur';

    // Essayer de trouver un restaurant associé par email exact
    let restaurantId = null;
    const { data: restaurantByEmail } = await supabaseAdmin
      .from('restaurants')
      .select('id, name')
      .eq('email', email)
      .single();

    if (restaurantByEmail) {
      restaurantId = restaurantByEmail.id;
      console.log(`🔗 Restaurant trouvé par email exact: ${restaurantByEmail.name}`);
    }

    // Créer l'utilisateur dans Supabase avec clerk_id
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkId,
        email,
        name,
        avatar_url: image_url,
        role: 'restaurateur', // Par défaut, les admins sont créés manuellement
        restaurant_id: restaurantId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return;
    }

    console.log('✅ User created in Supabase:', data);
  } catch (error) {
    console.error('Error in handleUserCreated:', error);
  }
}

async function handleUserUpdated(
  clerkId: string,
  email_addresses: any[],
  first_name: string,
  last_name: string,
  image_url: string
) {
  try {
    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      console.error('No email found for user:', clerkId);
      return;
    }

    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Utilisateur';

    // Mettre à jour l'utilisateur dans Supabase par clerk_id
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        email,
        name,
        avatar_url: image_url,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return;
    }

    console.log('✅ User updated in Supabase:', data);
  } catch (error) {
    console.error('Error in handleUserUpdated:', error);
  }
}

async function handleUserDeleted(clerkId: string) {
  try {
    // Supprimer l'utilisateur de Supabase par clerk_id
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('clerk_id', clerkId);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      return;
    }

    console.log('✅ User deleted from Supabase:', clerkId);
  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
  }
} 