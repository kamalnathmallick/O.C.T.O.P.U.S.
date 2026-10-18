'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { Mail, Lock, User, Building, Shield, Eye, EyeOff, CheckCircle2, XCircle, Briefcase, Wrench } from 'lucide-react';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'OPERATOR' as 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'OPERATOR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.department
      );
      setSuccess(true);
      setTimeout(() => {
        setAuth(response.user, response.accessToken, response.refreshToken);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-slate-400 mb-6">Redirecting to your dashboard...</p>
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl max-w-md w-full"
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse-glow">
          <span className="text-4xl font-bold text-white">O</span>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm">Join the Octopus platform</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
        >
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="John Doe"
              required
            />
          </div>
        </motion.div>

        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="your.email@company.com"
              required
            />
          </div>
        </motion.div>

        {/* Department Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
          <div className="relative group">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Engineering"
              required
            />
          </div>
        </motion.div>

        {/* Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Create a strong password"
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
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      level <= passwordStrength
                        ? passwordStrength === 1
                          ? 'bg-red-500'
                          : passwordStrength === 2
                          ? 'bg-yellow-500'
                          : passwordStrength === 3
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {passwordStrength === 1 && 'Weak password'}
                {passwordStrength === 2 && 'Fair password'}
                {passwordStrength === 3 && 'Good password'}
                {passwordStrength === 4 && 'Strong password'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Confirm Password Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </>
              )}
            </p>
          )}
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.role === 'ADMIN'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'MANAGER' })}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.role === 'MANAGER'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Manager
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'TECHNICIAN' })}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.role === 'TECHNICIAN'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Technician
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'OPERATOR' })}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.role === 'OPERATOR'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <User className="w-4 h-4" />
              Operator
            </button>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          type="submit"
          disabled={isLoading || !passwordsMatch}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Create Account
            </>
          )}
        </motion.button>
      </form>

      {/* Back to Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-center"
      >
        <p className="text-slate-400 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

// Made with Bob
