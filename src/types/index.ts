// )(������
export interface User {
  id: string;
  name: string;
  group: 'A�' | 'B�' | 'w�' | 'S';
  price: number;
  createdAt: string;
  isActive: boolean;
}

// f�2������
export interface MealRecord {
  id: string;
  userId: string;
  userName: string;
  userGroup: string;
  date: string;
  rating: number;
  price: number;
  menuName?: string;
}

// ����������
export interface MenuItem {
  id: string;
  name: string;
  date: string;
  description?: string;
}

// �������K���
export interface AppState {
  users: User[];
  mealRecords: MealRecord[];
  currentMenu: MenuItem | null;
  selectedUser: User | null;
}

// ����󋚩
export type AppAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_MEAL_RECORDS'; payload: MealRecord[] }
  | { type: 'ADD_MEAL_RECORD'; payload: MealRecord }
  | { type: 'SET_CURRENT_MENU'; payload: MenuItem }
  | { type: 'SET_SELECTED_USER'; payload: User | null };