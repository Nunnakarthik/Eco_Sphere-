import type { UserInputs, EcoAction, Badge, QuizQuestion, AppState } from '../types';

export const DEFAULT_INPUTS: UserInputs = {
  carMiles: 6000,
  carType: 'gas-medium',
  publicTransit: 2,
  flightsShort: 1,
  flightsLong: 0,
  electricity: 200,
  heatingSource: 'gas',
  heatingUsage: 25,
  dietType: 'moderate-meat',
  foodWaste: 'medium',
  shoppingHabits: 'average',
  recycling: 'partial'
};

export const ECO_ACTIONS: EcoAction[] = [
  { id: 'transit', name: 'Used public transit, walked, or cycled', category: 'transport', co2Savings: 2.5, points: 15 },
  { id: 'plant-based', name: 'Ate entirely plant-based meals today', category: 'food', co2Savings: 3.0, points: 20 },
  { id: 'thermostat', name: 'Lowered heating/raised AC by 2°F', category: 'energy', co2Savings: 1.5, points: 10 },
  { id: 'cold-wash', name: 'Washed laundry in cold water', category: 'energy', co2Savings: 1.0, points: 10 },
  { id: 'standby', name: 'Unplugged unused chargers & electronics', category: 'energy', co2Savings: 0.8, points: 5 },
  { id: 'plastic-free', name: 'Avoided single-use plastics completely', category: 'waste', co2Savings: 0.5, points: 10 },
  { id: 'compost', name: 'Composted kitchen/garden waste', category: 'waste', co2Savings: 0.6, points: 10 },
  { id: 'efficiency', name: 'Conducted a home energy check / clean lights', category: 'energy', co2Savings: 1.2, points: 15 }
];

export const BADGES: Badge[] = [
  { id: 'starter', name: 'Eco Explorer', description: 'Calculated your carbon footprint for the first time', iconName: 'Compass', unlocked: false },
  { id: 'commuter', name: 'Transit Hero', description: 'Logged the public transit / active commute action 3 times', iconName: 'Bike', unlocked: false },
  { id: 'chef', name: 'Green Chef', description: 'Logged plant-based meal actions 3 times', iconName: 'Leaf', unlocked: false },
  { id: 'energy', name: 'Energy Wizard', description: 'Logged standby power or cold wash actions 3 times', iconName: 'Zap', unlocked: false },
  { id: 'scholar', name: 'Climate Scholar', description: 'Scored 100% on the Eco-Quiz', iconName: 'GraduationCap', unlocked: false },
  { id: 'trivia-master', name: 'Trivia Master', description: 'Completed the daily climate quiz 3 times', iconName: 'Compass', unlocked: false },
  { id: 'grandmaster', name: 'Quiz Grandmaster', description: 'Scored perfectly (5/5) on the daily quiz 3 times', iconName: 'Award', unlocked: false },
  { id: 'champion', name: 'Eco Champion', description: 'Reached a streak of 5 days or earned 100 total points', iconName: 'Award', unlocked: false }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which sector contributes the most greenhouse gas emissions globally?',
    options: [
      'Transportation (Cars, Planes, Trains)',
      'Electricity and Heat Production (Coal, Gas)',
      'Agriculture, Forestry, and Land Use',
      'Manufacturing and Construction'
    ],
    correctAnswer: 1,
    explanation: 'Electricity and heat production contributes approximately 25% of global greenhouse gas emissions, followed closely by agriculture and land use (24%) and transportation (14%).'
  },
  {
    id: 2,
    question: 'What target annual carbon footprint per person is needed to limit global warming to 1.5°C?',
    options: [
      'Under 2.0 metric tons',
      'Under 5.0 metric tons',
      'Under 10.0 metric tons',
      'Under 15.0 metric tons'
    ],
    correctAnswer: 0,
    explanation: 'According to climate science, global emissions must fall to less than 2.0 metric tons of CO2 equivalent per person annually by 2050 to avert severe climate change.'
  },
  {
    id: 3,
    question: 'How much CO2 does a single mature tree absorb per year on average?',
    options: [
      'Roughly 5 kg (11 lbs)',
      'Roughly 22 kg (48 lbs)',
      'Roughly 50 kg (110 lbs)',
      'Roughly 100 kg (220 lbs)'
    ],
    correctAnswer: 1,
    explanation: 'A mature tree absorbs approximately 22 kilograms (48 pounds) of carbon dioxide from the atmosphere each year, releasing oxygen in exchange.'
  },
  {
    id: 4,
    question: 'Which of the following actions has the highest potential carbon savings per year?',
    options: [
      'Switching to LED lightbulbs in all fixtures',
      'Recycling all plastic, paper, and metal',
      'Atypical eating: switching from heavy-meat to vegan diet',
      'Using a clothesline instead of a dryer'
    ],
    correctAnswer: 2,
    explanation: 'While all these actions help, adopting a fully plant-based (vegan) diet reduces personal food-related emissions by up to 60-70%, saving between 1.5 and 2.0 tons of CO2 annually per person.'
  },
  {
    id: 5,
    question: 'What is the impact of "phantom load" (appliances left plugged in on standby)?',
    options: [
      'Less than 0.1% of an average home electric bill',
      'Around 1-2% of an average home electric bill',
      'Approximately 5-10% of an average home electric bill',
      'Nearly 25% of an average home electric bill'
    ],
    correctAnswer: 2,
    explanation: 'Devices on standby or "vampire power" account for 5% to 10% of standard household electric energy use, cost hundreds of dollars, and produce unnecessary carbon emissions.'
  },
  {
    id: 6,
    question: 'What percentage of food produced globally for human consumption is lost or wasted?',
    options: [
      'Roughly 5%',
      'Roughly 15%',
      'Roughly 33% (one-third)',
      'Roughly 50% (half)'
    ],
    correctAnswer: 2,
    explanation: 'According to the UN Food and Agriculture Organization (FAO), approximately one-third of all food produced globally goes to waste, generating about 8% of global greenhouse emissions.'
  },
  {
    id: 7,
    question: 'Which transport method has the highest carbon emissions per passenger-mile?',
    options: [
      'Standard passenger train',
      'Domestic flight',
      'Solo driving in a gasoline SUV',
      'Electric vehicle'
    ],
    correctAnswer: 1,
    explanation: 'Domestic flights emit the highest greenhouse gases per passenger-mile due to the high energy demand of takeoffs and high-altitude emissions.'
  },
  {
    id: 8,
    question: 'What does achieving "Net Zero carbon emissions" mean?',
    options: [
      'Eliminating all human greenhouse gas emissions completely',
      'Balancing emitted carbon with an equivalent amount actively removed from the atmosphere',
      'Reducing personal carbon footprints by exactly 50%',
      'Transitioning to 100% solar energy'
    ],
    correctAnswer: 1,
    explanation: 'Net Zero means achieving a balance between greenhouse gases produced and greenhouse gases taken out of the atmosphere (e.g. through carbon sinks like reforestation or carbon capture).'
  },
  {
    id: 9,
    question: 'How much carbon dioxide is released by burning one gallon of standard gasoline?',
    options: [
      'About 1.2 kg (2.6 lbs)',
      'About 4.4 kg (9.8 lbs)',
      'About 8.8 kg (19.6 lbs)',
      'About 15 kg (33 lbs)'
    ],
    correctAnswer: 2,
    explanation: 'Burning one gallon of gasoline releases approximately 8.8 kilograms (19.6 pounds) of CO2, as the carbon atoms in gasoline bond with oxygen atoms from the air during combustion.'
  },
  {
    id: 10,
    question: 'Which gas, emitted by food waste in landfills, is 28x more potent than CO2 over a 100-year scale?',
    options: [
      'Methane',
      'Nitrous Oxide',
      'Carbon Monoxide',
      'Ozone'
    ],
    correctAnswer: 0,
    explanation: 'Methane (CH4) is released during anaerobic decomposition of organic materials in landfills, having a global warming potential 28 times greater than carbon dioxide.'
  }
];

export const DEFAULT_APP_STATE: AppState = {
  inputs: DEFAULT_INPUTS,
  loggedActionsToday: [],
  points: 0,
  streak: 0,
  lastActiveDate: null,
  unlockedBadgeIds: [],
  history: [],
  quizCompleted: false,
  quizScore: null,
  hasCalculated: false,
  quizAttemptedToday: false,
  perfectQuizzesCount: 0,
  quizAttemptsCount: 0
};
