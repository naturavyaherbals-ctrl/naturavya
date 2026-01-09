import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Naturavya - 100% Safe Ayurvedic Wellness'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex', // Root must be flex
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fdfbf7',
        }}
      >
        {/* Left Side: Text Content */}
        <div
          style={{
            display: 'flex', // Must be flex
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '80px',
            width: '60%',
          }}
        >
          {/* Brand Badge */}
          <div
            style={{
              display: 'flex', // Must be flex
              alignItems: 'center',
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: 24,
              fontWeight: 600,
              alignSelf: 'flex-start',
              marginBottom: '20px',
            }}
          >
            🌿 100% Ayurvedic & Safe
          </div>

          {/* Main Headline */}
          <div
            style={{
              display: 'flex', // Must be flex
              fontSize: 72,
              fontWeight: 900,
              color: '#1a2e05',
              lineHeight: 1.1,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Naturavya
          </div>

          {/* Subheadline - Fixed multiline issue */}
          <div
            style={{
              display: 'flex', // FIXED: Added flex here
              flexDirection: 'column', // FIXED: Stack text vertically
              fontSize: 36,
              color: '#4b5563',
              lineHeight: 1.4,
              maxWidth: '90%',
            }}
          >
            <span>Premium Indian Wellness.</span>
            <span>Zero Side Effects.</span>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div
          style={{
            display: 'flex', // Must be flex
            width: '40%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Decorative Circle (Background Layer) */}
          <div
            style={{
              display: 'flex', // Even empty divs need flex sometimes in Satori
              position: 'absolute',
              width: '400px',
              height: '400px',
              backgroundColor: '#ecfccb',
              borderRadius: '50%',
              opacity: 0.5,
              right: '-50px',
              // No zIndex needed, it's first in DOM so it renders behind
            }}
          />
          
          {/* Product Placeholder (Foreground Layer) */}
          <div
            style={{
              display: 'flex', // Must be flex
              alignItems: 'center',
              justifyContent: 'center',
              width: '320px',
              height: '420px',
              backgroundColor: '#fff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '4px solid #fff',
              fontSize: '100px',
            }}
          >
           📦
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

