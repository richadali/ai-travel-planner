import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';
 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get title from query params or use default
    const title = searchParams.get('title') || 'AI Travel Planner';
    const destination = searchParams.get('destination') || 'Your Dream Destination';
    
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
    
    // Load the logo from the public directory
    const logoData = await fetch(new URL('../../../public/logo.png', import.meta.url)).then(
      (res) => res.arrayBuffer(),
    );
    
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
            }}
          >
            <img
              src={logoData as unknown as string}
              width={80}
              height={80}
              style={{
                borderRadius: '12px',
                marginRight: '16px',
              }}
              alt="AI Travel Planner Logo"
            />
            <div
              style={{
                fontSize: '30px',
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
          <h1
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              margin: '0',
              marginBottom: '20px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>
          <h2
            style={{
              fontSize: '40px',
              fontWeight: 'normal',
              margin: '0',
              marginBottom: '40px',
              color: '#94a3b8',
            }}
          >
            {destination}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'medium',
            }}
          >
            Plan Your Perfect Trip with AI
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