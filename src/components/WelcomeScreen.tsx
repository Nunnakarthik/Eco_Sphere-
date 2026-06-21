import { useState } from 'react';
import { Droplet, Trees, Zap, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  defaultName?: string;
  onContinue: (name: string) => void;
}

const content = {
  title: 'Welcome to EcoSphere',
  returningTitle: 'Welcome back, {name}! 🌿',
  quote: '"We do not inherit the Earth from our ancestors; we borrow it from our children."',
  quoteAuthor: '— Native American Proverb',
  ecoTipsTitle: 'Daily Eco Tips',
  saveWaterTitle: 'Save water:',
  saveWaterText: 'Keep taps closed, repair minor leaks, and preserve water resources.',
  plantTreesTitle: 'Plant trees:',
  plantTreesText: 'Grow native trees and vegetation to naturally clean the air.',
  conserveElectricityTitle: 'Conserve electricity:',
  conserveElectricityText: 'Turn off lights and unplug chargers when not in use.',
  nameLabel: 'What should we call you? (e.g., Sarah)',
  nameLabelReturning: 'Confirm your display name:',
  placeholder: 'Enter your display name',
  btnGetStarted: 'Get Started',
  btnContinue: 'Continue to Dashboard'
};

export default function WelcomeScreen({ defaultName = '', onContinue }: WelcomeScreenProps) {
  const [name, setName] = useState(defaultName);

  const isReturningUser = Boolean(defaultName);

  const handleSubmit = () => {
    onContinue(name.trim() || defaultName || 'Eco Friend');
  };

  const getGreetingTitle = () => {
    if (isReturningUser) {
      return content.returningTitle.replace('{name}', defaultName);
    }
    return content.title;
  };

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Trees style={{ color: 'var(--primary)' }} size={24} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {getGreetingTitle()}
          </h1>
        </div>

        {/* Environmental Quote */}
        <blockquote
          style={{
            margin: '0',
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
            lineHeight: '1.4',
            fontWeight: 500,
            maxWidth: '440px'
          }}
        >
          {content.quote}
          <span style={{ display: 'block', fontSize: '0.75rem', fontStyle: 'normal', color: 'var(--text-muted)', marginTop: '0.15rem', fontWeight: 600 }}>
            {content.quoteAuthor}
          </span>
        </blockquote>

        {/* Image - Compacted */}
        <div style={{ margin: '0' }}>
          <img
            src="/eco_welcome.png"
            alt="Eco Sprout growing out of fertile soil illustration"
            style={{
              width: '90px',
              height: '90px',
              objectFit: 'contain',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-app)',
              padding: '0.35rem',
              border: '1px solid var(--border)',
              display: 'block'
            }}
          />
        </div>

        {/* Daily Eco Tips */}
        <div
          style={{
            width: '100%',
            textAlign: 'left',
            display: 'grid',
            gap: '0.6rem',
            backgroundColor: 'var(--bg-app)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}
        >
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', margin: '0 0 0.15rem 0' }}>
            {content.ecoTipsTitle}
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Droplet size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              <strong>{content.saveWaterTitle}</strong> {content.saveWaterText}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Trees size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              <strong>{content.plantTreesTitle}</strong> {content.plantTreesText}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Zap size={15} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              <strong>{content.conserveElectricityTitle}</strong> {content.conserveElectricityText}
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <label htmlFor="name-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            {isReturningUser ? content.nameLabelReturning : content.nameLabel}
          </label>
          <input
            id="name-input"
            type="text"
            className="form-control"
            placeholder={content.placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={18}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Continue Button */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.95rem',
            fontWeight: 600,
            gap: '0.5rem',
            marginTop: '0.15rem'
          }}
          aria-label="Continue to main carbon tracking dashboard"
        >
          {isReturningUser ? content.btnContinue : content.btnGetStarted}
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}
