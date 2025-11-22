import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full font-sans overflow-x-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      
      {/* Modern Ambient Background */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        {/* Gradient Mesh Base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,1),rgba(15,23,42,1))]" />
        
        {/* Floating 3D Orbs / Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-rose-300/30 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-[80px] animate-float-slow opacity-70"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-sky-300/30 dark:bg-sky-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-[80px] animate-float-medium opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-violet-300/30 dark:bg-violet-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-[80px] animate-float-fast opacity-70"></div>
        
        {/* Grid Pattern Overlay for Technical Feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <main className="relative z-10 h-full w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;