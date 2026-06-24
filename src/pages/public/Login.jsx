import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { customerLogin, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await customerLogin(email, password);
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-28 pb-12">
      <Helmet>
        <title>Login | Cake Paradise</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-10rem)] max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-sm border border-rose-gold/10 bg-white">
        {/* ===== Left Decorative Panel ===== */}
        {/* Desktop version */}
        <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-gradient-to-br from-deep-burgundy to-dark-chocolate">
          {/* Polka dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Subtle glow */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-gold/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-warm-pink/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
            <img
              src="/images/logo.png"
              alt="Cake Paradise by Sayu"
              className="w-28 h-28 object-contain mb-8 drop-shadow-lg"
            />
            <h1 className="text-4xl xl:text-5xl font-display font-bold !text-white leading-tight mb-4">
              Welcome Back to
              <br />
              <span className="text-champagne">Cake Paradise</span>
            </h1>
            <p className="text-rose-gold-light/80 text-lg max-w-sm leading-relaxed font-body">
              Sign in to manage your orders, track deliveries, and explore our
              freshly baked collection.
            </p>

            {/* Decorative divider */}
            <div className="mt-10 flex items-center gap-3">
              <span className="block w-8 h-px bg-rose-gold/40" />
              <span className="block w-2 h-2 rounded-full bg-rose-gold/50" />
              <span className="block w-8 h-px bg-rose-gold/40" />
            </div>
          </div>
        </div>

        {/* Mobile decorative header */}
        <div className="lg:hidden relative overflow-hidden bg-gradient-to-br from-deep-burgundy to-dark-chocolate px-6 pt-24 pb-10 text-center">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.5) 2px, transparent 2px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative z-10">
            <img
              src="/images/logo.png"
              alt="Cake Paradise by Sayu"
              className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl font-display font-bold !text-white leading-tight">
              Welcome Back to{' '}
              <span className="text-champagne">Cake Paradise</span>
            </h1>
          </div>
        </div>

        {/* ===== Right Form Panel ===== */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16 bg-cream/30">
          <div className="w-full max-w-md">
            <div className="bg-champagne-light rounded-3xl shadow-card p-8 md:p-10 border border-champagne">
              {/* Form header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-dark-chocolate mb-2">
                  Sign In
                </h2>
                <p className="text-charcoal-light text-sm">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-3 bg-rose-gold/10 border border-rose-gold/20 text-rose-gold-dark p-4 rounded-xl mb-6 text-sm animate-scale-in">
                  <svg
                    className="w-5 h-5 shrink-0 text-rose-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-gold/50" />
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10 transition-all bg-cream/50 text-dark-chocolate placeholder:text-gray-400 font-body"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-gold/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10 transition-all bg-cream/50 text-dark-chocolate placeholder:text-gray-400 font-body"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-rose-gold transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-sm text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-gold to-rose-gold-dark text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register link */}
              <p className="mt-8 text-center text-charcoal-light text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-rose-gold font-bold hover:text-rose-gold-dark hover:underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
