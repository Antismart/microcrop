import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  alerts?: string[];
}

interface WeatherWidgetProps {
  data: WeatherData;
  compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, compact = false }) => {
  const getWeatherIcon = () => {
    switch (data.condition) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-accent" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-muted-foreground" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-secondary" />;
      default:
        return <Sun className="h-6 w-6 text-accent" />;
    }
  };

  const getRiskLevel = () => {
    if (data.rainfall > 100 || data.temperature > 35 || data.temperature < 5) {
      return { level: 'High', color: 'destructive' };
    } else if (data.rainfall < 10 || data.temperature > 30 || data.temperature < 10) {
      return { level: 'Medium', color: 'warning' };
    }
    return { level: 'Low', color: 'success' };
  };

  const risk = getRiskLevel();

  if (compact) {
    return (
      <Card className="shadow-card border-0 gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getWeatherIcon()}
              <div>
                <p className="font-medium text-sm">{data.location}</p>
                <p className="text-2xl font-bold">{data.temperature}°C</p>
              </div>
            </div>
            <Badge variant={risk.color as any} className="text-xs">
              {risk.level} Risk
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{data.location}</span>
          <Badge variant={risk.color as any}>
            {risk.level} Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Weather */}
        <div className="flex items-center space-x-4">
          {getWeatherIcon()}
          <div>
            <p className="text-3xl font-bold">{data.temperature}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{data.condition}</p>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-semibold">{data.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-secondary" />
            <div>
              <p className="text-xs text-muted-foreground">Rainfall</p>
              <p className="font-semibold">{data.rainfall}mm</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-semibold">{data.windSpeed} km/h</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Feels like</p>
              <p className="font-semibold">{data.temperature + 2}°C</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Weather Alerts</p>
            {data.alerts.map((alert, index) => (
              <Badge key={index} variant="warning" className="text-xs">
                {alert}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;