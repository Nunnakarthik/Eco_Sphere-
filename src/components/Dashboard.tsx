import { useState, useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { FootprintBreakdown } from '../utils/calculations';
import { Leaf, Flame, Award, TreePine, Lightbulb } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ECO_TIPS = [
  "🌍 A mature tree absorbs ~22 kg of CO₂ per year — plant one today!",
  "🚿 A 4-minute shower uses 4× less water than a bath.",
  "🥗 Going plant-based for one meal saves up to 2.5 kg CO₂.",
  "💡 Switching to LED lights cuts lighting energy use by 75%.",
  "🚲 Cycling 10 km instead of driving saves ~2.3 kg CO₂.",
  "♻️ Recycling one aluminium can saves energy to power a TV for 3 hours.",
  "🌿 Air-drying clothes instead of tumble drying saves ~2 kg CO₂ per load.",
  "🛍️ One reusable bag can replace 600 plastic bags over its lifetime.",
  "🌡️ Lowering your thermostat by 1°C saves ~10% on your heating bill.",
  "🍃 Local seasonal produce has up to 50× fewer food miles than imported goods.",
  "🐄 Beef produces 20× more CO₂ per protein gram than plant proteins.",
  "🔌 Unplugging devices on standby can save up to 10% of your electricity bill.",
  "🚂 A train emits up to 90% less CO₂ per mile than a domestic flight.",
  "🌊 Oceans absorb ~30% of CO₂ emitted — protecting marine ecosystems matters!",
  "🏭 1/3 of global emissions come from food systems — diet is powerful.",
  "🌳 Deforestation accounts for ~10% of global CO₂ emissions annually.",
  "☀️ Solar panels can reduce a home's carbon footprint by 1-2 tons/year.",
  "🧴 Choosing solid shampoo bars eliminates plastic bottle waste entirely.",
  "🍕 Reducing food waste by half would cut 1.5 billion tons of CO₂ yearly.",
  "🏃 Walking 30 min a day saves ~500 kg CO₂ and improves your health.",
  "📱 Keeping a phone for 4 years instead of 2 halves its lifecycle emissions.",
  "🌱 Composting diverts methane from landfills — a gas 28× stronger than CO₂.",
  "🚗 Electric vehicles produce 3× fewer lifetime emissions than gasoline cars.",
  "❄️ Setting your fridge to 4°C and freezer to -18°C is optimal efficiency.",
  "🧺 Cold water washing uses up to 90% less energy than hot water washing.",
  "🖨️ Going paperless in an office saves ~200 kg CO₂ per person per year.",
  "🌤️ Wind power produces ~98% fewer emissions than coal per kWh generated.",
  "🛁 A 5-minute shower saves 40+ litres of water versus a bath.",
  "🥩 Reducing red meat by one meal/week saves ~200 kg CO₂ annually.",
  "🌲 Forests cover 31% of Earth's land — every tree saved helps us all."
];

interface DashboardProps {
  breakdown: FootprintBreakdown;
  streak: number;
  unlockedBadgesCount: number;
  dailySavingsToday: number;
  userName: string;
  darkMode: boolean;
  hasCalculated: boolean;
  onNavigateToCalculator: () => void;
}


const REGIONAL_AVERAGES = {
  US: { name: 'US Average', value: 16.0, color: '#ef4444' },
  EU: { name: 'EU Average', value: 6.5, color: '#3b82f6' },
  UK: { name: 'UK Average', value: 5.2, color: '#a78bfa' },
  India: { name: 'India Average', value: 1.9, color: '#fbbf24' },
  Global: { name: 'Global Average', value: 4.7, color: '#64748b' }
};

export default function Dashboard({
  breakdown,
  streak,
  unlockedBadgesCount,
  dailySavingsToday,
  userName,
  darkMode,
  hasCalculated,
  onNavigateToCalculator
}: DashboardProps) {
  const [offsetPercent, setOffsetPercent] = useState(0);
  const [selectedInsightTab, setSelectedInsightTab] = useState<string | null>(null);
  const [benchmarkRegion, setBenchmarkRegion] = useState<'US' | 'EU' | 'UK' | 'India' | 'Global'>('US');
  const { transport, energy, food, shopping, totalTons } = breakdown;

  // Resolve theme colors for ChartJS canvas rendering
  const textColor = darkMode ? '#f1f5f9' : '#0f172a'; // Slate 100 vs Slate 900
  const textMuted = darkMode ? '#94a3b8' : '#64748b'; // Slate 400 vs Slate 500
  const gridColor = darkMode ? '#334155' : '#e2e8f0'; // Slate 700 vs Slate 200

  // Calculate Eco Score (out of 100)
  // 2 tons or less = 100 score. 20 tons or more = 10 score.
  const ecoScore = Math.max(
    10,
    Math.min(100, Math.round(100 - (Math.max(0, totalTons - 2) / 18) * 80))
  );

  // Get color and text based on footprint size
  const getRating = (tons: number) => {
    if (tons < 3.0) return { label: 'Climate Champion 🌟', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (tons < 6.0) return { label: 'Good Eco Citizen 👍', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.1)' };
    if (tons < 12.0) return { label: 'Moderate Footprint ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'High Carbon Footprint 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const rating = getRating(totalTons);

  // Daily Eco Tip (rotates by day of year)
  const dailyTip = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return ECO_TIPS[dayOfYear % ECO_TIPS.length];
  }, []);

  // Trees equivalent saved today (1 tree absorbs ~22kg CO2/year = 0.0603kg/day)
  const treesEquivalent = dailySavingsToday > 0
    ? (dailySavingsToday / 0.0603).toFixed(1)
    : '0.0';

  // Chart 1: Doughnut for Footprint breakdown
  const doughnutData = {
    labels: ['Transport', 'Home Energy', 'Food & Diet', 'Shopping & Goods'],
    datasets: [
      {
        data: [transport, energy, food, shopping],
        backgroundColor: [
          '#38bdf8', // Sky Blue for transport
          '#fbbf24', // Amber for energy
          '#34d399', // Emerald/Mint for food
          '#a78bfa'  // Purple for shopping
        ],
        borderWidth: 1,
        borderColor: 'var(--bg-card)'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: {
            family: 'Inter',
            size: 11
          },
          boxWidth: 12,
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: { raw: unknown; label: string }) {
            const val = context.raw as number;
            const pct = ((val / (transport + energy + food + shopping)) * 100).toFixed(1);
            return ` ${context.label}: ${val.toLocaleString()} kg CO₂ (${pct}%)`;
          }
        }
      }
    }
  };

  const selectedAvg = REGIONAL_AVERAGES[benchmarkRegion];

  // Chart 2: Bar chart comparing user vs benchmarks
  const barData = {
    labels: ['Your Footprint', 'Target (1.5°C Goal)', 'Global Avg', selectedAvg.name],
    datasets: [
      {
        label: 'Metric Tons CO₂ / year',
        data: [totalTons, 2.0, 4.7, selectedAvg.value],
        backgroundColor: [
          rating.color,
          '#10b981', // green for target
          '#94a3b8', // grey for global average
          selectedAvg.color
        ],
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context: { raw: unknown }) {
            return ` ${context.raw as number} metric tons`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textMuted,
          font: {
            family: 'Inter',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textMuted,
          font: {
            family: 'Inter'
          }
        }
      }
    }
  };

  if (!hasCalculated) {
    return (
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* ── Daily Eco Tip Card ───────────────────────────────────── */}
        <div className="eco-tip-card">
          <div style={{ flexShrink: 0, color: 'var(--primary)', marginTop: '2px' }}>
            <Lightbulb size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '3px' }}>Did You Know? — Eco Tip of the Day</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', fontWeight: 500 }}>{dailyTip}</div>
          </div>
        </div>

        {/* ── Welcome / Baseline Assessment Hero Card ────────────────── */}
        <div 
          className="card" 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(16,185,129,0.02) 100%)', 
            border: '1px dashed var(--primary)', 
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white', display: 'inline-flex', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
            <Leaf size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
              Welcome to EcoSphere, {userName || 'Eco Friend'}! 🌿
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
              EcoSphere tracks your lifestyle and translates it into your personal carbon footprint score. Calculate your carbon baseline to activate your dashboard, unlock insights, and start tracking your green habits!
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={onNavigateToCalculator}
            style={{ padding: '0.8rem 1.75rem', fontSize: '1.05rem', fontWeight: 700, gap: '0.5rem', boxShadow: '0 4px 12px var(--primary-light)' }}
          >
            Calculate Your Carbon Baseline 🚗
          </button>
        </div>

        {/* ── Accomplishments overview ───────────────────────────────── */}
        <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.55rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', display: 'flex' }}>
              <Leaf size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Saved Today</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{dailySavingsToday.toFixed(1)} kg CO₂</div>
            </div>
          </div>

          <div className={`card ${streak > 0 ? 'streak-active-glow' : ''}`} style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s ease' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.55rem', borderRadius: 'var(--radius-sm)', color: '#f59e0b', display: 'flex' }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Habit Streak</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{streak} {streak === 1 ? 'day' : 'days'} 🔥</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', padding: '0.55rem', borderRadius: 'var(--radius-sm)', color: '#a78bfa', display: 'flex' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Eco Badges</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{unlockedBadgesCount} / 8 Unlocked</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>

      {/* ── Daily Eco Tip Card ───────────────────────────────────── */}
      <div className="eco-tip-card">
        <div style={{ flexShrink: 0, color: 'var(--primary)', marginTop: '2px' }}>
          <Lightbulb size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '3px' }}>Did You Know? — Eco Tip of the Day</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', fontWeight: 500 }}>{dailyTip}</div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
        
        {/* Main Score Card */}
        <div 
          className="card" 
          style={{ 
            gridColumn: 'span 2', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '1.5rem',
            padding: '1.75rem' 
          }}
        >
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ANNUAL CARBON FOOTPRINT
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {totalTons}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Metric Tons CO₂e
              </span>
            </div>
            
            <div 
              style={{ 
                display: 'inline-block',
                padding: '0.35rem 0.75rem', 
                borderRadius: '50px', 
                backgroundColor: rating.bg, 
                color: rating.color,
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {rating.label}
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
              maxWidth: '350px'
            }}>
              🎈 <strong>In Plain Words:</strong> Your carbon footprint is equal to releasing the weight of <strong>{(totalTons / 1.2).toFixed(1)} small cars</strong> of carbon gas into the atmosphere each year! Let's get it down! 🌏
            </div>
          </div>

          {/* SVG Eco Gauge */}
          <div className="gauge-breathing" style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - ecoScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                {ecoScore}
              </span>
              <div style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '-3px' }}>
                Score
              </div>
            </div>
          </div>
        </div>

        {/* Small stats list */}
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          
          <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
              <Leaf size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Saved Today</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{dailySavingsToday.toFixed(1)} kg CO₂</div>
            </div>
          </div>

          {/* Trees saved equivalent */}
          <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: '#10b981' }}>
              <TreePine size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trees Saved Equiv.</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{treesEquivalent} tree-days 🌳</div>
            </div>
          </div>

          <div className={`card ${streak > 0 ? 'streak-active-glow' : ''}`} style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s ease' }}>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: '#f59e0b' }}>
              <Flame size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Habit Streak</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{streak} {streak === 1 ? 'day' : 'days'} 🔥</div>
            </div>
          </div>

          <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: '#a78bfa' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eco Badges</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{unlockedBadgesCount} / 8 Unlocked</div>
            </div>
          </div>

        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
        
        {/* Breakdown Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Emission Distribution by Sector</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Benchmark Bar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Footprint Benchmarks</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label htmlFor="benchmark-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Compare with:</label>
              <select
                id="benchmark-select"
                className="benchmark-select"
                value={benchmarkRegion}
                onChange={(e) => setBenchmarkRegion(e.target.value as 'US' | 'EU' | 'UK' | 'India' | 'Global')}
              >
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="UK">United Kingdom</option>
                <option value="India">India</option>
                <option value="Global">Global Average</option>
              </select>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

      </div>

      {/* Dynamic Insights & Carbon Offset Plan */}
      {(() => {
        const total = transport + energy + food + shopping || 1;
        const sectors = [
          { 
            name: 'Transport', 
            value: transport, 
            pct: Math.round((transport / total) * 100),
            color: '#38bdf8', 
            tip: 'Your driving and flights represent your single largest source of emissions. Shifting trips to walking, cycling, or transit has direct, high-impact reductions.',
            recommendation: 'Reduce your annual driving by just 1,500 miles or shift 2 commutes a week to public transit to save approximately 570 kg CO₂ annually.' 
          },
          { 
            name: 'Home Energy', 
            value: energy, 
            pct: Math.round((energy / total) * 100),
            color: '#fbbf24', 
            tip: 'Electricity consumption and heating are driving your carbon footprint. Simple changes in household usage patterns can make an immediate difference.',
            recommendation: 'Lower your home heating by 2°F, switch to cold laundry washes, and unplug phantom load appliances to reduce emissions by 350 kg CO₂ per year.' 
          },
          { 
            name: 'Food & Diet', 
            value: food, 
            pct: Math.round((food / total) * 100),
            color: '#34d399', 
            tip: 'Your choice of diet is the major factor in your carbon profile. Red meat production carries heavy methane and deforestation footprints.',
            recommendation: 'Replacing meat-heavy meals with plant-based dishes 3 days a week will cut your food-related carbon emissions by up to 600 kg CO₂ annually.' 
          },
          { 
            name: 'Shopping & Consumption', 
            value: shopping, 
            pct: Math.round((shopping / total) * 100),
            color: '#a78bfa', 
            tip: 'Your purchasing habits have a significant manufacturing and shipping footprint. Standard garbage disposal adds landfill load.',
            recommendation: 'Adopting a complete household recycling habit (separating composting, metals, glass) offsets production footprints, saving over 400 kg CO₂ annually.' 
          }
        ];
        
        const highest = [...sectors].sort((a, b) => b.value - a.value)[0];
        const activeInsightTab = selectedInsightTab || highest.name;
        const currentSector = sectors.find(s => s.name === activeInsightTab) || highest;

        const offsetTons = parseFloat(((totalTons * offsetPercent) / 100).toFixed(2));
        const treesNeeded = Math.round((offsetTons * 1000) / 22);
        const offsetCost = Math.round(offsetTons * 12);

        return (
          <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
            
            {/* Dynamic Insights Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💡 Personal Insights for {userName}
              </h3>

              {/* Category Pills Selector */}
              <div 
                role="tablist"
                aria-label="Insights category filter"
                style={{ display: 'flex', gap: '0.35rem', margin: '0.15rem 0', flexWrap: 'wrap' }}
              >
                {sectors.map(s => {
                  const isSelected = s.name === currentSector.name;
                  const isHighest = s.name === highest.name;
                  return (
                    <button
                      key={s.name}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedInsightTab(s.name)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '50px',
                        border: isSelected ? `1px solid ${s.color}` : '1px solid var(--border)',
                        backgroundColor: isSelected ? `${s.color}20` : 'transparent',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{s.name === 'Transport' ? '🚗' : s.name === 'Home Energy' ? '🏠' : s.name === 'Food & Diet' ? '🥗' : '👜'}</span>
                      <span>{s.name}</span>
                      {isHighest && <span style={{ fontSize: '0.65rem' }}>🔥</span>}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.25rem' }}>
                {currentSector.name === highest.name ? '🔥 Highest Contributor: ' : '📊 Analysis: '}
                <span style={{ color: currentSector.color }}>{currentSector.name} ({currentSector.pct}%)</span>
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {currentSector.tip}
              </p>
              <div style={{ 
                marginTop: 'auto', 
                padding: '0.75rem', 
                backgroundColor: 'var(--primary-light)', 
                borderRadius: 'var(--radius-sm)',
                borderLeft: `4px solid ${currentSector.color}`,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-main)',
                transition: 'border-left-color 0.3s ease'
              }}>
                <strong>Recommendation</strong>: {currentSector.recommendation}
              </div>
            </div>

            {/* Carbon Offset Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                🌳 Carbon Neutrality Offset Plan
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Neutralize your remaining annual carbon emissions by supporting certified reforestation or gold-standard clean energy offset projects.
              </p>
              
              <div className="slider-container" style={{ margin: '0.5rem 0' }}>
                <div className="slider-label">
                  <label htmlFor="offset-slider" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Offset Target Percentage</label>
                  <span className="slider-val" style={{ color: 'var(--primary)', fontWeight: 700 }}>{offsetPercent}%</span>
                </div>
                <input
                  id="offset-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={offsetPercent}
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${offsetPercent}%, var(--border) ${offsetPercent}%, var(--border) 100%)`
                  }}
                  onChange={(e) => setOffsetPercent(parseInt(e.target.value))}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.75rem',
                marginTop: 'auto'
              }}>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Cost</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>${offsetCost} / yr</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trees Needed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)' }}>{treesNeeded} trees</div>
                </div>
              </div>

              {/* Dynamic Virtual Forest Visualization */}
              <div style={{ 
                marginTop: '0.75rem',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-app)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <span>Interactive Virtual Forest</span>
                  <span style={{ color: 'var(--primary)' }}>{Math.min(10, Math.floor(offsetPercent / 10))} / 10 Trees Grown</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.35rem', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.1rem 0'
                }}>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const activeLimit = (i + 1) * 10;
                    const isActive = offsetPercent >= activeLimit;
                    return (
                      <span 
                        key={i} 
                        className={isActive ? 'sprout-animate-in' : ''}
                        style={{ 
                          fontSize: '1.4rem', 
                          opacity: isActive ? 1 : 0.15, 
                          filter: isActive ? 'none' : 'grayscale(100%)',
                          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: isActive ? 'scale(1.2) translateY(-2px)' : 'scale(0.95)',
                          display: 'inline-block'
                        }}
                        title={isActive ? `Tree ${i + 1} grown!` : `Reach ${activeLimit}% offset target to plant tree ${i + 1}`}
                      >
                        🌳
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        );
      })()}

    </div>
  );
}
