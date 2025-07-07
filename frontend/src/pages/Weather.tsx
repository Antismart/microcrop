import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WeatherWidget from '@/components/ui/WeatherWidget';
import StatCard from '@/components/ui/StatCard';
import {
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

const Weather = () => {
  const [selectedRegion, setSelectedRegion] = useState('midwest');

  const currentWeatherData = {
    location: 'Iowa, USA',
    temperature: 24,
    humidity: 68,
    rainfall: 12,
    windSpeed: 15,
    condition: 'cloudy' as const,
    alerts: ['High wind warning until 6 PM', 'Possible storm activity']
  };

  const regionalData = [
    {
      id: 'midwest',
      name: 'Midwest',
      temperature: 24,
      condition: 'cloudy' as const,
      riskLevel: 'Medium',
      alerts: 2
    },
    {
      id: 'southwest',
      name: 'Southwest',
      temperature: 32,
      condition: 'sunny' as const,
      riskLevel: 'High',
      alerts: 1
    },
    {
      id: 'southeast',
      name: 'Southeast',
      temperature: 28,
      condition: 'rainy' as const,
      riskLevel: 'Low',
      alerts: 0
    },
    {
      id: 'pacific',
      name: 'Pacific Northwest',
      temperature: 18,
      condition: 'rainy' as const,
      riskLevel: 'Medium',
      alerts: 1
    }
  ];

  const weatherAlerts = [
    {
      type: 'severe',
      title: 'Severe Weather Warning',
      region: 'Kansas, Nebraska',
      description: 'Potential hail and high winds expected',
      time: '2 hours ago',
      risk: 'High'
    },
    {
      type: 'drought',
      title: 'Drought Advisory',
      region: 'Texas, Oklahoma',
      description: 'Extended dry period affecting crop yields',
      time: '6 hours ago',
      risk: 'Medium'
    },
    {
      type: 'flood',
      title: 'Flood Watch',
      region: 'Iowa, Illinois',
      description: 'Heavy rainfall expected in next 24 hours',
      time: '1 day ago',
      risk: 'Medium'
    }
  ];

  const historicalData = [
    { month: 'Jan', rainfall: 45, temperature: -2, claims: 12 },
    { month: 'Feb', rainfall: 38, temperature: 1, claims: 8 },
    { month: 'Mar', rainfall: 52, temperature: 8, claims: 15 },
    { month: 'Apr', rainfall: 68, temperature: 15, claims: 22 },
    { month: 'May', rainfall: 85, temperature: 21, claims: 18 },
    { month: 'Jun', rainfall: 95, temperature: 26, claims: 25 },
  ];

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Weather Monitoring
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time weather data and risk assessment for agricultural insurance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Alerts"
            value="4"
            change="+2 from yesterday"
            changeType="negative"
            icon={AlertTriangle}
            variant="accent"
          />
          <StatCard
            title="Avg Temperature"
            value="24°C"
            change="+3°C from last week"
            changeType="positive"
            icon={Thermometer}
          />
          <StatCard
            title="Total Rainfall"
            value="125mm"
            change="+15mm this month"
            changeType="positive"
            icon={Droplets}
            variant="secondary"
          />
          <StatCard
            title="Wind Speed"
            value="15 km/h"
            change="Normal conditions"
            changeType="neutral"
            icon={Wind}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="regional">Regional Data</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Weather */}
              <div className="lg:col-span-1">
                <WeatherWidget data={currentWeatherData} />
              </div>

              {/* Today's Forecast */}
              <div className="lg:col-span-2">
                <Card className="shadow-card gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      24-Hour Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { time: '12:00', temp: 24, icon: Cloud, condition: 'Cloudy' },
                        { time: '15:00', temp: 27, icon: Sun, condition: 'Sunny' },
                        { time: '18:00', temp: 22, icon: CloudRain, condition: 'Light Rain' },
                        { time: '21:00', temp: 19, icon: Cloud, condition: 'Overcast' }
                      ].map((hour, index) => (
                        <div key={index} className="text-center space-y-2">
                          <p className="text-sm font-medium">{hour.time}</p>
                          <hour.icon className="h-6 w-6 mx-auto text-secondary" />
                          <p className="font-bold">{hour.temp}°C</p>
                          <p className="text-xs text-muted-foreground">{hour.condition}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Weekly Outlook */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>7-Day Weather Outlook</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { day: 'Today', high: 24, low: 18, condition: 'Cloudy', rain: 20 },
                    { day: 'Tomorrow', high: 27, low: 20, condition: 'Sunny', rain: 5 },
                    { day: 'Wednesday', high: 22, low: 16, condition: 'Rainy', rain: 85 },
                    { day: 'Thursday', high: 25, low: 19, condition: 'Cloudy', rain: 30 },
                    { day: 'Friday', high: 28, low: 22, condition: 'Sunny', rain: 10 },
                    { day: 'Saturday', high: 26, low: 20, condition: 'Partly Cloudy', rain: 15 },
                    { day: 'Sunday', high: 23, low: 17, condition: 'Rainy', rain: 70 }
                  ].map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-4">
                        <p className="font-medium w-20">{day.day}</p>
                        <div className="flex items-center space-x-2">
                          {day.condition.includes('Sunny') ? 
                            <Sun className="h-4 w-4 text-accent" /> :
                            day.condition.includes('Rainy') ?
                            <CloudRain className="h-4 w-4 text-secondary" /> :
                            <Cloud className="h-4 w-4 text-muted-foreground" />
                          }
                          <span className="text-sm text-muted-foreground">{day.condition}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <span className="font-bold">{day.high}°</span>
                          <span className="text-muted-foreground">/{day.low}°</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-secondary">{day.rain}%</span>
                          <p className="text-xs text-muted-foreground">rain</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {regionalData.map((region) => (
                <Card 
                  key={region.id}
                  className={`cursor-pointer transition-smooth hover-lift ${
                    selectedRegion === region.id ? 'ring-2 ring-primary shadow-primary' : 'shadow-card'
                  }`}
                  onClick={() => setSelectedRegion(region.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{region.name}</h3>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{region.temperature}°C</span>
                        {region.condition === 'sunny' ? 
                          <Sun className="h-5 w-5 text-accent" /> :
                          region.condition === 'rainy' ?
                          <CloudRain className="h-5 w-5 text-secondary" /> :
                          <Cloud className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={getRiskBadgeColor(region.riskLevel) as any}>
                          {region.riskLevel} Risk
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {region.alerts} alerts
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Region Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>
                  {regionalData.find(r => r.id === selectedRegion)?.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Conditions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature</span>
                        <span className="font-medium">24°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Humidity</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wind Speed</span>
                        <span className="font-medium">15 km/h</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Drought Risk</span>
                        <Badge variant="warning">Medium</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Flood Risk</span>
                        <Badge variant="success">Low</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storm Risk</span>
                        <Badge variant="destructive">High</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Insurance Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Policies</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Amount</span>
                        <span className="font-medium">$2.1M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Claims This Month</span>
                        <span className="font-medium">43</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Weather Alerts</h2>
              <Button className="gradient-primary text-primary-foreground">
                Configure Alerts
              </Button>
            </div>

            <div className="space-y-4">
              {weatherAlerts.map((alert, index) => (
                <Card key={index} className="shadow-card hover-lift transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{alert.title}</h3>
                          <p className="text-muted-foreground">{alert.region}</p>
                          <p className="text-sm">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                      <Badge variant={getRiskBadgeColor(alert.risk) as any}>
                        {alert.risk} Risk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alert Configuration */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Alert Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature Threshold</label>
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        placeholder="Min °C" 
                        className="flex-1 p-2 border rounded-md bg-input"
                      />
                      <input 
                        type="number" 
                        placeholder="Max °C" 
                        className="flex-1 p-2 border rounded-md bg-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rainfall Threshold (mm)</label>
                    <input 
                      type="number" 
                      placeholder="Alert above" 
                      className="w-full p-2 border rounded-md bg-input"
                    />
                  </div>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground">
                  Save Alert Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather Trends */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weather Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Temperature Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Average temperature has increased by 2.3°C compared to last year, 
                        indicating higher drought risk for summer crops.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Precipitation Patterns</h4>
                      <p className="text-sm text-muted-foreground">
                        Rainfall distribution shows 15% increase in spring months, 
                        potentially beneficial for crop germination.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Extreme Weather Events</h4>
                      <p className="text-sm text-muted-foreground">
                        Storm frequency has increased by 22% this season, 
                        leading to higher insurance claim rates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Impact on Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
                      <div>
                        <p className="font-medium text-success">Successful Predictions</p>
                        <p className="text-sm text-muted-foreground">Weather-based claims</p>
                      </div>
                      <span className="text-2xl font-bold text-success">87%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-warning/10">
                      <div>
                        <p className="font-medium text-warning">Average Claim Time</p>
                        <p className="text-sm text-muted-foreground">From weather event</p>
                      </div>
                      <span className="text-2xl font-bold text-warning">2.4h</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/10">
                      <div>
                        <p className="font-medium text-secondary">Data Accuracy</p>
                        <p className="text-sm text-muted-foreground">Weather measurements</p>
                      </div>
                      <span className="text-2xl font-bold text-secondary">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Data Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Historical Weather & Claims Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Month</th>
                        <th className="text-left p-3">Avg Temp (°C)</th>
                        <th className="text-left p-3">Rainfall (mm)</th>
                        <th className="text-left p-3">Claims Filed</th>
                        <th className="text-left p-3">Payout Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicalData.map((data, index) => (
                        <tr key={index} className="border-b hover:bg-muted/30 transition-smooth">
                          <td className="p-3 font-medium">{data.month}</td>
                          <td className="p-3">{data.temperature}°C</td>
                          <td className="p-3">{data.rainfall}mm</td>
                          <td className="p-3">{data.claims}</td>
                          <td className="p-3 text-success font-medium">
                            ${(data.claims * 850).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Weather;