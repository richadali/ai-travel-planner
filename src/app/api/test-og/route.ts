import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = config.app.baseUrl.replace(/\/$/, '');
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent('Test Title')}&destination=${encodeURIComponent('Paris')}&duration=5&budget=10000&currency=${encodeURIComponent('€')}&sharedBy=${encodeURIComponent('Test User')}`;
    
    // Try to fetch the OG image
    const response = await fetch(ogImageUrl);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        url: ogImageUrl,
        error: `Failed to fetch OG image: ${response.status} ${response.statusText}`
      }, { status: 500 });
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type');
    
    return NextResponse.json({
      success: true,
      url: ogImageUrl,
      contentType,
      message: 'OG image generated successfully'
    });
  } catch (error) {
    console.error('Error testing OG image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 