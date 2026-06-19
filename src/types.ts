export interface UserInputs {
  // Transport
  carMiles: number;
  carType: string; // 'electric' | 'hybrid' | 'gas-medium' | 'gas-large'
  publicTransit: number; // hours/week
  flightsShort: number; // flights/year
  flightsLong: number; // flights/year
  
  // Home Energy
  electricity: number; // kWh/month
  heatingSource: string; // 'electric' | 'gas' | 'oil' | 'propane'
  heatingUsage: number; // therms or kWh/month
  
  // Food Habits
  dietType: string; // 'vegan' | 'vegetarian' | 'moderate-meat' | 'heavy-meat'
  foodWaste: string; // 'low' | 'medium' | 'high'
  
  // Consumption & Recycling
  shoppingHabits: string; // 'minimalist' | 'average' | 'enthusiast'
  recycling: string; // 'none' | 'partial' | 'complete'
}

export interface EcoAction {
  id: string;
  name: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  co2Savings: number; // kg CO2 saved per action
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  actionsLogged: string[]; // array of action IDs
  dailySavings: number; // kg CO2 saved
}

export interface AppState {
  inputs: UserInputs;
  loggedActionsToday: string[];
  points: number;
  streak: number;
  lastActiveDate: string | null;
  unlockedBadgeIds: string[];
  history: HistoryEntry[];
  quizCompleted: boolean;
  quizScore: number | null;
  hasCalculated: boolean;
}
