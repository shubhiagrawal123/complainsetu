import React, { useState } from 'react';

import Home from './screens/Home';
import Dashboard from './screens/Dashboard';
import TrackComplaint from './screens/TrackComplaint';
import RegisterComplaint from './screens/RegisterComplaint';

const App = () => {

  const [currentPath, setCurrentPath] = useState('home');

  const handleNavigate = (path) => {
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPath) {

      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;

      case 'register':
        return <RegisterComplaint onNavigate={handleNavigate} />;

      case 'track':
        return <TrackComplaint onNavigate={handleNavigate} />;

      case 'home':
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {renderPage()}
    </main>
  );
};

export default App;