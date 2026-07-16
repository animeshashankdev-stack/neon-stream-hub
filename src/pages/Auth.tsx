import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Auth = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      navigate(params.get("next") || "/", { replace: true });
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setLoading(false); }
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
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Welcome, senpai.
              </h2>
              <p className="text-sm text-white/50">
                Sign in with your Google account to stream, save, and sync across devices.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-white text-[#1a1a2e] font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-8 space-y-3">
              {["No password to remember", "Your Google profile picture — automatically", "One tap, everywhere you sign in"].map((f) => (
                <div key={f} className="flex items-start gap-3 text-white/70 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-teal-300" />
                  </span>
                  {f}
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-white/40 mt-8">
              By continuing you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
