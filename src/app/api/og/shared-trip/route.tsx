import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';
 
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from query params
    const destination = searchParams.get('destination') || 'Your Dream Destination';
    const duration = searchParams.get('duration') || '7-day';
    const owner = searchParams.get('owner') || 'a traveler';
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            padding: '40px',
            position: 'relative',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.3), transparent)',
            filter: 'blur(40px)',
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3), transparent)',
            filter: 'blur(50px)',
          }} />
          
          {/* Content container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '20px',
            position: 'relative',
            zIndex: 10,
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                padding: '10px 20px',
                borderRadius: '8px',
              }}>
                AI Travel Planner
              </div>
            </div>
            
            {/* Main content */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              gap: '40px',
            }}>
              {/* Left side - Text content */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '60%',
              }}>
                <h1 style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0',
                  marginBottom: '16px',
                  lineHeight: 1.1,
                }}>
                  {destination}
                </h1>
                
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'normal',
                  color: '#94a3b8',
                  margin: '0',
                  marginBottom: '24px',
                }}>
                  {duration} Itinerary
                </h2>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}>
                    {owner.charAt(0).toUpperCase()}
                  </div>
                  <p style={{
                    fontSize: '18px',
                    color: '#cbd5e1',
                    margin: 0,
                  }}>
                    Shared by {owner}
                  </p>
                </div>
              </div>
              
              {/* Right side - Visual element */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
              }}>
                <div style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Globe icon */}
                  <svg width="160" height="160" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  
                  {/* Decorative elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                  }} />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginTop: 'auto',
            }}>
              <div style={{
                padding: '12px 24px',
                backgroundColor: '#4f46e5',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: 'medium',
                color: 'white',
              }}>
                View Complete Itinerary
              </div>
            </div>
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