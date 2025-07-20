import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';

// Route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from query params or use defaults
    const title = searchParams.get('title') || 'AI Travel Planner';
    const destination = searchParams.get('destination') || 'Your Dream Destination';
    const duration = searchParams.get('duration') || '';
    const budget = searchParams.get('budget') || '';
    const currency = searchParams.get('currency') || 'INR';
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
          
          <div style={{ fontSize: '36px', marginBottom: '30px', color: '#94a3b8' }}>
            {title}
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '20px',
            justifyContent: 'center',
          }}>
            {duration && (
              <div style={{ 
                padding: '10px 20px', 
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '8px', 
              }}>
                <span style={{ fontSize: '24px' }}>{duration} days</span>
              </div>
            )}
            
            {budget && (
              <div style={{ 
                padding: '10px 20px', 
                backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '24px' }}>{currency}{budget}</span>
              </div>
            )}
          </div>
          
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
          'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    
    // Return a simple error image
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
            backgroundColor: '#f43f5e',
            color: 'white',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            AI Travel Planner
          </div>
          <div style={{ fontSize: '24px' }}>
            Error generating image
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
        },
      },
    );
  }
} 