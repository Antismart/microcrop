import React from 'react';
import Header from '../components/layout/Header';
import { WeatherDashboard } from '../components/WeatherDashboard';
import { useFlowAuth } from '../hooks/useFlowAuth';

const Weather = () => {
  const { isConnected, logIn } = useFlowAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header onConnect={logIn} isConnected={isConnected} />
      <main className="container mx-auto px-4 py-8">
        <WeatherDashboard />
      </main>
    </div>
  );
};

export default Weather;
