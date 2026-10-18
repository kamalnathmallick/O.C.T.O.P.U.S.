'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, User, Briefcase, Wrench } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export default function LoginForm({ onForgotPassword, onSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'OPERATOR'>('OPERATOR');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password, role);
      setAuth(response.user, response.accessToken, response.refreshToken);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
    >
      {/* Logo and Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse-glow">
          <span className="text-4xl font-bold text-white">O</span>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="your.email@company.com"
              required
            />
          </div>
        </motion.div>

        {/* Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                role === 'ADMIN'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('MANAGER')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                role === 'MANAGER'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Manager
            </button>
            <button
              type="button"
              onClick={() => setRole('TECHNICIAN')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                role === 'TECHNICIAN'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Technician
            </button>
            <button
              type="button"
              onClick={() => setRole('OPERATOR')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                role === 'OPERATOR'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <User className="w-4 h-4" />
              Operator
            </button>
          </div>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between text-sm"
        >
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Forgot Password?
          </button>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </motion.button>
      </form>

      {/* Sign Up Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSignUp}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign Up
          </button>
        </p>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

// Made with Bob
