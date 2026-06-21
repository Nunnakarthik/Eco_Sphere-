import { calculateFootprint, calculateSimulatedSavings } from './src/utils/calculations';
import { UserInputs } from './src/types';

// Standard test case inputs
const mockUserInputs: UserInputs = {
  carMiles: 10000,
  carType: 'gas-medium', // 0.38 kg/mi
  publicTransit: 5,      // 5 hrs/wk * 52 wks * 1.2 kg/hr
  flightsShort: 2,       // 2 * 200 kg
  flightsLong: 1,        // 1 * 750 kg
  electricity: 300,      // 300 kWh * 12 * 0.37 kg
  heatingSource: 'gas',  // 20 therms * 12 * 5.3 kg
  heatingUsage: 20,
  dietType: 'moderate-meat', // 3.0 tons = 3000 kg
  foodWaste: 'medium',       // 1.0 multiplier
  shoppingHabits: 'average', // 2.2 tons = 2200 kg
  recycling: 'partial'       // 0.9 multiplier
};

function runTests() {
  console.log('🧪 Starting EcoSphere Calculation Engine Unit Tests...\n');
  let passes = 0;
  let fails = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passes++;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      fails++;
    }
  };

  try {
    // 1. Run Footprint Breakdown
    const res = calculateFootprint(mockUserInputs);
    
    // Transport Check
    // (10000 * 0.38) + (5 * 52 * 1.2) + (2 * 200) + (1 * 750)
    // 3800 + 312 + 400 + 750 = 5262 kg CO2
    assert(res.transport === 5262, `Transport calculations (expected 5262, got ${res.transport})`);

    // Energy Check
    // (300 * 12 * 0.37) + (20 * 12 * 5.3)
    // 1332 + 1272 = 2604 kg CO2
    assert(res.energy === 2604, `Energy calculations (expected 2604, got ${res.energy})`);

    // Food Check
    // 3000 * 1.0 = 3000 kg CO2
    assert(res.food === 3000, `Food calculations (expected 3000, got ${res.food})`);

    // Shopping Check
    // 2200 * 0.9 = 1980 kg CO2
    assert(res.shopping === 1980, `Shopping calculations (expected 1980, got ${res.shopping})`);

    // Total Check
    // 5262 + 2604 + 3000 + 1980 = 12846 kg = 12.85 tons
    assert(res.total === 12846, `Total footprint sum (expected 12846, got ${res.total})`);
    assert(res.totalTons === 12.85, `Total footprint tons conversion (expected 12.85, got ${res.totalTons})`);

    // 2. SUV vs EV comparison test
    const evInputs: UserInputs = { ...mockUserInputs, carType: 'electric' };
    const suvInputs: UserInputs = { ...mockUserInputs, carType: 'gas-large' };
    
    const evRes = calculateFootprint(evInputs);
    const suvRes = calculateFootprint(suvInputs);
    assert(evRes.transport < suvRes.transport, 'EV transport emissions are lower than Large SUV emissions');

    // 3. Diet comparison test
    const veganInputs: UserInputs = { ...mockUserInputs, dietType: 'vegan' };
    const meatInputs: UserInputs = { ...mockUserInputs, dietType: 'heavy-meat' };
    
    const veganRes = calculateFootprint(veganInputs);
    const meatRes = calculateFootprint(meatInputs);
    assert(veganRes.food < meatRes.food, 'Vegan diet emissions are lower than Heavy Meat diet emissions');

    // 4. Recycling comparison test
    const cleanRecycleInputs: UserInputs = { ...mockUserInputs, recycling: 'complete' };
    const noRecycleInputs: UserInputs = { ...mockUserInputs, recycling: 'none' };
    
    const cleanRes = calculateFootprint(cleanRecycleInputs);
    const noRes = calculateFootprint(noRecycleInputs);
    assert(cleanRes.shopping < noRes.shopping, 'Complete recycling emissions are lower than No recycling emissions');

    // 5. Simulator savings checks
    const targetInputs: UserInputs = {
      ...mockUserInputs,
      carMiles: 5000, // reduce by 5000 miles (saves 5000 * 0.38 = 1900 kg)
      recycling: 'complete' // change from partial to complete (2200 * 0.9 vs 2200 * 0.72 = 1980 - 1584 = 396 kg)
      // total savings = 1900 + 396 = 2296 kg CO2
    };

    const simRes = calculateSimulatedSavings(mockUserInputs, targetInputs);
    assert(simRes.co2SavedKg === 2296, `Simulator savings calculations (expected 2296 kg, got ${simRes.co2SavedKg} kg)`);
    assert(simRes.treesEquivalent === 104.4, `Simulator trees saved (expected 104.4, got ${simRes.treesEquivalent})`);

  } catch (error) {
    console.error('💥 Test Execution Error: ', error);
    fails++;
  }

  console.log(`\n📊 Test Execution Summary: ${passes} passed, ${fails} failed.`);
  if (fails > 0) {
    process.exit(1);
  } else {
    console.log('🌟 All calculation engine tests passed successfully!');
    process.exit(0);
  }
}

runTests();
