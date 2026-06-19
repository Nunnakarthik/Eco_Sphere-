import { Doughnut, Bar } from 'react-chartjs-2';
import type { FootprintBreakdown } from '../utils/calculations';
import { Leaf, Flame, Award } from 'lucide-react';
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

interface DashboardProps {
  breakdown: FootprintBreakdown;
  streak: number;
  unlockedBadgesCount: number;
  dailySavingsToday: number;
}

export default function Dashboard({
  breakdown,
  streak,
  unlockedBadgesCount,
  dailySavingsToday
}: DashboardProps) {
  const { transport, energy, food, shopping, totalTons } = breakdown;

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
          color: 'var(--text-main)',
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
          label: function (context: any) {
            const val = context.raw;
            const pct = ((val / (transport + energy + food + shopping)) * 100).toFixed(1);
            return ` ${context.label}: ${val.toLocaleString()} kg CO₂ (${pct}%)`;
          }
        }
      }
    }
  };

  // Chart 2: Bar chart comparing user vs benchmarks
  const barData = {
    labels: ['Your Footprint', 'Target (1.5°C Goal)', 'Global Avg', 'EU Avg', 'US Avg'],
    datasets: [
      {
        label: 'Metric Tons CO₂ / year',
        data: [totalTons, 2.0, 4.7, 6.5, 16.0],
        backgroundColor: [
          rating.color,
          '#10b981', // green for target
          '#94a3b8', // grey
          '#64748b', // dark grey
          '#ef4444'  // red for US average
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
          label: function (context: any) {
            return ` ${context.raw} metric tons`;
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
          color: 'var(--text-muted)',
          font: {
            family: 'Inter',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'var(--border)'
        },
        ticks: {
          color: 'var(--text-muted)',
          font: {
            family: 'Inter'
          }
        }
      }
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
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
          </div>

          {/* SVG Eco Gauge */}
          <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
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

          <div className="card" style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{unlockedBadgesCount} / 6 Unlocked</div>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Your Footprint vs National Averages</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}
