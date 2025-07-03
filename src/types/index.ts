export interface TripDataType {
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency?: string;
  itinerary?: Record<string, any>;
}

export interface ShareableTrip {
  id: string;
  destination: string;
  duration: number;
  peopleCount: number;
  budget: number;
  currency: string;
  itinerary: ItineraryType;
  createdAt: string;
  shareId?: string;
  shareExpiry?: string;
  ownerName?: string;
}

export interface UserPreferences {
  userId?: string;
  name?: string;
  email?: string;
  preferredCurrency: string;
  dietaryRestrictions?: string[];
  interests?: string[];
  travelStyle?: string;
  accessibilityNeeds?: string[];
}

export interface ItineraryType {
  days: DayItineraryType[];
  accommodation: AccommodationType[];
  transportation: TransportationType[];
  budgetBreakdown: BudgetBreakdownType;
  tips: string[];
  bestTimeToVisit?: string;
  localCuisine?: string[];
}

export interface DayItineraryType {
  day: number;
  activities: ActivityType[];
  meals: MealType[];
}

export interface ActivityType {
  name: string;
  description: string;
  time: string;
  cost: number;
  location?: string;
  weatherConsideration?: string;
}

export interface MealType {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestion: string;
  cost: number;
  location?: string;
}

export interface AccommodationType {
  name: string;
  description: string;
  pricePerNight: number;
  location: string;
  amenities?: string[];
  suitableFor?: string;
}

export interface TransportationType {
  type: string;
  description: string;
  cost: number;
  recommendedFor?: string;
}

export interface BudgetBreakdownType {
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  miscellaneous: number;
  total: number;
} 