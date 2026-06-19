import { useState, useEffect } from 'react';
import type { AppState, UserInputs } from './types';
import { DEFAULT_APP_STATE, ECO_ACTIONS, BADGES } from './utils/constants';
import { calculateFootprint } from './utils/calculations';

// Components
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Tracker from './components/Tracker';
import Simulator from './components/Simulator';
import Quiz from './components/Quiz';
import InfoModal from './components/InfoModal';
import WelcomeScreen from './components/WelcomeScreen';

// Icons
import {
  Leaf,
  LayoutDashboard,
  Calculator as CalcIcon,
  CalendarCheck,
  TrendingDown,
  GraduationCap,
  Sun,
  Moon,
  Info,
  X
} from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ecosphere_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Welcome screen splash state
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  // Global app state
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ecosphere_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure defaults are present in loaded state
        return {
          ...DEFAULT_APP_STATE,
          ...parsed,
          inputs: { ...DEFAULT_APP_STATE.inputs, ...parsed.inputs }
        };
      } catch (e) {
        return DEFAULT_APP_STATE;
      }
    }
    return DEFAULT_APP_STATE;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'tracker' | 'simulator' | 'quiz'>('dashboard');

  // Scientific explanation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Badge notification banner state
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  // Apply dark/light theme to document elements
  useEffect(() => {
    localStorage.setItem('ecosphere_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Persist state to localstorage
  useEffect(() => {
    localStorage.setItem('ecosphere_state', JSON.stringify(state));
  }, [state]);

  // Check for calendar day rollover on mount and reset daily tasks
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (state.lastActiveDate && state.lastActiveDate !== todayStr) {
      // It's a new day! Archive yesterday's habits
      const totalDailySavings = ECO_ACTIONS
        .filter(action => state.loggedActionsToday.includes(action.id))
        .reduce((sum, action) => sum + action.co2Savings, 0);

      const newHistoryEntry = {
        date: state.lastActiveDate,
        actionsLogged: [...state.loggedActionsToday],
        dailySavings: totalDailySavings
      };

      // Check if they missed a consecutive day (streak breaker)
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const keepsStreak = state.lastActiveDate === yesterday && state.loggedActionsToday.length > 0;

      setState(prev => ({
        ...prev,
        history: [...prev.history, newHistoryEntry],
        loggedActionsToday: [], // Clear checklist
        streak: keepsStreak ? prev.streak : 0, // Reset streak if they missed logging yesterday
        lastActiveDate: todayStr
      }));
    } else if (!state.lastActiveDate) {
      // First visit ever
      setState(prev => ({ ...prev, lastActiveDate: todayStr }));
    }
  }, [state.lastActiveDate, state.loggedActionsToday]);

  // Badge unlocking checks
  useEffect(() => {
    if (!state.hasCalculated) return;

    const newlyUnlockedIds: string[] = [];

    // Helper to count historical + today logs of an action
    const countActionOccurrences = (actionId: string) => {
      const histCount = state.history.filter(h => h.actionsLogged.includes(actionId)).length;
      const todayCount = state.loggedActionsToday.includes(actionId) ? 1 : 0;
      return histCount + todayCount;
    };

    // 1. Starter Badge (Calculator submitted)
    if (!state.unlockedBadgeIds.includes('starter') && state.hasCalculated) {
      newlyUnlockedIds.push('starter');
    }

    // 2. Commuter Badge (Transit logged >= 3 times)
    if (!state.unlockedBadgeIds.includes('commuter') && countActionOccurrences('transit') >= 3) {
      newlyUnlockedIds.push('commuter');
    }

    // 3. Chef Badge (Plant-based meals logged >= 3 times)
    if (!state.unlockedBadgeIds.includes('chef') && countActionOccurrences('plant-based') >= 3) {
      newlyUnlockedIds.push('chef');
    }

    // 4. Energy Badge (Standby/Cold wash logged >= 3 times)
    const energyActionsCount = countActionOccurrences('standby') + countActionOccurrences('cold-wash');
    if (!state.unlockedBadgeIds.includes('energy') && energyActionsCount >= 3) {
      newlyUnlockedIds.push('energy');
    }

    // 5. Scholar Badge (Quiz perfect score)
    if (!state.unlockedBadgeIds.includes('scholar') && state.quizScore === 5) {
      newlyUnlockedIds.push('scholar');
    }

    // 6. Champion Badge (Streak >= 5 days or Points >= 100)
    if (!state.unlockedBadgeIds.includes('champion') && (state.streak >= 5 || state.points >= 100)) {
      newlyUnlockedIds.push('champion');
    }

    if (newlyUnlockedIds.length > 0) {
      // Find the name of the badge for notification
      const badgeDetails = BADGES.find(b => b.id === newlyUnlockedIds[0]);
      if (badgeDetails) {
        setBadgeToast(`🎉 Unlocked Achievement: "${badgeDetails.name}"!`);
      }

      setState(prev => ({
        ...prev,
        unlockedBadgeIds: [...prev.unlockedBadgeIds, ...newlyUnlockedIds]
      }));
    }
  }, [
    state.hasCalculated,
    state.loggedActionsToday,
    state.history,
    state.quizScore,
    state.streak,
    state.points,
    state.unlockedBadgeIds
  ]);

  // Handler for calculator input modifications
  const handleInputsChange = (newInputs: UserInputs) => {
    setState(prev => ({
      ...prev,
      inputs: newInputs,
      hasCalculated: true
    }));
  };

  // Handler for checking/unchecking habits
  const handleToggleAction = (actionId: string) => {
    const action = ECO_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    const isCurrentlyChecked = state.loggedActionsToday.includes(actionId);
    const todayStr = new Date().toISOString().split('T')[0];

    let newLogged = [...state.loggedActionsToday];
    let newPoints = state.points;
    let newStreak = state.streak;

    if (isCurrentlyChecked) {
      // Remove action
      newLogged = newLogged.filter(id => id !== actionId);
      newPoints = Math.max(0, newPoints - action.points);
      
      // If they unchecked their last action for today, reduce streak check
      if (newLogged.length === 0 && state.lastActiveDate === todayStr) {
        // If streak was newly initiated today, revert it
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const wasConsecutive = state.history.length > 0 && state.history[state.history.length - 1].date === yesterday;
        newStreak = wasConsecutive ? Math.max(0, newStreak - 1) : 0;
      }
    } else {
      // Add action
      newLogged.push(actionId);
      newPoints += action.points;

      // Update Streak on first daily action
      if (state.loggedActionsToday.length === 0) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (state.lastActiveDate === yesterday) {
          newStreak += 1;
        } else if (state.lastActiveDate !== todayStr) {
          newStreak = 1; // start new streak
        }
      }
    }

    setState(prev => ({
      ...prev,
      loggedActionsToday: newLogged,
      points: newPoints,
      streak: newStreak,
      lastActiveDate: todayStr
    }));
  };

  // Handler for finishing the trivia quiz
  const handleQuizCompleted = (score: number) => {
    const isPerfect = score === 5;
    const bonus = isPerfect ? 50 : 0; // +50 pts bonus for 100% quiz accuracy

    setState(prev => ({
      ...prev,
      quizCompleted: true,
      quizScore: score,
      points: prev.points + score * 10 + bonus // +10 points per correct answer + bonus
    }));
  };

  const handleResetQuiz = () => {
    setState(prev => ({
      ...prev,
      quizCompleted: false,
      quizScore: null
    }));
  };

  // Run emissions engine
  const footprintBreakdown = calculateFootprint(state.inputs);
  const totalDailySavings = ECO_ACTIONS
    .filter(action => state.loggedActionsToday.includes(action.id))
    .reduce((sum, action) => sum + action.co2Savings, 0);

  if (showWelcome) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)', justifyContent: 'center' }}>
        <WelcomeScreen onContinue={() => setShowWelcome(false)} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      
      {/* Toast Badge alert */}
      {badgeToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--primary)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 9999,
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>{badgeToast}</span>
          <button 
            onClick={() => setBadgeToast(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Header navigation */}
      <header 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'background-color 0.3s ease'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <Leaf size={24} fill="var(--primary)" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              EcoSphere
            </span>
          </div>

          {/* Navigation tabs list */}
          <nav role="navigation" aria-label="Main Navigation">
            <ul style={{ display: 'flex', listStyle: 'none', gap: '0.25rem' }}>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    border: 'none',
                    background: activeTab === 'dashboard' ? 'var(--primary-light)' : 'none',
                    color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('calculator')}
                  aria-current={activeTab === 'calculator' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    border: 'none',
                    background: activeTab === 'calculator' ? 'var(--primary-light)' : 'none',
                    color: activeTab === 'calculator' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CalcIcon size={16} />
                  Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tracker')}
                  aria-current={activeTab === 'tracker' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    border: 'none',
                    background: activeTab === 'tracker' ? 'var(--primary-light)' : 'none',
                    color: activeTab === 'tracker' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CalendarCheck size={16} />
                  Habit Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('simulator')}
                  aria-current={activeTab === 'simulator' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    border: 'none',
                    background: activeTab === 'simulator' ? 'var(--primary-light)' : 'none',
                    color: activeTab === 'simulator' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <TrendingDown size={16} />
                  Simulator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('quiz')}
                  aria-current={activeTab === 'quiz' ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.9rem',
                    border: 'none',
                    background: activeTab === 'quiz' ? 'var(--primary-light)' : 'none',
                    color: activeTab === 'quiz' ? 'var(--primary)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <GraduationCap size={16} />
                  Quiz Center
                </button>
              </li>
            </ul>
          </nav>

          {/* Action buttons (Theme Toggle, Learn) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '0.25rem' }}
            >
              <Info size={14} />
              Learn More
            </button>
          </div>

        </div>
      </header>

      {/* Main Body container */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        
        {/* Render Tab Contents */}
        <div style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              breakdown={footprintBreakdown}
              streak={state.streak}
              unlockedBadgesCount={state.unlockedBadgeIds.length}
              dailySavingsToday={totalDailySavings}
            />
          )}

          {activeTab === 'calculator' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
              <Calculator
                inputs={state.inputs}
                onChange={handleInputsChange}
                onShowSources={() => setIsModalOpen(true)}
              />
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'stretch' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Instant Calculation</h3>
                
                <div style={{ 
                  backgroundColor: 'var(--bg-app)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    YOUR TOTAL CO₂e
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)', margin: '0.25rem 0' }}>
                    {footprintBreakdown.totalTons}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Metric Tons / Year
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>Sector Breakdown:</h4>
                <div style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🚗 Transport:</span>
                    <span style={{ fontWeight: 600 }}>{footprintBreakdown.transport.toLocaleString()} kg/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🏠 Home Energy:</span>
                    <span style={{ fontWeight: 600 }}>{footprintBreakdown.energy.toLocaleString()} kg/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>🥗 Food & Diet:</span>
                    <span style={{ fontWeight: 600 }}>{footprintBreakdown.food.toLocaleString()} kg/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>👜 Shopping & Consumption:</span>
                    <span style={{ fontWeight: 600 }}>{footprintBreakdown.shopping.toLocaleString()} kg/yr</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab('tracker')}
                    style={{ width: '100%' }}
                  >
                    Go Log Daily Habits & Save CO₂
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracker' && (
            <Tracker
              loggedActionsToday={state.loggedActionsToday}
              points={state.points}
              streak={state.streak}
              unlockedBadgeIds={state.unlockedBadgeIds}
              onToggleAction={handleToggleAction}
            />
          )}

          {activeTab === 'simulator' && (
            <Simulator currentInputs={state.inputs} />
          )}

          {activeTab === 'quiz' && (
            <Quiz
              onQuizCompleted={handleQuizCompleted}
              quizScore={state.quizScore}
              onResetQuiz={handleResetQuiz}
            />
          )}
        </div>
      </main>

      {/* Footer copyright */}
      <footer 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderTop: '1px solid var(--border)', 
          padding: '1.5rem 0',
          transition: 'background-color 0.3s ease',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>© {new Date().getFullYear()} EcoSphere. Empowering climate mindfulness.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Scientific Method</a>
            <a href="https://www.epa.gov/ghgemissions" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>US EPA Data</a>
            <a href="https://www.ipcc.ch/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>IPCC Reports</a>
          </div>
        </div>
      </footer>

      {/* Info Modal Component */}
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
