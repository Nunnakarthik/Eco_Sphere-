import { Droplet, Trees, Zap, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div 
      className="container" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '85vh',
        padding: '2rem 1.5rem'
      }}
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: '600px', 
          width: '100%',
          textAlign: 'center', 
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Trees style={{ color: 'var(--primary)' }} size={28} />
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Welcome to EcoSphere
          </h1>
        </div>

        {/* Environmental Quote */}
        <blockquote 
          style={{ 
            margin: '0.5rem 0',
            fontStyle: 'italic', 
            fontSize: '1.05rem', 
            color: 'var(--text-main)', 
            lineHeight: '1.5',
            fontWeight: 500,
            maxWidth: '480px'
          }}
        >
          "We do not inherit the Earth from our ancestors; we borrow it from our children."
          <span style={{ display: 'block', fontSize: '0.85rem', fontStyle: 'normal', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
            — Native American Proverb
          </span>
        </blockquote>

        {/* Image */}
        <div style={{ margin: '0.5rem 0' }}>
          <img 
            src="/eco_welcome.png" 
            alt="Eco Sprout growing out of fertile soil illustration" 
            style={{ 
              width: '180px', 
              height: '180px', 
              objectFit: 'contain',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              padding: '0.5rem',
              border: '1px solid var(--border)',
              display: 'block'
            }} 
          />
        </div>

        {/* Eco Suggestions list */}
        <div 
          style={{ 
            width: '100%', 
            textAlign: 'left', 
            display: 'grid', 
            gap: '0.85rem',
            backgroundColor: 'var(--bg-app)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
            Daily Eco Tips
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Droplet size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              <strong>Save water:</strong> Keep taps closed, repair minor leaks, and preserve water resources for future generations.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Trees size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              <strong>Plant trees:</strong> Grow native trees and green vegetation to naturally capture carbon dioxide from the atmosphere.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Zap size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              <strong>Conserve electricity:</strong> Turn off lights when leaving rooms and unplug vampire chargers when not in use.
            </div>
          </div>
        </div>

        {/* Start button */}
        <button 
          className="btn btn-primary" 
          onClick={onContinue}
          style={{ 
            width: '100%', 
            padding: '0.85rem', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem',
            fontWeight: 600,
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}
          aria-label="Continue to main carbon tracking dashboard"
        >
          Get Started
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
}
