import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from query params or use defaults
    const destination = searchParams.get('destination') || 'Your Dream Destination';
    const duration = searchParams.get('duration') || '';
    const sharedBy = searchParams.get('sharedBy') || '';
    
    // Create a simple but effective OG image
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
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            AI Travel Planner
          </div>
          
          <div style={{ 
            fontSize: '64px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#ffffff',
          }}>
            {destination}
          </div>
          
          {duration && (
            <div style={{ 
              fontSize: '36px', 
              marginBottom: '30px', 
              color: '#94a3b8' 
            }}>
              {duration}-day Itinerary
            </div>
          )}
          
          <div style={{ 
            padding: '12px 24px',
            backgroundColor: '#4f46e5',
            borderRadius: '8px',
            fontSize: '24px',
            marginBottom: '15px',
          }}>
            Plan Your Perfect Trip
          </div>
          
          {sharedBy && (
            <div style={{ fontSize: '18px', color: '#94a3b8' }}>
              Shared by {sharedBy}
            </div>
          )}
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
    console.error('Error generating OG image:', e);
    
    // Return a text response on error
    return new Response('Failed to generate OG image', { status: 500 });
  }
} 