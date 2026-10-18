'use client';

export default function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-40 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      
      {/* Geometric Shapes */}
      <div className="absolute top-1/4 left-1/3 w-32 h-32 border border-blue-500/20 rotate-45 animate-spin-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-purple-500/20 rotate-12 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" />
    </div>
  );
}

// Made with Bob
