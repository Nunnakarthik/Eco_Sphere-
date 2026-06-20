import { useState, useEffect, useRef } from 'react';
import type { AppState, UserInputs } from './types';
import { DEFAULT_APP_STATE, ECO_ACTIONS, BADGES } from './utils/constants';
import { calculateFootprint } from './utils/calculations';
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useCloudSync';

// Components
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Tracker from './components/Tracker';
import Simulator from './components/Simulator';
import Quiz from './components/Quiz';
import InfoModal from './components/InfoModal';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';

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
  X,
  LogOut,
  Cloud
} from 'lucide-react';

// ── Confetti Burst Component ──────────────────────────────────────────────────
const CONFETTI_COLORS = ['#10b981','#34d399','#f59e0b','#a78bfa','#38bdf8','#f43f5e','#fbbf24','#6ee7b7'];
function ConfettiBurst({ active, onDone }: { active: boolean; onDone: () => void }) {
  const particles = useRef<{ id: number; x: number; y: number; color: string; fallX: string; fallY: string; spin: string; dur: string }[]>([]);

  if (active && particles.current.length === 0) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;
    particles.current = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 30,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      fallX: `${(Math.random() - 0.5) * 320}px`,
      fallY: `${120 + Math.random() * 280}px`,
      spin: `${(Math.random() - 0.5) * 720}deg`,
      dur: `${0.8 + Math.random() * 0.7}s`,
    }));
  }
  if (!active) { particles.current = []; return null; }

  return (
    <>
      {particles.current.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.x, top: p.y,
            background: p.color,
            ['--fall-x' as string]: p.fallX,
            ['--fall-y' as string]: p.fallY,
            ['--spin' as string]: p.spin,
            ['--duration' as string]: p.dur,
          }}
          onAnimationEnd={p.id === 0 ? onDone : undefined}
        />
      ))}
    </>
  );
}

export default function App() {
  // Firebase Auth
  const authHook = useAuth();
  const { user, authLoading, signOut, isFirebaseConfigured } = authHook;

  // Guest mode — user chose to skip auth
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('ecosphere_guest_mode') === 'true';
  });

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ecosphere_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Welcome splash always shows on every page load (session-only flag).
  // User data (streaks, points, name) is still loaded from localStorage below.
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
      } catch {
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
  const [confettiActive, setConfettiActive] = useState(false);

  // Weekly Summary modal state
  const [weeklySummary, setWeeklySummary] = useState<{
    show: boolean; totalPoints: number; totalHabits: number; totalCO2: number;
  } | null>(null);

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

  // Persist guest mode preference
  useEffect(() => {
    localStorage.setItem('ecosphere_guest_mode', String(guestMode));
  }, [guestMode]);

  // Weekly Summary: show on Monday once per week
  useEffect(() => {
    const now = new Date();
    const isMonday = now.getDay() === 1;
    const weekNum = Math.ceil(now.getDate() / 7);
    const thisWeekKey = `ecosphere_weekly_shown_${now.getFullYear()}_W${weekNum}`;
    const alreadyShown = localStorage.getItem(thisWeekKey);
    if (isMonday && !alreadyShown && state.history.length > 0) {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      const lastWeekEntries = state.history.filter(h => h.date >= weekAgo);
      if (lastWeekEntries.length > 0) {
        const totalHabits = lastWeekEntries.reduce((s, e) => s + (e.actionsLogged?.length || 0), 0);
        const totalCO2 = lastWeekEntries.reduce((s, e) => s + (e.dailySavings || 0), 0);
        setWeeklySummary({ show: true, totalPoints: state.points, totalHabits, totalCO2 });
        localStorage.setItem(thisWeekKey, '1');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cloud sync — active only when user is logged in
  useCloudSync({ user, state, setState, isFirebaseConfigured });

  // When a user signs in, populate their display name if not already set
  useEffect(() => {
    if (user?.displayName && !state.userName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(prev => ({ ...prev, userName: user.displayName! }));
    }
  }, [user, state.userName]);

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
      // Keeps streak if they logged a habit yesterday OR if they attempted the quiz yesterday
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const keepsStreak = state.lastActiveDate === yesterday && (state.loggedActionsToday.length > 0 || state.quizAttemptedToday);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(prev => ({
        ...prev,
        history: [...prev.history, newHistoryEntry],
        loggedActionsToday: [], // Clear checklist
        quizAttemptedToday: false, // Reset daily quiz task
        streak: keepsStreak ? prev.streak : 0, // Reset streak if they missed logging yesterday
        lastActiveDate: todayStr
      }));
    } else if (!state.lastActiveDate) {
      // First visit ever
      setState(prev => ({ ...prev, lastActiveDate: todayStr }));
    }
  }, [state.lastActiveDate, state.loggedActionsToday, state.quizAttemptedToday]);

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
    if (!state.unlockedBadgeIds.includes('scholar') && state.perfectQuizzesCount >= 1) {
      newlyUnlockedIds.push('scholar');
    }

    // 5b. Trivia Master Badge (Quiz attempts >= 3)
    if (!state.unlockedBadgeIds.includes('trivia-master') && state.quizAttemptsCount >= 3) {
      newlyUnlockedIds.push('trivia-master');
    }

    // 5c. Quiz Grandmaster Badge (Perfect score >= 3)
    if (!state.unlockedBadgeIds.includes('grandmaster') && state.perfectQuizzesCount >= 3) {
      newlyUnlockedIds.push('grandmaster');
    }

    // 6. Champion Badge (Streak >= 5 days or Points >= 100)
    if (!state.unlockedBadgeIds.includes('champion') && (state.streak >= 5 || state.points >= 100)) {
      newlyUnlockedIds.push('champion');
    }

    if (newlyUnlockedIds.length > 0) {
      // Find the name of the badge for notification
      const badgeDetails = BADGES.find(b => b.id === newlyUnlockedIds[0]);
      if (badgeDetails) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBadgeToast(`🎉 Unlocked Achievement: "${badgeDetails.name}"!`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfettiActive(true);
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
    state.perfectQuizzesCount,
    state.quizAttemptsCount,
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
      if (newLogged.length === 0 && !state.quizAttemptedToday) {
        newStreak = state.streak > 0 ? Math.max(0, state.streak - 1) : 0;
      }
    } else {
      // Add action
      newLogged.push(actionId);
      newPoints += action.points;

      // Update Streak on first daily activity
      const alreadyActiveToday = state.loggedActionsToday.length > 0 || state.quizAttemptedToday;
      if (!alreadyActiveToday) {
        newStreak = state.streak > 0 ? state.streak + 1 : 1;
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
    const isPerfect = score === 1;
    const todayStr = new Date().toISOString().split('T')[0];

    setState(prev => {
      let newStreak = prev.streak;

      // Update Streak on first daily activity
      const alreadyActiveToday = prev.loggedActionsToday.length > 0 || prev.quizAttemptedToday;
      if (!alreadyActiveToday) {
        newStreak = prev.streak > 0 ? prev.streak + 1 : 1;
      }

      return {
        ...prev,
        quizCompleted: true,
        quizScore: score,
        quizAttemptedToday: true,
        quizAttemptsCount: prev.quizAttemptsCount + 1,
        perfectQuizzesCount: isPerfect ? prev.perfectQuizzesCount + 1 : prev.perfectQuizzesCount,
        // Award exactly 1 point if they got all correct (isPerfect), otherwise 0
        points: isPerfect ? prev.points + 1 : prev.points,
        streak: newStreak,
        lastActiveDate: todayStr
      };
    });
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

  // Auth loading spinner
  if (authLoading && isFirebaseConfigured) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: 'var(--bg-app)', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Loading EcoSphere…</p>
      </div>
    );
  }

  // Show Auth screen if user is not logged in and not in guest mode
  if (!user && !guestMode) {
    return (
      <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh' }}>
        <AuthScreen
          auth={authHook}
          onContinueAsGuest={() => {
            setGuestMode(true);
            setShowWelcome(true);
          }}
        />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)', justifyContent: 'center' }}>
        <WelcomeScreen 
          defaultName={state.userName}
          onContinue={(name) => {
            setState(prev => ({ ...prev, userName: name }));
            setShowWelcome(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>

      {/* Confetti Burst on badge unlock */}
      <ConfettiBurst active={confettiActive} onDone={() => setConfettiActive(false)} />

      {/* Weekly Summary Modal (fires on Mondays) */}
      {weeklySummary?.show && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9998, padding: '1.5rem'
        }}>
          <div className="weekly-summary-modal" style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Your Weekly Eco Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Here&apos;s what you achieved last week!</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{weeklySummary.totalHabits}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Habits Logged</div>
              </div>
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{weeklySummary.totalCO2.toFixed(1)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>kg CO₂ Saved</div>
              </div>
              <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{weeklySummary.totalPoints}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Points</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {weeklySummary.totalHabits >= 10 ? '🌟 Incredible week! You are a true Eco Champion!' :
               weeklySummary.totalHabits >= 5  ? '🌱 Great effort! Keep building those green habits!' :
                                                 '💪 Every action counts. Let us go even bigger this week!'}
            </p>
            <button
              onClick={() => setWeeklySummary(null)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Let's Crush This Week! 🚀
            </button>
          </div>
        </div>
      )}

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', padding: '0 2.5rem', width: '100%' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
                <Leaf size={24} fill="var(--primary)" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                EcoSphere
              </span>
            </div>
          </div>

          {/* Navigation tabs list */}
          <nav role="navigation" aria-label="Main Navigation">
            <ul style={{ display: 'flex', listStyle: 'none', gap: '1.5rem' }}>
              <li>
                <button
                  id="nav-dashboard-btn"
                  className="nav-tab-btn"
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
                  id="nav-calculator-btn"
                  className="nav-tab-btn"
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
                  id="nav-tracker-btn"
                  className="nav-tab-btn"
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
                  id="nav-simulator-btn"
                  className="nav-tab-btn"
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
                  id="nav-quiz-btn"
                  className="nav-tab-btn"
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

          {/* Action buttons (Theme Toggle, Learn, Sign Out) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              id="theme-toggle-btn"
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
              id="learn-more-btn"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '0.25rem' }}
            >
              <Info size={14} />
              Learn More
            </button>

            {/* Sign Out / Log Out button (shown when logged in or in guest mode) */}
            {(user || guestMode) && (
              <button
                id="signout-btn"
                onClick={async () => {
                  if (user) {
                    await signOut();
                  }
                  setGuestMode(false);
                  setShowWelcome(true);
                }}
                title={user ? "Sign out of your account" : "Exit guest session"}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                }}
              >
                <LogOut size={15} />
                {user ? "Sign Out" : "Log Out"}
              </button>
            )}

            {/* Switch to Account button (shown only in guest mode) */}
            {guestMode && isFirebaseConfigured && (
              <button
                id="switch-to-account-btn"
                onClick={() => {
                  setGuestMode(false);
                  setShowWelcome(false);
                }}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', gap: '0.25rem' }}
              >
                <Cloud size={14} />
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Body container */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        
        {/* Render Tab Contents — slides in on tab change */}
        <div className="tab-slide-in" key={activeTab} style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              breakdown={footprintBreakdown}
              streak={state.streak}
              unlockedBadgesCount={state.unlockedBadgeIds.length}
              dailySavingsToday={totalDailySavings}
              userName={state.userName}
              darkMode={darkMode}
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

                  {/* Plain language comparison */}
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                    border: '1px dashed var(--primary)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.4',
                    textAlign: 'left'
                  }}>
                    🎈 <strong>In Plain Words:</strong> This is equal to releasing the weight of <strong>{(footprintBreakdown.totalTons / 1.2).toFixed(1)} small cars</strong> of carbon gas into the atmosphere each year! Let's work together to get this lower! 🌏
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
              history={state.history}
              perfectQuizzesCount={state.perfectQuizzesCount}
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
              quizAttemptedToday={state.quizAttemptedToday}
              streak={state.streak}
              points={state.perfectQuizzesCount}
            />
          )}
        </div>
      </main>

      <footer 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderTop: '1px solid var(--border)', 
          padding: '0.65rem 0',
          transition: 'background-color 0.3s ease',
          fontSize: '0.75rem',
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



      {/* Interactive Waving Plant Mascot */}
      <FloatingMascot userName={state.userName} />
    </div>
  );
}

interface FloatingMascotProps {
  userName: string;
}

function FloatingMascot({ userName }: FloatingMascotProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const messages = [
    "Hi! I'm Sprouty, your eco-buddy! 🌿",
    "Wow, look at all those green habits! 🌱",
    "Let's save some CO₂ today! 🌍",
    "You are doing an amazing job, buddy! ✨",
    "Keep it up! The planet is cheering for you! 🌸",
    "Be the change you want to see! 🌟",
    "Water me with eco actions! 💧"
  ];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBouncing) return;
    setIsBouncing(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      setMessageIndex(0);
    } else {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }
    setTimeout(() => setIsBouncing(false), 800);
  };

  const showBubble = !hasInteracted || showTooltip || isBouncing;
  const currentMessage = hasInteracted 
    ? messages[messageIndex] 
    : `Hi, ${userName || "buddy"}! 🌿`;

  return (
    <div
      id="plant-mascot-container"
      style={{
        position: 'fixed',
        /* Horizontal center of the left gutter: (viewport - 1200px content) / 4 */
        left: 'calc((100vw - min(100vw, 1200px)) / 4)',
        /* Bottom area of the viewport */
        bottom: '40px',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        userSelect: 'none',
      }}
    >
      {/* Inner wrapper: bounce animation lives here so it never overrides translateX(-50%) above */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={isBouncing ? 'sprouty-bounce' : ''}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        }}
        title="Click me for a friendly message!"
      >
      {/* Floating Sparkles */}
      <div className="particle-1" style={{ position: 'absolute', top: '20px', left: '-15px', color: 'var(--primary)', pointerEvents: 'none', fontSize: '0.9rem' }}>✦</div>
      <div className="particle-2" style={{ position: 'absolute', top: '-8px', left: '85px', color: 'var(--secondary)', pointerEvents: 'none', fontSize: '0.8rem' }}>✨</div>
      <div className="particle-3" style={{ position: 'absolute', top: '40px', left: '75px', color: '#10b981', pointerEvents: 'none', fontSize: '0.7rem' }}>✦</div>

      {showBubble && (
        <div className="speech-bubble">{currentMessage}</div>
      )}

      <svg width="110" height="138" viewBox="0 0 80 100" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="topSproutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>

        {/* Soil */}
        <ellipse cx="40" cy="58" rx="20" ry="4" fill="#451a03" />

        {/* Stem */}
        <path d="M40 58 Q40 30 35 15" fill="none" stroke="#047857" strokeWidth="4" strokeLinecap="round" />

        {/* Left Leaf (waving) */}
        <g className="leaf-left-wave" style={{ transformOrigin: '38px 40px' }}>
          <path d="M38 40 C20 35 15 20 38 25 C38 25 35 35 38 40" fill="url(#leafGrad)" />
          <path d="M38 40 Q28 30 38 25" fill="none" stroke="#065f46" strokeWidth="1" />
        </g>

        {/* Right Leaf (waving) */}
        <g className="leaf-right-wave" style={{ transformOrigin: '39px 30px' }}>
          <path d="M39 30 C55 25 60 10 39 15 C39 15 42 25 39 30" fill="url(#leafGrad)" />
          <path d="M39 30 Q47 20 39 15" fill="none" stroke="#065f46" strokeWidth="1" />
        </g>

        {/* Top Sprout */}
        <g className="leaf-top-sway" style={{ transformOrigin: '35px 15px' }}>
          <path d="M35 15 C30 5 45 0 35 15" fill="url(#topSproutGrad)" />
        </g>

        {/* Pot */}
        <path d="M25 80 L55 80 L60 60 L20 60 Z" fill="url(#potGrad)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
        <rect x="18" y="56" width="44" height="6" rx="3" fill="url(#rimGrad)" />

        {/* Cute Face */}
        <g className="sprouty-eye">
          <circle cx="33" cy="68" r="3.5" fill="#1e293b" />
          <circle cx="32" cy="66.5" r="1" fill="#ffffff" />
        </g>
        <g className="sprouty-eye">
          <circle cx="47" cy="68" r="3.5" fill="#1e293b" />
          <circle cx="46" cy="66.5" r="1" fill="#ffffff" />
        </g>
        {/* Rosy Cheeks */}
        <circle cx="28" cy="71" r="2.5" fill="#f43f5e" opacity="0.5" />
        <circle cx="52" cy="71" r="2.5" fill="#f43f5e" opacity="0.5" />
        {/* Smile */}
        <path d="M37 72.5 Q40 75.5 43 72.5" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      </div>
    </div>
  );
}
