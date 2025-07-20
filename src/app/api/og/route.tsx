import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';

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
    
    // Use custom OG image if no specific parameters are provided
    if (!searchParams.has('title') && !searchParams.has('destination')) {
      // Redirect to the static OG image
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/og.png',
        },
      });
    }
    
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
            backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            padding: '40px 60px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                backgroundClip: 'text',
                color: 'transparent',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid #4f46e5',
              }}
            >
              AI Travel Planner
            </div>
          </div>
          
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              marginBottom: '30px',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                margin: '0',
                marginBottom: '20px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                background: 'linear-gradient(90deg, #ffffff, #e2e8f0)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {destination}
            </h1>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'normal',
                margin: '0',
                marginBottom: '30px',
                color: '#94a3b8',
              }}
            >
              {title}
            </h2>
            
            {/* Trip Details */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
                marginBottom: '20px',
              }}
            >
              {duration && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '18px', color: '#94a3b8' }}>Duration</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{duration} days</span>
                </div>
              )}
              
              {budget && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '18px', color: '#94a3b8' }}>Budget</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{currency}{budget}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                backgroundColor: '#4f46e5',
                borderRadius: '8px',
                fontSize: '24px',
                fontWeight: 'medium',
                marginBottom: '15px',
              }}
            >
              Plan Your Perfect Trip with AI
            </div>
            
            {sharedBy && (
              <div style={{ fontSize: '18px', color: '#94a3b8' }}>
                Shared by {sharedBy}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
} 