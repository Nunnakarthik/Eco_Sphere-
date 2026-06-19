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
  hasCalculated: false
};
