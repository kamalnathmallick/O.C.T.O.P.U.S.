'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import AnimatedBackground from '@/components/animations/AnimatedBackground';
import FloatingElements from '@/components/animations/FloatingElements';
import { 
  Activity, Shield, TrendingUp, Zap, ChevronDown, 
  CheckCircle, Users, BarChart3, Bell, Wrench, 
  Clock, Database, Lock, Cpu, LineChart, Settings,
  Award, Target, Gauge, AlertTriangle
} from 'lucide-react';

type ViewMode = 'landing' | 'login' | 'register' | 'forgot-password';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  const scrollToAuth = () => {
    setViewMode('login');
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 animated-gradient-bg" />
      <AnimatedBackground />
      <FloatingElements />

      {/* Navigation Bar */}
      {viewMode === 'landing' && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-slate-700/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">O</span>
                </div>
                <span className="text-xl font-bold gradient-text">Octopus</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('benefits')} className="text-slate-300 hover:text-white transition-colors">Benefits</button>
                <button onClick={() => scrollToSection('solutions')} className="text-slate-300 hover:text-white transition-colors">Solutions</button>
                <button onClick={() => scrollToSection('stats')} className="text-slate-300 hover:text-white transition-colors">Stats</button>
              </div>
              <button
                onClick={scrollToAuth}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Landing Section */}
      {viewMode === 'landing' && (
        <>
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 pt-20"
          >
            <div className="max-w-6xl mx-auto text-center">
              {/* Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 1, delay: 0.2 }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl animate-pulse-glow"
              >
                <span className="text-6xl font-bold text-white">O</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              >
                <span className="gradient-text">Octopus</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <p className="text-3xl md:text-4xl text-slate-300 mb-4 font-light">
                  Predictive Maintenance Platform
                </p>
                <p className="text-xl text-blue-400 mb-8">
                  Powered by Artificial Intelligence
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Transform your industrial operations with AI-powered predictive analytics. 
                Prevent equipment failures, optimize maintenance schedules, and reduce downtime 
                by up to 70% with our enterprise-grade monitoring solution.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <button
                  onClick={scrollToAuth}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="px-10 py-4 glass-dark border border-slate-600/50 rounded-xl text-white font-semibold text-lg hover:border-blue-500/50 transition-all hover:scale-105 active:scale-95"
                >
                  Learn More
                </button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>ISO 27001 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>Industry Leader</span>
                </div>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-20"
              >
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-slate-400 hover:text-white transition-colors animate-bounce-subtle"
                >
                  <ChevronDown className="w-8 h-8 mx-auto" />
                  <span className="text-sm">Discover More</span>
                </button>
              </motion.div>
            </div>
          </motion.section>

          {/* Features Section */}
          <section id="features" className="min-h-screen flex items-center relative z-10 px-4 py-20">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-bold gradient-text mb-4">Powerful Features</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Everything you need to monitor, predict, and maintain your industrial equipment
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    icon: Activity, 
                    title: 'Real-time Monitoring', 
                    desc: 'Live sensor data tracking with millisecond precision across all equipment',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  { 
                    icon: Shield, 
                    title: 'AI Anomaly Detection', 
                    desc: 'Machine learning algorithms identify issues before they become failures',
                    color: 'from-purple-500 to-pink-500'
                  },
                  { 
                    icon: TrendingUp, 
                    title: 'Predictive Analytics', 
                    desc: 'Forecast equipment failures with 95% accuracy using historical data',
                    color: 'from-green-500 to-emerald-500'
                  },
                  { 
                    icon: Zap, 
                    title: 'Automated Workflows', 
                    desc: 'Smart maintenance scheduling and task assignment based on priorities',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  { 
                    icon: Bell, 
                    title: 'Smart Alerts', 
                    desc: 'Instant notifications via email, SMS, and mobile push for critical events',
                    color: 'from-red-500 to-rose-500'
                  },
                  { 
                    icon: BarChart3, 
                    title: 'Advanced Analytics', 
                    desc: 'Comprehensive dashboards with customizable KPIs and performance metrics',
                    color: 'from-indigo-500 to-blue-500'
                  },
                  { 
                    icon: Database, 
                    title: 'Data Integration', 
                    desc: 'Seamless connection with existing ERP, CMMS, and IoT systems',
                    color: 'from-teal-500 to-cyan-500'
                  },
                  { 
                    icon: Wrench, 
                    title: 'Maintenance Hub', 
                    desc: 'Centralized work order management with mobile technician access',
                    color: 'from-violet-500 to-purple-500'
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-dark p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all hover-lift group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="min-h-screen flex items-center relative z-10 px-4 py-20">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-bold gradient-text mb-4">Business Benefits</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Measurable ROI and operational excellence for your organization
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Target,
                    title: 'Reduce Downtime',
                    value: '70%',
                    desc: 'Decrease in unplanned equipment downtime through predictive maintenance'
                  },
                  {
                    icon: LineChart,
                    title: 'Cost Savings',
                    value: '40%',
                    desc: 'Reduction in maintenance costs by optimizing schedules and resources'
                  },
                  {
                    icon: Gauge,
                    title: 'Equipment Life',
                    value: '25%',
                    desc: 'Extension of asset lifespan through proactive care and monitoring'
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="glass-dark p-8 rounded-3xl border border-slate-700/50 text-center hover-lift"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-6xl font-bold gradient-text mb-4">{benefit.value}</div>
                    <h3 className="text-2xl font-semibold text-white mb-3">{benefit.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Solutions Section */}
          <section id="solutions" className="min-h-screen flex items-center relative z-10 px-4 py-20">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-bold gradient-text mb-4">Industry Solutions</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Tailored for your specific industrial needs
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Manufacturing',
                    desc: 'Optimize production lines, reduce machine failures, and improve OEE',
                    features: ['CNC Monitoring', 'Assembly Line Tracking', 'Quality Control']
                  },
                  {
                    title: 'Energy & Utilities',
                    desc: 'Monitor power generation equipment, turbines, and distribution systems',
                    features: ['Turbine Analytics', 'Grid Monitoring', 'Asset Performance']
                  },
                  {
                    title: 'Oil & Gas',
                    desc: 'Track drilling equipment, pipelines, and refinery operations',
                    features: ['Pipeline Integrity', 'Pump Monitoring', 'Safety Systems']
                  },
                  {
                    title: 'Transportation',
                    desc: 'Maintain fleet vehicles, rail systems, and logistics equipment',
                    features: ['Fleet Management', 'Rail Monitoring', 'Logistics Optimization']
                  },
                ].map((solution, index) => (
                  <motion.div
                    key={solution.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-dark p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all"
                  >
                    <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">{solution.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {solution.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section id="stats" className="min-h-screen flex items-center relative z-10 px-4 py-20">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-bold gradient-text mb-4">Trusted Worldwide</h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Join thousands of companies optimizing their operations
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                {[
                  { value: '500+', label: 'Enterprise Clients' },
                  { value: '50K+', label: 'Monitored Assets' },
                  { value: '99.9%', label: 'Uptime SLA' },
                  { value: '24/7', label: 'Support Available' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-2">{stat.value}</div>
                    <div className="text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-dark p-12 rounded-3xl border border-slate-700/50 text-center"
              >
                <h3 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h3>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  Transform your maintenance operations today. Start your free 30-day trial with full access to all features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={scrollToAuth}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
                  >
                    Start Free Trial
                  </button>
                  <button
                    onClick={scrollToAuth}
                    className="px-10 py-4 glass-dark border border-slate-600/50 rounded-xl text-white font-semibold text-lg hover:border-blue-500/50 transition-all hover:scale-105"
                  >
                    Request Demo
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Auth Section */}
      <section
        id="auth-section"
        className="min-h-screen flex items-center justify-center relative z-10 px-4 py-20"
      >
        <div className="w-full max-w-md">
          {viewMode === 'login' && (
            <LoginForm
              onForgotPassword={() => setViewMode('forgot-password')}
              onSignUp={() => setViewMode('register')}
            />
          )}
          {viewMode === 'register' && (
            <RegisterForm onBackToLogin={() => setViewMode('login')} />
          )}
          {viewMode === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setViewMode('login')} />
          )}

          {/* Back to Landing */}
          {viewMode !== 'landing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setViewMode('landing')}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                ← Back to Home
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative z-10 py-8 border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-2">
            © 2024 Octopus Platform. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Enterprise B2B Industrial Predictive Maintenance Solution
          </p>
        </div>
      </motion.footer>
    </main>
  );
}

// Made with Bob
