import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/ui/StatCard';
import WeatherWidget from '@/components/ui/WeatherWidget';
import { useFlowAuth } from '@/hooks/useFlowAuth';
import {
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  MapPin,
  Users,
  Zap,
  Globe,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const { user, logIn, logOut, isLoading, isConnected } = useFlowAuth();

  // Mock data for the landing page
  const protocolStats = {
    tvl: '$2.4M',
    activePolicies: '156',
    totalClaims: '$340K',
    yieldGenerated: '14.2%'
  };

  const weatherData = {
    location: 'Global Average',
    temperature: 22,
    humidity: 58,
    rainfall: 45,
    windSpeed: 12,
    condition: 'sunny' as const,
    alerts: []
  };

  const features = [
    {
      icon: Shield,
      title: 'Decentralized Insurance',
      description: 'Smart contract-based crop insurance with transparent, automated payouts'
    },
    {
      icon: DollarSign,
      title: 'Yield Generation',
      description: 'Earn competitive returns by providing liquidity to insurance pools'
    },
    {
      icon: Globe,
      title: 'Weather Integration',
      description: 'Real-time weather data from WeatherXM network for accurate risk assessment'
    },
    {
      icon: Zap,
      title: 'Instant Claims',
      description: 'Automated claim processing based on verified weather conditions'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onConnect={logIn} 
        isConnected={isConnected} 
        address={user?.addr}
      />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="animate-pulse-glow">
                  Built on Flow Blockchain
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight animate-slide-up">
                  Protect Your Crops with{' '}
                  <span className="gradient-hero bg-clip-text text-transparent">
                    DeFi Insurance
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  MicroCrop connects farmers with liquidity providers through decentralized crop insurance, 
                  offering automated weather-based payouts and competitive yields.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" className="animate-float shadow-glow">
                  Get Insurance
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="outline" size="xl" className="border-2 hover:shadow-card">
                  Provide Liquidity
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{protocolStats.tvl}</p>
                  <p className="text-sm text-muted-foreground">Total Value Locked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">{protocolStats.activePolicies}</p>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{protocolStats.yieldGenerated}</p>
                  <p className="text-sm text-muted-foreground">Avg. Yield</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <WeatherWidget data={weatherData} />
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-success" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Corn policy payout</span>
                    </div>
                    <span className="text-sm font-medium">$8,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm">New liquidity added</span>
                    </div>
                    <span className="text-sm font-medium">$25,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Policy purchased</span>
                    </div>
                    <span className="text-sm font-medium">$12,000</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Value Locked"
              value={protocolStats.tvl}
              change="+15.3%"
              changeType="positive"
              icon={DollarSign}
              variant="accent"
            />
            <StatCard
              title="Active Policies"
              value={protocolStats.activePolicies}
              change="+8 this week"
              changeType="positive"
              icon={Shield}
            />
            <StatCard
              title="Claims Paid"
              value={protocolStats.totalClaims}
              change="100% automated"
              changeType="neutral"
              icon={CheckCircle}
              variant="secondary"
            />
            <StatCard
              title="Average Yield"
              value={protocolStats.yieldGenerated}
              change="+2.1%"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Why Choose MicroCrop?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our protocol combines the security of blockchain with real-world agricultural needs, 
              creating a sustainable ecosystem for farmers and investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift shadow-card">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Protect Your Crops or Earn Yield?
            </h2>
            <p className="text-xl text-white/80">
              Join the MicroCrop ecosystem today and be part of the future of agricultural insurance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="xl" className="text-primary">
                Browse Policies
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-primary">
                View Pools
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
