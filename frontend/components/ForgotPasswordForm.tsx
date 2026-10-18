'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            We've sent password reset instructions to <br />
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-300">
              <strong className="text-blue-400">Note:</strong> The link will expire in 1 hour. 
              If you don't see the email, check your spam folder.
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sign In
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-3xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
    >
      {/* Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse-glow">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Reset Password</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Enter your email address and we'll send you <br />
          instructions to reset your password
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4"
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-blue-400">Security Note:</strong> For your protection, 
            we'll send the reset link only if this email is registered in our system.
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Reset Link
            </>
          )}
        </motion.button>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          type="button"
          onClick={onBack}
          className="w-full py-3 px-6 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-slate-300 font-medium flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Sign In
        </motion.button>
      </form>

      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

// Made with Bob
