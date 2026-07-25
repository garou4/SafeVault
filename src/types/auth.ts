export interface UserAccount {
  username: string;
  passwordHash: string; // Simplified for prototype
  createdAt: string;
  isDeveloper?: boolean;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}