import { useState, useEffect } from 'react';
import type { UserInputs } from '../types';
import { calculateFootprint, calculateSimulatedSavings } from '../utils/calculations';
import { Trees, Milestone, Smartphone } from 'lucide-react';

interface SimulatorProps {
  currentInputs: UserInputs;
}

export default function Simulator({ currentInputs }: SimulatorProps) {
  // Local state clone for target simulation behavior
  const [targetInputs, setTargetInputs] = useState<UserInputs>({ ...currentInputs });

  const getSliderStyle = (val: number, min: number, max: number) => {
    // Avoid division by zero
    const range = max - min;
    const pct = range > 0 ? ((val - min) / range) * 100 : 0;
    return {
      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`
    };
  };

  // Keep target in sync with current if current changes in calculator
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargetInputs({ ...currentInputs });
  }, [currentInputs]);

  const handleSliderChange = (key: keyof UserInputs, val: number) => {
    setTargetInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleSelectChange = (key: keyof UserInputs, val: string) => {
    setTargetInputs(prev => ({ ...prev, [key]: val }));
  };

  // Run calculations
  const currentTotal = calculateFootprint(currentInputs).total;
  const targetBreakdown = calculateFootprint(targetInputs);

  const { co2SavedKg, treesEquivalent, carMilesEquivalent } = calculateSimulatedSavings(
    currentInputs,
    targetInputs
  );

  const phoneChargesEquivalent = Math.round(co2SavedKg * 122); // 1kg CO2 ~ 122 smartphone charges

  const pctReduction = currentTotal > 0 
    ? Math.round((co2SavedKg / currentTotal) * 100) 
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
      
      {/* Target Behaviors Controls */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Simulate Future Behaviors 📈</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Adjust sliders to simulate carbon savings if you make positive changes</p>
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
            🎛️ Drag sliders left to reduce usage and see savings!
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          
          <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}>
            🚗 Travel Simulation
          </h3>

          <div className="slider-container" style={{ margin: '0.5rem 0' }}>
            <div className="slider-label">
              <label htmlFor="sim-carMiles">Target Annual Driving</label>
              <span className="slider-val">{targetInputs.carMiles.toLocaleString()} mi</span>
            </div>
            <input
              id="sim-carMiles"
              type="range"
              min="0"
              max="30000"
              step="500"
              value={targetInputs.carMiles}
              style={getSliderStyle(targetInputs.carMiles, 0, 30000)}
              onChange={(e) => handleSliderChange('carMiles', parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>0 mi</span>
              <span>Current: {currentInputs.carMiles.toLocaleString()} mi</span>
              <span>30,000 mi (Max)</span>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="sim-carType">Target Car Drive Type</label>
            <select
              id="sim-carType"
              className="form-control"
              value={targetInputs.carType}
              onChange={(e) => handleSelectChange('carType', e.target.value)}
            >
              <option value="electric">Electric Vehicle (EV)</option>
              <option value="hybrid">Hybrid/PHEV</option>
              <option value="gas-medium">Standard Sedan</option>
              <option value="gas-large">Large SUV / Truck</option>
            </select>
          </div>

          <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem' }}>
            ⚡ Home Energy Simulation
          </h3>

          <div className="slider-container" style={{ margin: '0.5rem 0' }}>
            <div className="slider-label">
              <label htmlFor="sim-electricity">Target Monthly Electricity</label>
              <span className="slider-val">{targetInputs.electricity} kWh</span>
            </div>
            <input
              id="sim-electricity"
              type="range"
              min="0"
              max="1500"
              step="25"
              value={targetInputs.electricity}
              style={getSliderStyle(targetInputs.electricity, 0, 1500)}
              onChange={(e) => handleSliderChange('electricity', parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>0 kWh</span>
              <span>Current: {currentInputs.electricity} kWh</span>
              <span>1,500 kWh (Max)</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem' }}>
            🥗 Consumption Simulation
          </h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="sim-dietType">Target Diet style</label>
            <select
              id="sim-dietType"
              className="form-control"
              value={targetInputs.dietType}
              onChange={(e) => handleSelectChange('dietType', e.target.value)}
            >
              <option value="vegan">Vegan Diet</option>
              <option value="vegetarian">Vegetarian Diet</option>
              <option value="moderate-meat">Moderate Meat</option>
              <option value="heavy-meat">Heavy Meat</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="sim-recycling">Target Recycling Level</label>
            <select
              id="sim-recycling"
              className="form-control"
              value={targetInputs.recycling}
              onChange={(e) => handleSelectChange('recycling', e.target.value)}
            >
              <option value="complete">Complete Recycling</option>
              <option value="partial">Partial Recycling</option>
              <option value="none">No Recycling</option>
            </select>
          </div>

        </div>
      </div>

      {/* Simulator Results & Equivalents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Savings Gauge */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            SIMULATED ANNUAL REDUCTION
          </span>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {pctReduction}%
            </span>
          </div>

          <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            Saving {co2SavedKg.toLocaleString()} kg CO₂ / year
          </p>

          <div style={{ 
            width: '100%', 
            backgroundColor: 'var(--bg-app)', 
            borderRadius: '50px', 
            height: '10px', 
            overflow: 'hidden', 
            border: '1px solid var(--border)',
            marginBottom: '0.5rem' 
          }}>
            <div style={{ 
              width: `${pctReduction}%`, 
              backgroundColor: 'var(--primary)', 
              height: '100%',
              borderRadius: '50px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: co2SavedKg > 0 ? '0.75rem' : '0' }}>
            Target footprint: <strong>{targetBreakdown.totalTons} tons</strong> vs Current: <strong>{(currentTotal/1000).toFixed(2)} tons</strong>
          </span>

          {co2SavedKg > 0 && (
            <div style={{ 
              padding: '0.65rem 0.85rem', 
              backgroundColor: 'rgba(16, 185, 129, 0.08)', 
              border: '1px dashed var(--primary)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              lineHeight: '1.4',
              width: '100%',
              textAlign: 'left'
            }}>
              💡 <strong>In Plain Words:</strong> By making these changes, you save the same weight of gas that <strong>{Math.round(co2SavedKg / 22)} mature trees</strong> absorb from the atmosphere in a whole year! 🌳
            </div>
          )}
        </div>

        {/* Equivalents Cards */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyItems: 'stretch' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Real-World Equivalents</h3>
          
          <div style={{ display: 'grid', gap: '1rem', flex: 1 }}>
            
            {/* Trees Card */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.75rem 1rem', 
              backgroundColor: 'var(--primary-light)', 
              border: '1px solid var(--primary)', 
              borderRadius: 'var(--radius-sm)' 
            }}>
              <div style={{ color: 'var(--primary)' }}>
                <Trees size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                  {treesEquivalent}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  Mature trees planted & grown for a year
                </div>
              </div>
            </div>

            {/* Car Miles Card */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.75rem 1rem', 
              backgroundColor: 'rgba(56, 189, 248, 0.1)', 
              border: '1px solid #38bdf8', 
              borderRadius: 'var(--radius-sm)' 
            }}>
              <div style={{ color: '#38bdf8' }}>
                <Milestone size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>
                  {carMilesEquivalent.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  Average gasoline passenger vehicle miles avoided
                </div>
              </div>
            </div>

            {/* Smartphone Charges Card */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.75rem 1rem', 
              backgroundColor: 'rgba(167, 139, 250, 0.1)', 
              border: '1px solid #a78bfa', 
              borderRadius: 'var(--radius-sm)' 
            }}>
              <div style={{ color: '#a78bfa' }}>
                <Smartphone size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#a78bfa' }}>
                  {phoneChargesEquivalent.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  Smartphones fully charged from empty
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
