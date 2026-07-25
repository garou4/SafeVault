import { useState, useEffect } from "react";
import { UserAccount, AuthState } from "@/types/auth";

const USER_STORAGE_KEY = "safevault_user_account";
const AUTH_SESSION_KEY = "safevault_auth_session";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const sessionActive = localStorage.getItem(AUTH_SESSION_KEY);
    
    if (savedUser && sessionActive === "true") {
      setAuthState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const signUp = (username: string, password: string) => {
    const newUser: UserAccount = {
      username,
      passwordHash: password, // In a real app, this would be salted/hashed
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(AUTH_SESSION_KEY, "true");
    setAuthState({ user: newUser, isAuthenticated: true });
  };

  const signIn = (username: string, password: string): boolean => {
    const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!savedUserStr) return false;
    
    const savedUser: UserAccount = JSON.parse(savedUserStr);
    if (savedUser.username === username && savedUser.passwordHash === password) {
      localStorage.setItem(AUTH_SESSION_KEY, "true");
      setAuthState({ user: savedUser, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthState({ user: null, isAuthenticated: false });
  };

  const updatePassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!savedUserStr) return { success: false, message: "No account found." };
    
    const savedUser: UserAccount = JSON.parse(savedUserStr);
    if (savedUser.passwordHash !== currentPass) {
      return { success: false, message: "Incorrect current password." };
    }

    const updatedUser = { ...savedUser, passwordHash: newPass };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setAuthState(prev => ({ ...prev, user: updatedUser }));
    return { success: true, message: "Password updated successfully!" };
  };

  const hasAccount = !!localStorage.getItem(USER_STORAGE_KEY);

  return { ...authState, signUp, signIn, signOut, updatePassword, hasAccount };
}