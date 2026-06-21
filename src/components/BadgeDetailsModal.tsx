import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Lock, Award, Compass, Bike, Leaf, Zap, GraduationCap,
  type LucideIcon 
} from 'lucide-react';
import type { Badge } from '../types';

interface BadgeDetailsModalProps {
  badge: Badge | null;
  unlockedBadgeIds: string[];
  onClose: () => void;
}

const BadgeIcons: Record<string, LucideIcon> = {
  Compass,
  Bike,
  Leaf,
  Zap,
  GraduationCap,
  Award
};

const cheerUpMessages: Record<string, string> = {
  'starter': 'Welcome to your green journey, buddy! You\'ve taken the first step by calculating your footprint. Keep it up! 🌿',
  'commuter': 'Well done buddy! You\'re saving emissions and staying active. Keep up the active commuting! 🚲',
  'chef': 'Superb job, buddy! Eating plant-based makes a massive difference for the planet. Keep cooking green! 🥗',
  'energy': 'Watt a champion! You\'re mastering electricity efficiency. Keep up the power-saving wizardry! ⚡',
  'scholar': 'Brilliant mind! You scored 100% on the trivia quiz. Keep sharing your knowledge and keeping the planet smart! 🎓',
  'trivia-master': 'Fantastic dedication, buddy! You are a daily learning master. Keep testing your climate wits! 📚',
  'grandmaster': 'Legendary score, buddy! Three perfect daily quizzes. You are officially an eco expert! 🏆',
  'champion': 'Incredible milestone, buddy! You\'ve reached a 5-day streak or 100 points. You are a true leader of the green movement! ⭐'
};

export default function BadgeDetailsModal({
  badge,
  unlockedBadgeIds,
  onClose
}: BadgeDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!badge) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [badge, onClose]);

  if (!badge) return null;

  const isUnlocked = unlockedBadgeIds.includes(badge.id);
  const IconComp = BadgeIcons[badge.iconName] || Award;
  const cheerUp = cheerUpMessages[badge.id] || 'Fantastic progress, buddy! Keep up the amazing work! 🌟';

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Modal Card */}
      <div 
        ref={modalRef}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s ease-out'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Achievement Details
          </span>
          <button 
            id="badge-detail-close-x"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              width: 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
          
          {/* Badge Icon wrapper */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isUnlocked ? 'var(--primary-light)' : 'var(--border)',
              color: isUnlocked ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: isUnlocked ? '0 0 15px rgba(16, 185, 129, 0.35)' : 'none',
              position: 'relative'
            }}
          >
            <IconComp size={36} />
            {!isUnlocked && (
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                color: 'var(--text-muted)'
              }}>
                <Lock size={12} />
              </div>
            )}
          </div>

          {/* Info Text */}
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
              {badge.name}
            </h3>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: isUnlocked ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isUnlocked ? 'var(--primary-light)' : 'var(--bg-app)',
              padding: '2px 8px',
              borderRadius: '50px',
              border: isUnlocked ? '1px solid var(--primary)' : '1px solid var(--border)'
            }}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>
            <strong>How to unlock:</strong> {badge.description}
          </p>

          {/* Cheerup / Motivational banner */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: isUnlocked ? 'var(--primary-light)' : 'var(--bg-app)',
            border: isUnlocked ? '1px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
            fontSize: '0.925rem',
            lineHeight: '1.5',
            fontWeight: 500,
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            width: '100%'
          }}>
            {isUnlocked ? (
              <span>
                <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  🎉 Achievement Unlocked!
                </strong>
                {cheerUp}
              </span>
            ) : (
              <span>
                <strong style={{ color: 'var(--text-muted)', display: 'block', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  🔒 Locked Achievement
                </strong>
                This badge is locked, but you are getting closer every day! Complete the requirements above to unlock it. You\'ve got this, buddy!
              </span>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-app)'
        }}>
          <button 
            id="badge-detail-close-btn"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem', margin: 0 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
