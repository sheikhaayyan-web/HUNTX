// ==============================================================================
// SCREENS 3, 4, 5: LOGIN, REGISTRATION & GUEST JOIN SCREENS
// Supabase Auth Integration with local fallback & guest profile generation
// ==============================================================================

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, KeyRound, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ------------------------------------------------------------------------------
// SCREEN 3: LOGIN SCREEN
// ------------------------------------------------------------------------------
interface LoginScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSuccess, onGoToRegister }) => {
  const { loginWithEmail, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setResetMsg('Please type your registered email address first.');
      return;
    }
    const res = await resetPassword(email);
    setResetMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-6 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-display font-black tracking-wider text-white">
          OPERATOR <span className="text-huntx-accent">LOGIN</span>
        </h2>
        <p className="text-xs text-huntx-muted mt-1">Sign in with your registered HUNTX esports credentials.</p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@huntx.com"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs uppercase font-bold text-huntx-muted">Password</label>
              <button
                type="button"
                onClick={() => setShowForgot(!showForgot)}
                className="text-[11px] text-huntx-accent hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange transition-all disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}
          </button>
        </form>

        {showForgot && (
          <div className="mt-4 p-4 rounded-xl bg-huntx-surface border border-huntx-border text-xs">
            <h4 className="font-bold text-white mb-1 flex items-center space-x-1.5">
              <KeyRound className="w-4 h-4 text-huntx-accent" />
              <span>Password Reset Request</span>
            </h4>
            <p className="text-huntx-muted mb-2">We will dispatch recovery instructions to your email address.</p>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-huntx-surfaceLight hover:bg-huntx-border text-white rounded-lg font-bold"
            >
              Send Reset Link
            </button>
            {resetMsg && <p className="mt-2 text-huntx-accent">{resetMsg}</p>}
          </div>
        )}
      </div>

      <div className="pt-6 text-center border-t border-huntx-border">
        <p className="text-xs text-huntx-muted">
          Need a registered hosting account?{' '}
          <button onClick={onGoToRegister} className="text-huntx-accent font-bold hover:underline">
            Register Operator
          </button>
        </p>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 4: REGISTRATION SCREEN
// ------------------------------------------------------------------------------
interface RegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSuccess, onGoToLogin }) => {
  const { registerWithEmail } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await registerWithEmail(email, password, username, displayName || username);
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-6 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-display font-black tracking-wider text-white">
          CREATE <span className="text-huntx-accent">ACCOUNT</span>
        </h2>
        <p className="text-xs text-huntx-muted mt-1">
          Registered accounts unlock Game Hosting, custom zones, and persistent stats.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">Display Call-sign</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Viper_99"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">Unique Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-huntx-muted">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="viper99"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange transition-all disabled:opacity-50"
          >
            {loading ? 'REGISTERING...' : 'REGISTER AS OPERATOR'}
          </button>
        </form>
      </div>

      <div className="pt-6 text-center border-t border-huntx-border">
        <p className="text-xs text-huntx-muted">
          Already have an account?{' '}
          <button onClick={onGoToLogin} className="text-huntx-accent font-bold hover:underline">
            Operator Login
          </button>
        </p>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------
// SCREEN 5: GUEST JOIN SCREEN
// ------------------------------------------------------------------------------
interface GuestJoinScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const GuestJoinScreen: React.FC<GuestJoinScreenProps> = ({ onBack, onSuccess }) => {
  const { loginAsGuest } = useAuth();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await loginAsGuest(nickname);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-huntx-bg p-6 flex flex-col justify-between max-w-md mx-auto">
      <div>
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-huntx-surface border border-huntx-border text-huntx-muted hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-huntx-surface border border-huntx-border w-fit mb-3">
          <Sparkles className="w-3.5 h-3.5 text-huntx-accent" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-huntx-muted">
            NO PASSWORD REQUIRED
          </span>
        </div>

        <h2 className="text-3xl font-display font-black tracking-wider text-white">
          GUEST <span className="text-huntx-accent">MODE</span>
        </h2>
        <p className="text-xs text-huntx-muted mt-1">
          Jump straight into a friend's room. A temporary player ID and unique QR token will be generated automatically.
        </p>

        <form onSubmit={handleGuestJoin} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-huntx-muted block mb-1.5">
              Player Nickname (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-huntx-muted" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Shadow_Rider"
                maxLength={20}
                className="w-full bg-huntx-surface border border-huntx-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-huntx-muted/60 focus:outline-none focus:border-huntx-accent"
              />
            </div>
            <p className="text-[11px] text-huntx-muted/80 mt-1">
              Leave blank to automatically get a tactical random call-sign.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-huntx-surface/60 border border-huntx-border space-y-2 text-xs text-huntx-muted">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Check className="w-4 h-4 text-huntx-runner" />
              <span>Full match participation (Hunters & Runners)</span>
            </div>
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Check className="w-4 h-4 text-huntx-runner" />
              <span>Generates authentic Runner QR pass</span>
            </div>
            <div className="flex items-center space-x-2 text-amber-400/90 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Expires after 24 hours (Only registered hosts can create rooms)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-huntx-accent hover:bg-huntx-accentHover text-black font-black text-sm uppercase tracking-wider shadow-glow-orange transition-all disabled:opacity-50"
          >
            {loading ? 'GENERATING GUEST PASS...' : 'ENTER AS GUEST'}
          </button>
        </form>
      </div>
    </div>
  );
};
