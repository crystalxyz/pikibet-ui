export interface User {
  id: string;
  username: string;
  wallet: number;
  createdAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  questionId: string;
  selectedOption: number;
  cost: number;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
