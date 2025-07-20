import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'edge';

// This route is specifically for the homepage OG image
export async function GET(request: NextRequest) {
  try {
    // Generate a dynamic OG image for the homepage
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
              fontSize: '72px',
              fontWeight: 'bold',
              margin: '0',
              marginBottom: '20px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            Plan Your Dream Trip
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
            Personalized AI Travel Itineraries
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
        headers: {
          'Cache-Control': 'public, max-age=3600, must-revalidate',
          'Content-Type': 'image/png',
        },
      },
    );
  } catch (e) {
    console.error(e);
    // If there's an error, return a 302 redirect to the static OG image
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/og.png',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Content-Type': 'image/png',
      },
    });
  }
} 