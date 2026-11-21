import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, loading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      await register(name, email, password);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-950/50 border border-white/30 p-7 sm:p-8 transition-all">
        {/* Top Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-5">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Real-Time Workspace
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-6">
          {isRegister
            ? "Sign up to start instant real-time conversations"
            : "Sign in to pick up right where you left off"}
        </p>

        {error && (
          <div className="mb-5 rounded-2xl bg-rose-50/90 border border-rose-200 px-4 py-3 text-xs sm:text-sm text-rose-700 flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sandhya"
                className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sandhya@gmail.com"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99] text-white font-semibold py-2.5 text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition cursor-pointer"
          >
            {isRegister ? "Sign In" : "Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}