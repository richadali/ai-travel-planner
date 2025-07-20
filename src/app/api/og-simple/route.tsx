import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get destination from query params or use default
    const destination = searchParams.get('destination') || 'Your Dream Destination';
    
    // Create a very simple OG image
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            padding: '40px',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            {destination}
          </div>
          <div style={{ fontSize: '32px' }}>
            AI Travel Planner
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'no-cache, no-store',
        },
      },
    );
  } catch (e) {
    console.error('Error generating simple OG image:', e);
    
    // Return a text response on error
    return new Response('Failed to generate OG image', { status: 500 });
  }
} 