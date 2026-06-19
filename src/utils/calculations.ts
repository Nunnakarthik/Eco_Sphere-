import type { UserInputs } from '../types';

export const EMISSION_FACTORS = {
  // Transport (kg CO2 per mile / hour / flight)
  carType: {
    electric: 0.08,    // Low emissions from grid charging
    hybrid: 0.16,      // High efficiency hybrid
    'gas-medium': 0.38, // Standard sedan/crossover
    'gas-large': 0.49   // SUV / Truck / Performance
  },
  publicTransitPerHour: 1.2, // average train/bus mix emissions per hour
  flightShort: 200,          // short haul flight (< 3 hours)
  flightLong: 750,           // long haul flight (> 3 hours)

  // Energy (kg CO2 per kWh or therm)
  electricityPerKwh: 0.37, // average grid carbon intensity
  heatingSource: {
    electric: 0.37, // assuming heating usage in kWh
    gas: 5.3,      // assuming heating usage in therms
    oil: 10.2,     // assuming heating usage in gallons
    propane: 5.7   // assuming heating usage in gallons
  },

  // Food (annual tons CO2, converted to kg in calculation)
  dietType: {
    vegan: 1.5,
    vegetarian: 1.9,
    'moderate-meat': 3.0,
    'heavy-meat': 4.5
  },
  foodWasteMultiplier: {
    low: 0.8,
    medium: 1.0,
    high: 1.35
  },

  // Shopping / Consumption (annual tons CO2, converted to kg in calculation)
  shoppingHabits: {
    minimalist: 1.0,
    average: 2.2,
    enthusiast: 4.2
  },
  recyclingMultiplier: {
    none: 1.0,
    partial: 0.9,
    complete: 0.72
  }
};

export interface FootprintBreakdown {
  transport: number;
  energy: number;
  food: number;
  shopping: number;
  total: number;
  totalTons: number;
}

export function calculateFootprint(inputs: UserInputs): FootprintBreakdown {
  // 1. Transportation
  const carFactor = EMISSION_FACTORS.carType[inputs.carType as keyof typeof EMISSION_FACTORS.carType] || 0.38;
  const carEmissions = inputs.carMiles * carFactor;
  const transitEmissions = inputs.publicTransit * 52 * EMISSION_FACTORS.publicTransitPerHour;
  const flightEmissions = (inputs.flightsShort * EMISSION_FACTORS.flightShort) + 
                            (inputs.flightsLong * EMISSION_FACTORS.flightLong);
  const transport = Math.round(carEmissions + transitEmissions + flightEmissions);

  // 2. Energy
  const electricityEmissions = inputs.electricity * 12 * EMISSION_FACTORS.electricityPerKwh;
  const heatingFactor = EMISSION_FACTORS.heatingSource[inputs.heatingSource as keyof typeof EMISSION_FACTORS.heatingSource] || 5.3;
  const heatingEmissions = inputs.heatingUsage * 12 * heatingFactor;
  const energy = Math.round(electricityEmissions + heatingEmissions);

  // 3. Food (converts tons to kg)
  const dietBase = EMISSION_FACTORS.dietType[inputs.dietType as keyof typeof EMISSION_FACTORS.dietType] || 3.0;
  const wasteMult = EMISSION_FACTORS.foodWasteMultiplier[inputs.foodWaste as keyof typeof EMISSION_FACTORS.foodWasteMultiplier] || 1.0;
  const food = Math.round(dietBase * 1000 * wasteMult);

  // 4. Shopping/Consumption (converts tons to kg)
  const shoppingBase = EMISSION_FACTORS.shoppingHabits[inputs.shoppingHabits as keyof typeof EMISSION_FACTORS.shoppingHabits] || 2.2;
  const recyclingMult = EMISSION_FACTORS.recyclingMultiplier[inputs.recycling as keyof typeof EMISSION_FACTORS.recyclingMultiplier] || 1.0;
  const shopping = Math.round(shoppingBase * 1000 * recyclingMult);

  const total = transport + energy + food + shopping;
  const totalTons = parseFloat((total / 1000).toFixed(2));

  return {
    transport,
    energy,
    food,
    shopping,
    total,
    totalTons
  };
}

// Compare current vs target for Simulator
export function calculateSimulatedSavings(
  current: UserInputs,
  target: UserInputs
): { co2SavedKg: number; treesEquivalent: number; carMilesEquivalent: number } {
  const currentTotal = calculateFootprint(current).total;
  const targetTotal = calculateFootprint(target).total;
  
  const co2SavedKg = Math.max(0, currentTotal - targetTotal);
  
  // 1 mature tree absorbs ~22 kg CO2 per year
  const treesEquivalent = parseFloat((co2SavedKg / 22).toFixed(1));
  
  // 1 average gas mile is ~0.38 kg CO2
  const carMilesEquivalent = Math.round(co2SavedKg / 0.38);

  return {
    co2SavedKg,
    treesEquivalent,
    carMilesEquivalent
  };
}
