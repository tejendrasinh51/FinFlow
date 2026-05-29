import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

export const alt = 'FinFlow Analytics — Real-Time Financial Intelligence';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#080C14',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0, 212, 255, 0.1) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
            zIndex: 0,
          }}
        />

        {/* Header (Branding) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '2px solid #00D4FF',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                backgroundColor: '#00D4FF',
                transform: 'rotate(45deg)',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#E8EDF5',
              letterSpacing: '1px',
            }}
          >
            FINFLOW
          </span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#3A4A5C',
              margin: '0 12px',
            }}
          >
            /
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#7A8BA0',
              letterSpacing: '2px',
            }}
          >
            ANALYTICS
          </span>
        </div>

        {/* Center Content (Title) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#E8EDF5',
              lineHeight: 1.15,
              letterSpacing: '-2px',
            }}
          >
            Unified financial
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '64px',
                fontWeight: 800,
                color: '#E8EDF5',
                lineHeight: 1.15,
                letterSpacing: '-2px',
              }}
            >
              intelligence,
            </span>
            <span
              style={{
                fontSize: '64px',
                fontWeight: 800,
                color: '#00D4FF',
                lineHeight: 1.15,
                letterSpacing: '-2px',
                marginLeft: '15px',
              }}
            >
              live.
            </span>
          </div>
        </div>

        {/* Footer (Stats block) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderTop: '1px solid rgba(0, 212, 255, 0.15)',
            paddingTop: '30px',
            zIndex: 1,
          }}
        >
          {[
            { value: '10K+ DAU', label: 'Daily Active Users' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '−60%', label: 'Reporting Time' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#00D4FF',
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#7A8BA0',
                  marginTop: '4px',
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
