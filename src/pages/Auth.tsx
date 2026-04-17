import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Sparkles, Check } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error.message);
      else setSuccess("Check your email to confirm your account!");
    }
    setLoading(false);
  };

  const features = [
    "Stream in crisp 4K — no buffering, no nonsense",
    "Sub or Dub, switch language on the fly",
    "Free forever. Ad-light. Built for Gen-Z.",
  ];

  return (
    <div className="min-h-screen bg-[#080818] text-white font-body grid lg:grid-cols-2 relative overflow-hidden">
      {/* Ambient blobs (global background) */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-fuchsia-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/10 blur-[120px]" />

      {/* LEFT — Hero */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-white/10 overflow-hidden">
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img src="/logo.svg" alt="Senpai.tv" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
          <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-fuchsia-400">
            Senpai<span className="text-white/40 font-light">.tv</span>
          </span>
        </Link>

        <div className="relative z-10 flex flex-col items-start">
          {/* Giant kana glyph */}
          <div className="relative mb-10">
            <div className="absolute inset-0 blur-[60px] opacity-60 bg-gradient-to-br from-teal-400 via-cyan-400 to-fuchsia-500 rounded-full" />
            <img
              src="/logo.svg"
              alt=""
              className="relative w-48 h-48 xl:w-64 xl:h-64 drop-shadow-[0_0_50px_rgba(45,212,191,0.6)]"
            />
          </div>

          <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-4">
            Stream the<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-fuchsia-400">
              senpai way.
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-md leading-relaxed mb-8">
            Anime, cartoons, movies & series — curated, clean, and crafted for the way you actually watch.
          </p>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-teal-300" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/30 font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} Senpai.tv · Built different.
        </p>
      </div>

      {/* RIGHT — Form */}
      <div className="relative flex items-center justify-center px-4 sm:px-8 py-10 lg:py-0">
        {/* Mobile mini hero */}
        <div className="lg:hidden absolute top-6 left-0 right-0 flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Senpai.tv" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-fuchsia-400">
              Senpai<span className="text-white/40 font-light">.tv</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-md mt-16 lg:mt-0">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight mb-1">
                {mode === "login" ? "Welcome back, senpai." : "Join the club."}
              </h2>
              <p className="text-sm text-white/50">
                {mode === "login" ? "Pick up where you left off." : "Free account · No card needed."}
              </p>
            </div>

            <div className="flex mb-6 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-black shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-black shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-[11px] text-white/50 mb-1.5 block font-bold uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 focus:bg-white/10 text-sm transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-[11px] text-white/50 mb-1.5 block font-bold uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 focus:bg-white/10 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 mb-1.5 block font-bold uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-400/50 focus:bg-white/10 text-sm transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-teal-300 text-xs bg-teal-500/10 border border-teal-400/20 rounded-lg px-3 py-2">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-black text-sm hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-white/40 mt-6">
              By continuing you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
