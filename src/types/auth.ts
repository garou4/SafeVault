export interface UserAccount {
  username: string;
  passwordHash: string; // Simplified for prototype
  createdAt: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}