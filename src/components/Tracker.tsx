import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ECO_ACTIONS, BADGES } from '../utils/constants';
import { 
  Compass, 
  Bike, 
  Leaf, 
  Zap, 
  GraduationCap, 
  Award, 
  Flame, 
  Star, 
  Check,
  Lock,
  X,
  type LucideIcon
} from 'lucide-react';
import type { HistoryEntry, Badge } from '../types';

// ── Animated count-up hook ───────────────────────────────────────
function useCountUp(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const frame = useRef<number>(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else prev.current = target;
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return display;
}

interface TrackerProps {
  loggedActionsToday: string[];
  points: number;
  streak: number;
  unlockedBadgeIds: string[];
  onToggleAction: (actionId: string) => void;
  history: HistoryEntry[];
  perfectQuizzesCount: number;
}

// Icon mapper for dynamic badges
const BadgeIcons: Record<string, LucideIcon> = {
  Compass: Compass,
  Bike: Bike,
  Leaf: Leaf,
  Zap: Zap,
  GraduationCap: GraduationCap,
  Award: Award
};

export default function Tracker({
  loggedActionsToday,
  points,
  streak,
  unlockedBadgeIds,
  onToggleAction,
  history,
  perfectQuizzesCount
}: TrackerProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (showBreakdown || selectedBadge !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showBreakdown, selectedBadge]);

  const totalDailySavings = ECO_ACTIONS
    .filter(action => loggedActionsToday.includes(action.id))
    .reduce((sum, action) => sum + action.co2Savings, 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transport': return '#38bdf8'; // Blue
      case 'energy': return '#fbbf24';    // Amber
      case 'food': return '#10b981';      // Emerald
      default: return '#a78bfa';          // Purple
    }
  };

  // Points breakdown calculations
  const todayActions = ECO_ACTIONS.filter(action => loggedActionsToday.includes(action.id));
  const todayHabitsPoints = todayActions.reduce((sum, action) => sum + action.points, 0);

  // Historical calculations
  const pastActionCounts: Record<string, number> = {};
  history.forEach(entry => {
    if (entry.actionsLogged) {
      entry.actionsLogged.forEach(actionId => {
        pastActionCounts[actionId] = (pastActionCounts[actionId] || 0) + 1;
      });
    }
  });

  const pastActionsList = Object.entries(pastActionCounts).map(([id, count]) => {
    const action = ECO_ACTIONS.find(a => a.id === id);
    return {
      id,
      name: action ? action.name : 'Unknown Action',
      pointsPerItem: action ? action.points : 0,
      count,
      totalPoints: count * (action ? action.points : 0)
    };
  }).filter(item => item.count > 0);

  const pastHabitsPoints = pastActionsList.reduce((sum, item) => sum + item.totalPoints, 0);
  const quizPoints = perfectQuizzesCount * 1;
  const calculatedTotal = todayHabitsPoints + pastHabitsPoints + quizPoints;
  const adjustmentPoints = points - calculatedTotal;

  // ── Animated counters ─────────────────────────────────────────────
  const animatedPoints = useCountUp(points);
  const animatedStreak = useCountUp(streak);

  // ── Daily goal progress ring ───────────────────────────────────────
  const totalActions = ECO_ACTIONS.length;
  const completedToday = loggedActionsToday.length;
  const ringPct = totalActions > 0 ? completedToday / totalActions : 0;
  const RING_R = 38;
  const RING_CIRC = 2 * Math.PI * RING_R;

  // ── Badge progress helper ─────────────────────────────────────────
  const getBadgeProgress = (badgeId: string): { current: number; target: number } => {
    const transitCount = pastActionCounts['transit'] || 0;
    const plantCount = pastActionCounts['plant-based'] || 0;
    const energyCount = (pastActionCounts['thermostat'] || 0) + (pastActionCounts['cold-wash'] || 0) + (pastActionCounts['standby'] || 0);
    switch (badgeId) {
      case 'commuter':      return { current: Math.min(transitCount, 3), target: 3 };
      case 'chef':          return { current: Math.min(plantCount, 3), target: 3 };
      case 'energy':        return { current: Math.min(energyCount, 3), target: 3 };
      case 'scholar':       return { current: Math.min(perfectQuizzesCount, 1), target: 1 };
      case 'trivia-master': return { current: Math.min(history.length, 3), target: 3 };
      case 'grandmaster':   return { current: Math.min(perfectQuizzesCount, 3), target: 3 };
      case 'champion':      return { current: Math.min(Math.max(streak, Math.floor(points / 20)), 5), target: 5 };
      case 'starter':       return { current: 1, target: 1 }; // already unlocked if shown
      default:              return { current: 0, target: 1 };
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>

      {/* Habits Checklist */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Daily Green Habits 🌿</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Check actions you took today to reduce your footprint and earn points</p>
          <div style={{
            fontSize: '0.75rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--primary)',
            display: 'inline-block',
            fontWeight: 700
          }}>
            👉 Click checklist items to log savings!
          </div>
        </div>

        {/* ── Streak Warning ─────────────────────────────────────── */}
        {streak > 0 && completedToday === 0 && (
          <div className="streak-warning" style={{ marginBottom: '1rem' }}>
            <Flame size={18} fill="#f59e0b" />
            <span>Log at least one habit today to keep your <strong>{streak}-day streak</strong> alive!</span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {ECO_ACTIONS.map((action) => {
            const isChecked = loggedActionsToday.includes(action.id);
            const catColor = getCategoryColor(action.category);

            return (
              <div
                key={action.id}
                className="habit-row-item"
                onClick={() => onToggleAction(action.id)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleAction(action.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Checkbox circle */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isChecked ? `2px solid var(--primary)` : '2px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isChecked ? 'var(--primary)' : 'transparent',
                    color: '#fff',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {action.name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    <span style={{ 
                      color: catColor, 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      backgroundColor: `${catColor}15`,
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {action.category}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Saves {action.co2Savings} kg CO₂
                    </span>
                  </div>
                </div>

                {/* Points Badge */}
                <div style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isChecked ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <Star size={14} fill={isChecked ? 'var(--primary)' : 'none'} />
                  +{action.points} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Progress & Stats Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Log Progress</h3>
          
          {/* ── Daily Goal Progress Ring ─────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="45" cy="45" r={RING_R} fill="transparent" stroke="var(--border)" strokeWidth="7" />
                <circle
                  cx="45" cy="45" r={RING_R}
                  fill="transparent"
                  stroke={completedToday === totalActions ? '#10b981' : 'var(--primary)'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={RING_CIRC * (1 - ringPct)}
                  className="daily-ring-circle"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: completedToday === totalActions ? '#10b981' : 'var(--primary)' }}>{completedToday}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {totalActions}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {completedToday === totalActions ? '🎉 All Done!' : `Daily Goal ${Math.round(ringPct * 100)}%`}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div id="daily-streak-stats-card" style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.25rem' }}>
                <Flame size={28} fill="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{animatedStreak}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Daily Streak</div>
            </div>

            <div 
              id="eco-points-stats-card"
              style={{ 
                backgroundColor: 'var(--bg-app)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-sm)', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onClick={() => setShowBreakdown(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Click to view Eco Points breakdown"
            >
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                <Star size={28} fill="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{animatedPoints}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Eco Points</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>CO₂ Saved Today:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{totalDailySavings.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Badges Cabinet */}
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Unlocked Achievements</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadgeIds.includes(badge.id);
              const IconComp = BadgeIcons[badge.iconName] || Award;

              return (
                <div
                  key={badge.id}
                  id={`badge-card-${badge.id}`}
                  className={`sprout-hover ${isUnlocked ? 'sprout-animate-in' : ''}`}
                  onClick={() => setSelectedBadge(badge)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0.75rem',
                    border: isUnlocked ? '1px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isUnlocked ? 'var(--bg-card)' : 'var(--bg-app)',
                    opacity: isUnlocked ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'default'
                  }}
                  title={badge.description}
                >
                  {/* Badge Icon wrapper */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: isUnlocked ? 'var(--primary-light)' : 'var(--border)',
                      color: isUnlocked ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isUnlocked ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                  >
                    <IconComp size={22} />
                  </div>

                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      <Lock size={12} />
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isUnlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>
                    {badge.description}
                  </div>

                  {/* ── Badge Progress Bar (locked only) ─── */}
                  {!isUnlocked && (() => {
                    const prog = getBadgeProgress(badge.id);
                    const pct = prog.target > 0 ? Math.min(100, (prog.current / prog.target) * 100) : 0;
                    return (
                      <div style={{ width: '100%' }}>
                        <div className="badge-progress-bar-track">
                          <div
                            className="badge-progress-bar-fill"
                            style={{ '--progress-pct': `${pct}%` } as React.CSSProperties}
                          />
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 600 }}>
                          {prog.current}/{prog.target}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>

      {/* Points Breakdown Modal Overlay */}
      {showBreakdown && createPortal(
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
          <div style={{
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
                onClick={() => setShowBreakdown(false)}
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
                onClick={() => setShowBreakdown(false)}
                style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem', margin: 0 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Achievement Details Modal Overlay */}
      {selectedBadge !== null && (() => {
        const isUnlocked = unlockedBadgeIds.includes(selectedBadge.id);
        const IconComp = BadgeIcons[selectedBadge.iconName] || Award;
        
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

        const cheerUp = cheerUpMessages[selectedBadge.id] || 'Fantastic progress, buddy! Keep up the amazing work! 🌟';

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
            <div style={{
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
                  onClick={() => setSelectedBadge(null)}
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
                    {selectedBadge.name}
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
                  <strong>How to unlock:</strong> {selectedBadge.description}
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
                      This badge is locked, but you are getting closer every day! Complete the requirements above to unlock it. You've got this, buddy!
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
                  onClick={() => setSelectedBadge(null)}
                  style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem', margin: 0 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </>
  );
}
