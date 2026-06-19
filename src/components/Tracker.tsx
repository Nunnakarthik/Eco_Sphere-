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
  Lock
} from 'lucide-react';

interface TrackerProps {
  loggedActionsToday: string[];
  points: number;
  streak: number;
  unlockedBadgeIds: string[];
  onToggleAction: (actionId: string) => void;
}

// Icon mapper for dynamic badges
const BadgeIcons: Record<string, React.ComponentType<any>> = {
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
  onToggleAction
}: TrackerProps) {

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
      
      {/* Habits Checklist */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Daily Green Habits</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Check actions you took today to reduce your footprint and earn points</p>
        </div>

        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {ECO_ACTIONS.map((action) => {
            const isChecked = loggedActionsToday.includes(action.id);
            const catColor = getCategoryColor(action.category);

            return (
              <div
                key={action.id}
                onClick={() => onToggleAction(action.id)}
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: '0.25rem' }}>
                <Flame size={28} fill="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{streak}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Daily Streak</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                <Star size={28} fill="var(--primary)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{points}</div>
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isUnlocked ? 'var(--bg-card)' : 'var(--bg-app)',
                    opacity: isUnlocked ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    position: 'relative'
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
                      transition: 'all 0.2s ease'
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
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
