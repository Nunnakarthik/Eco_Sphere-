import { useState } from 'react';
import type { UserInputs } from '../types';
import { Car, Home, ShoppingBag, Eye } from 'lucide-react';

interface CalculatorProps {
  inputs: UserInputs;
  onChange: (newInputs: UserInputs) => void;
  onShowSources: () => void;
}

export default function Calculator({ inputs, onChange, onShowSources }: CalculatorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'transport' | 'energy' | 'consumption'>('transport');

  const getSliderStyle = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${pct}%, var(--border) ${pct}%, var(--border) 100%)`
    };
  };

  const handleSliderChange = (key: keyof UserInputs, val: number) => {
    onChange({
      ...inputs,
      [key]: val
    });
  };

  const handleSelectChange = (key: keyof UserInputs, val: string) => {
    onChange({
      ...inputs,
      [key]: val
    });
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Your Habits Calculator / అలవాట్ల కాలిక్యులేటర్ 🚗</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Adjust sliders to recalculate your impact instantly</p>
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
            🎛️ Drag sliders to change your habits! / 🎛️ మీ అలవాట్లను మార్చడానికి స్లైడర్‌లను జరపండి!
          </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={onShowSources}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem' }}
        >
          <Eye size={14} />
          View Scientific Sources
        </button>
      </div>

      {/* Sub tabs */}
      <div 
        role="tablist" 
        aria-label="Calculator sections"
        style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: '0.75rem', 
          marginBottom: '1.5rem' 
        }}
      >
        <button
          role="tab"
          aria-selected={activeSubTab === 'transport'}
          aria-controls="panel-transport"
          id="tab-transport"
          onClick={() => setActiveSubTab('transport')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0.5rem',
            background: activeSubTab === 'transport' ? 'var(--primary-light)' : 'none',
            border: 'none',
            borderBottom: activeSubTab === 'transport' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeSubTab === 'transport' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          <Car size={16} />
          Transport
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'energy'}
          aria-controls="panel-energy"
          id="tab-energy"
          onClick={() => setActiveSubTab('energy')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0.5rem',
            background: activeSubTab === 'energy' ? 'var(--primary-light)' : 'none',
            border: 'none',
            borderBottom: activeSubTab === 'energy' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeSubTab === 'energy' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          <Home size={16} />
          Home Energy
        </button>
        <button
          role="tab"
          aria-selected={activeSubTab === 'consumption'}
          aria-controls="panel-consumption"
          id="tab-consumption"
          onClick={() => setActiveSubTab('consumption')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 0.5rem',
            background: activeSubTab === 'consumption' ? 'var(--primary-light)' : 'none',
            border: 'none',
            borderBottom: activeSubTab === 'consumption' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeSubTab === 'consumption' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          <ShoppingBag size={16} />
          Food & Goods
        </button>
      </div>

      {/* Sub tab content panels */}
      <div style={{ flex: 1 }}>
        
        {/* TRANSPORT TAB */}
        {activeSubTab === 'transport' && (
          <div 
            id="panel-transport" 
            role="tabpanel" 
            aria-labelledby="tab-transport"
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <div className="slider-container">
              <div className="slider-label">
                <label htmlFor="carMiles-slider">Annual Driving Mileage</label>
                <span className="slider-val">{inputs.carMiles.toLocaleString()} miles</span>
              </div>
              <input
                id="carMiles-slider"
                type="range"
                min="0"
                max="30000"
                step="500"
                value={inputs.carMiles}
                style={getSliderStyle(inputs.carMiles, 0, 30000)}
                onChange={(e) => handleSliderChange('carMiles', parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>0 mi</span>
                <span>15,000 mi (Avg)</span>
                <span>30,000 mi</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="carType-select">Car Fuel / Drive Type</label>
              <select
                id="carType-select"
                className="form-control"
                value={inputs.carType}
                onChange={(e) => handleSelectChange('carType', e.target.value)}
              >
                <option value="electric">Electric Vehicle (EV)</option>
                <option value="hybrid">Hybrid/Plug-in Hybrid (PHEV)</option>
                <option value="gas-medium">Standard Gasoline Sedan / Crossover</option>
                <option value="gas-large">Large Gasoline SUV / Pickup / Truck</option>
              </select>
            </div>

            <div className="slider-container">
              <div className="slider-label">
                <label htmlFor="transit-slider">Public Transit Usage</label>
                <span className="slider-val">{inputs.publicTransit} hrs/week</span>
              </div>
              <input
                id="transit-slider"
                type="range"
                min="0"
                max="40"
                step="1"
                value={inputs.publicTransit}
                style={getSliderStyle(inputs.publicTransit, 0, 40)}
                onChange={(e) => handleSliderChange('publicTransit', parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 hours</span>
                <span>20 hours</span>
                <span>40 hours</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="slider-container" style={{ margin: 0 }}>
                <div className="slider-label">
                  <label htmlFor="flightsShort-slider">Short Flights (✈️ &lt; 3h)</label>
                  <span className="slider-val">{inputs.flightsShort}/yr</span>
                </div>
                <input
                  id="flightsShort-slider"
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={inputs.flightsShort}
                  style={getSliderStyle(inputs.flightsShort, 0, 15)}
                  onChange={(e) => handleSliderChange('flightsShort', parseInt(e.target.value))}
                />
              </div>
              
              <div className="slider-container" style={{ margin: 0 }}>
                <div className="slider-label">
                  <label htmlFor="flightsLong-slider">Long Flights (✈️ &gt; 3h)</label>
                  <span className="slider-val">{inputs.flightsLong}/yr</span>
                </div>
                <input
                  id="flightsLong-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={inputs.flightsLong}
                  style={getSliderStyle(inputs.flightsLong, 0, 10)}
                  onChange={(e) => handleSliderChange('flightsLong', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* ENERGY TAB */}
        {activeSubTab === 'energy' && (
          <div 
            id="panel-energy" 
            role="tabpanel" 
            aria-labelledby="tab-energy"
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <div className="slider-container">
              <div className="slider-label">
                <label htmlFor="electricity-slider">Monthly Electricity Usage</label>
                <span className="slider-val">{inputs.electricity} kWh/month</span>
              </div>
              <input
                id="electricity-slider"
                type="range"
                min="0"
                max="1500"
                step="25"
                value={inputs.electricity}
                style={getSliderStyle(inputs.electricity, 0, 1500)}
                onChange={(e) => handleSliderChange('electricity', parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>0 kWh</span>
                <span>500 kWh</span>
                <span>1,500 kWh</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="heatingSource-select">Primary Heating Source</label>
              <select
                id="heatingSource-select"
                className="form-control"
                value={inputs.heatingSource}
                onChange={(e) => handleSelectChange('heatingSource', e.target.value)}
              >
                <option value="gas">Natural Gas</option>
                <option value="electric">Electric Heat (Heat Pump / Baseboard)</option>
                <option value="oil">Heating Oil</option>
                <option value="propane">Propane</option>
              </select>
            </div>

            <div className="slider-container">
              <div className="slider-label">
                <label htmlFor="heatingUsage-slider">Monthly Heating Fuel Usage</label>
                <span className="slider-val">
                  {inputs.heatingUsage} {inputs.heatingSource === 'gas' ? 'therms' : inputs.heatingSource === 'electric' ? 'kWh' : 'gallons'}/mo
                </span>
              </div>
              <input
                id="heatingUsage-slider"
                type="range"
                min="0"
                max={inputs.heatingSource === 'electric' ? 1000 : 150}
                step={inputs.heatingSource === 'electric' ? 25 : 5}
                value={inputs.heatingUsage}
                style={getSliderStyle(inputs.heatingUsage, 0, inputs.heatingSource === 'electric' ? 1000 : 150)}
                onChange={(e) => handleSliderChange('heatingUsage', parseInt(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 units</span>
                <span>Avg usage: {inputs.heatingSource === 'gas' ? '30 therms' : inputs.heatingSource === 'electric' ? '400 kWh' : '20 gal'}</span>
                <span>Max units</span>
              </div>
            </div>
          </div>
        )}

        {/* FOOD & SHOPPING TAB */}
        {activeSubTab === 'consumption' && (
          <div 
            id="panel-consumption" 
            role="tabpanel" 
            aria-labelledby="tab-consumption"
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <div className="form-group">
              <label htmlFor="dietType-select">Dietary Habits</label>
              <select
                id="dietType-select"
                className="form-control"
                value={inputs.dietType}
                onChange={(e) => handleSelectChange('dietType', e.target.value)}
              >
                <option value="vegan">Fully Vegan (Plant-based, 0% animal products)</option>
                <option value="vegetarian">Vegetarian (Dairy/eggs, no meat)</option>
                <option value="moderate-meat">Moderate Meat Eater (Poultry/fish/occasional red meat)</option>
                <option value="heavy-meat">Heavy Meat Eater (Frequent beef/pork/lamb)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="foodWaste-select">Household Food Waste</label>
              <select
                id="foodWaste-select"
                className="form-control"
                value={inputs.foodWaste}
                onChange={(e) => handleSelectChange('foodWaste', e.target.value)}
              >
                <option value="low">Minimal (Plan meals, compost scraps, reuse leftovers)</option>
                <option value="medium">Average (Occasional food spoilage/unused leftovers)</option>
                <option value="high">High (Frequent disposal of spoiled fresh goods/large portions)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="shoppingHabits-select">Shopping & Buying Habits</label>
              <select
                id="shoppingHabits-select"
                className="form-control"
                value={inputs.shoppingHabits}
                onChange={(e) => handleSelectChange('shoppingHabits', e.target.value)}
              >
                <option value="minimalist">Eco-Minimalist (Buy secondhand, repair goods, low consumption)</option>
                <option value="average">Standard (Buy new items occasionally, moderate shopping)</option>
                <option value="enthusiast">Avid Consumer (Frequent online purchases, latest electronics, fast fashion)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recycling-select">Household Recycling Habits</label>
              <select
                id="recycling-select"
                className="form-control"
                value={inputs.recycling}
                onChange={(e) => handleSelectChange('recycling', e.target.value)}
              >
                <option value="complete">Complete Recycling (Compost + paper/metal/glass/plastics)</option>
                <option value="partial">Partial Recycling (Separate paper/cardboard/metal only)</option>
                <option value="none">No Recycling (All waste goes into general trash)</option>
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
