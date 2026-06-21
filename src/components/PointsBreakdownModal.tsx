import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';

interface PointsBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  todayHabitsPoints: number;
  todayActions: Array<{ id: string; name: string; points: number }>;
  pastHabitsPoints: number;
  pastActionsList: Array<{ id: string; name: string; count: number; pointsPerItem: number; totalPoints: number }>;
  quizPoints: number;
  perfectQuizzesCount: number;
  adjustmentPoints: number;
}

export default function PointsBreakdownModal({
  isOpen,
  onClose,
  points,
  todayHabitsPoints,
  todayActions,
  pastHabitsPoints,
  pastActionsList,
  quizPoints,
  perfectQuizzesCount,
  adjustmentPoints
}: PointsBreakdownModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          maxWidth: '540px',
          maxHeight: '85vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} fill="var(--primary)" color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Eco Points Achievement Log</h3>
          </div>
          <button 
            id="points-breakdown-close-x"
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

        {/* Scrollable Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          
          {/* Total Summary Banner */}
          <div style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Total Eco Points Earned</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{points}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Here is a detailed breakdown of your environmental achievements:</span>
          </div>

          {/* Today's Habits section */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Today's Habits</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>+{todayHabitsPoints} pts</span>
            </h4>
            {todayActions.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No habits completed today yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {todayActions.map(action => (
                  <div key={action.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.4rem 0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
                    <span style={{ color: 'var(--text-main)', paddingRight: '0.5rem' }}>{action.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>+{action.points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Habits section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Past Habits (All-Time)</span>
              <span style={{ fontSize: '0.85rem' }}>+{pastHabitsPoints} pts</span>
            </h4>
            {pastActionsList.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No historical habits logged yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {pastActionsList.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.4rem 0.5rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--text-main)' }}>{item.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Logged {item.count} time{item.count > 1 ? 's' : ''} ({item.pointsPerItem} pts each)</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>+{item.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trivia Quizzes section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Trivia Quizzes</span>
              <span style={{ fontSize: '0.85rem' }}>+{quizPoints} pts</span>
            </h4>
            {perfectQuizzesCount === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No perfect quiz completions yet.</div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.4rem 0.5rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-main)' }}>Perfect Score Daily Quizzes</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed {perfectQuizzesCount} quiz{perfectQuizzesCount > 1 ? 'zes' : ''} with 100% (1 pt each)</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>+{quizPoints} pts</span>
              </div>
            )}
          </div>

          {/* Adjustment / Welcome Bonus section if present */}
          {adjustmentPoints !== 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Welcome & Achievement Bonuses</span>
                <span style={{ fontSize: '0.85rem' }}>{adjustmentPoints > 0 ? `+${adjustmentPoints}` : adjustmentPoints} pts</span>
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.4rem 0.5rem', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Profile sign-up & badge rewards</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{adjustmentPoints > 0 ? `+${adjustmentPoints}` : adjustmentPoints} pts</span>
              </div>
            </div>
          )}

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
            id="points-breakdown-close-btn"
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
