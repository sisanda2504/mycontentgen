import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Sparkles, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export function AuthModal({ onClose }: { onClose?: () => void }) {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      login(email, password);
    } else {
      register(email, password, name);
    }
  };

  const switchMode = () => {
    clearError();
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {mode === "login" ? "Welcome back" : "Join GenMix"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your account" : "Create your free account"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl bg-input px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full btn-glow rounded-xl px-4 py-3 flex items-center justify-center gap-2">
            {mode === "login" ? <><LogIn className="h-4 w-4" /> Sign In</> : <><UserPlus className="h-4 w-4" /> Create Account</>}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button onClick={switchMode} className="ml-1 text-primary hover:underline font-medium">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        {onClose && (
          <button onClick={onClose} className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground">
            Continue as guest
          </button>
        )}
      </div>
    </div>
  );
}
