import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const filePath = path.join('/');
    
    console.log(`🔄 Proxying file: ${filePath}`);
    
    // Construct Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'models-3d';
    
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase URL not configured' },
        { status: 500 }
      );
    }
    
    const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    console.log(`📡 Fetching from: ${fullUrl}`);
    
    // Fetch from Supabase
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-Proxy/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch from Supabase: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get file content
    const arrayBuffer = await response.arrayBuffer();
    console.log(`✅ File fetched successfully: ${arrayBuffer.byteLength} bytes`);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.glb')) {
      contentType = 'model/gltf-binary';
    } else if (filePath.endsWith('.gltf')) {
      contentType = 'model/gltf+json';
    } else if (filePath.endsWith('.usdz')) {
      contentType = 'model/vnd.usdz+zip';
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filePath.endsWith('.webp')) {
      contentType = 'image/webp';
    }
    
    // Create response with proper headers
    const proxyResponse = new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
    });
    
    console.log(`🎉 Proxy response sent with Content-Type: ${contentType}`);
    return proxyResponse;
    
  } catch (error) {
    console.error('💥 Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Internal proxy error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 