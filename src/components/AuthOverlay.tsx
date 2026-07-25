import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

interface AuthOverlayProps {
  onSignIn: (u: string, p: string) => boolean;
  onSignUp: (u: string, p: string) => void;
  hasAccount: boolean;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ onSignIn, onSignUp, hasAccount }) => {
  const [isLogin, setIsLogin] = useState(hasAccount);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated validation to > 5 characters
    if (!username.trim() || password.length <= 5) {
      showError("Username is required and password must be more than 5 characters.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (isLogin) {
        const success = onSignIn(username, password);
        if (!success) showError("Invalid username or password.");
        else showSuccess(`Welcome back, ${username}!`);
      } else {
        onSignUp(username, password);
        showSuccess("Account created successfully!");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? "Welcome Back to SafeVault" : "Create Your Secure Vault"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Enter your credentials to access your files" : "Choose a username and a strong password"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold ml-1">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="More than 5 digits"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-emerald-500"
                  required
                />
              </div>
              {!isLogin && (
                <div className="flex items-center gap-1.5 mt-2 ml-1">
                  <div className={`h-1 flex-1 rounded-full ${password.length > 5 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className={`text-[10px] font-bold ${password.length > 5 ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {password.length > 5 ? 'Strong Enough' : 'Min 6 chars'}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              {isLoading ? "Verifying..." : isLogin ? "Sign In" : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
           <div className="flex items-center gap-2 text-[11px] font-medium">
             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Local Encryption
           </div>
           <div className="flex items-center gap-2 text-[11px] font-medium">
             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Zero Knowledge
           </div>
        </div>
      </div>
    </div>
  );
};