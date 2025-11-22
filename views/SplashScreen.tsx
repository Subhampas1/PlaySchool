import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen animate-pulse">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-rose-300 to-sky-300 rounded-full flex items-center justify-center">
            <span className="text-5xl">🧸</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800">
          Tiny Toddlers Playschool
        </h1>
      </div>
    </div>
  );
};

export default SplashScreen;
