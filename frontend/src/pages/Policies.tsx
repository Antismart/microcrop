import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Shield, DollarSign, Calendar } from 'lucide-react';

const Policies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const policies = [
    {
      id: 1,
      crop: 'Corn',
      location: 'Iowa, USA',
      coverage: 50000,
      premium: 850,
      duration: '6 months',
      riskLevel: 'Low',
      weatherTrigger: 'Drought protection',
      yieldProtection: '85%',
      available: true
    },
    {
      id: 2,
      crop: 'Soybeans',
      location: 'Illinois, USA',
      coverage: 40000,
      premium: 720,
      duration: '5 months',
      riskLevel: 'Medium',
      weatherTrigger: 'Flood & drought',
      yieldProtection: '80%',
      available: true
    },
    {
      id: 3,
      crop: 'Wheat',
      location: 'Kansas, USA',
      coverage: 35000,
      premium: 630,
      duration: '4 months',
      riskLevel: 'High',
      weatherTrigger: 'Hail protection',
      yieldProtection: '90%',
      available: false
    },
    {
      id: 4,
      crop: 'Rice',
      location: 'California, USA',
      coverage: 45000,
      premium: 780,
      duration: '6 months',
      riskLevel: 'Medium',
      weatherTrigger: 'Drought protection',
      yieldProtection: '85%',
      available: true
    }
  ];

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'destructive';
      default: return 'default';
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'all' || policy.crop.toLowerCase() === selectedCrop;
    const matchesLocation = selectedLocation === 'all' || 
                           policy.location.toLowerCase().includes(selectedLocation);
    
    return matchesSearch && matchesCrop && matchesLocation;
  });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insurance Policies</h1>
          <p className="text-muted-foreground">
            Browse and purchase crop insurance policies tailored to your needs
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="corn">Corn</SelectItem>
                <SelectItem value="soybeans">Soybeans</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="iowa">Iowa</SelectItem>
                <SelectItem value="illinois">Illinois</SelectItem>
                <SelectItem value="kansas">Kansas</SelectItem>
                <SelectItem value="california">California</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="hover-lift shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {policy.crop[0]}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{policy.crop}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {policy.location}
                    </div>
                  </div>
                </div>
                <Badge variant={getRiskBadgeVariant(policy.riskLevel) as any}>
                  {policy.riskLevel} Risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-4 w-4 text-primary mr-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <p className="font-bold">${policy.coverage.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="h-4 w-4 text-secondary mr-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="font-bold">${policy.premium}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="text-sm font-medium">{policy.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Protection:</span>
                  <span className="text-sm font-medium">{policy.weatherTrigger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Yield Protection:</span>
                  <span className="text-sm font-medium">{policy.yieldProtection}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                {policy.available ? (
                  <Button className="w-full" variant="hero">
                    Purchase Policy
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Currently Unavailable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <div className="h-16 w-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No policies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters to find more policies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Policies;