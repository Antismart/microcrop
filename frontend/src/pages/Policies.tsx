import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/Header';
import { useFlowAuth } from '@/hooks/useFlowAuth';
import { useOracle } from '@/hooks/useOracle';
import { Search, Filter, MapPin, Shield, DollarSign, Calendar, Loader2, AlertTriangle, Plus, X } from 'lucide-react';

const Policies: React.FC = () => {
  const { user, logIn, logOut, isLoading: authLoading, isConnected } = useFlowAuth();
  const { getOracleStats, registerPolicy, txStatus } = useOracle();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [userPolicies, setUserPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomPolicyModal, setShowCustomPolicyModal] = useState(false);
  
  // Custom Policy Form Data
  const [customPolicy, setCustomPolicy] = useState({
    cropType: '',
    location: '',
    coverageAmount: 0,
    farmSize: 0,
    farmSizeUnit: 'acres',
    riskFactors: [] as string[],
    customConditions: '',
    duration: 6,
    expectedYield: 0,
    yieldUnit: 'tons'
  });

  // Kenya-specific data
  const kenyanCrops = [
    { value: 'maize', label: 'Maize', description: 'Staple food crop' },
    { value: 'coffee', label: 'Coffee', description: 'Export cash crop' },
    { value: 'tea', label: 'Tea', description: 'Highland plantation crop' },
    { value: 'wheat', label: 'Wheat', description: 'Grain crop' },
    { value: 'rice', label: 'Rice', description: 'Paddy crop' },
    { value: 'beans', label: 'Beans', description: 'Legume crop' },
    { value: 'sugarcane', label: 'Sugarcane', description: 'Cash crop' },
    { value: 'cotton', label: 'Cotton', description: 'Fiber crop' }
  ];

  const kenyanLocations = [
    { value: 'nairobi', label: 'Nairobi', coordinates: [-1.2921, 36.8219] },
    { value: 'nakuru', label: 'Nakuru', coordinates: [-0.3031, 36.0800] },
    { value: 'meru', label: 'Meru', coordinates: [0.0469, 37.6551] },
    { value: 'kitale', label: 'Kitale', coordinates: [1.0172, 35.0062] },
    { value: 'kericho', label: 'Kericho', coordinates: [-0.3677, 35.2869] },
    { value: 'mombasa', label: 'Mombasa', coordinates: [-4.0435, 39.6682] },
    { value: 'eldoret', label: 'Eldoret', coordinates: [0.5143, 35.2698] },
    { value: 'kisumu', label: 'Kisumu', coordinates: [-0.1022, 34.7617] },
    { value: 'machakos', label: 'Machakos', coordinates: [-1.5177, 37.2634] },
    { value: 'nyeri', label: 'Nyeri', coordinates: [-0.4203, 36.9511] }
  ];

  const riskFactors = [
    { value: 'drought', label: 'Drought Protection', description: 'Protection against extended dry periods' },
    { value: 'flooding', label: 'Flood Protection', description: 'Protection against excessive rainfall' },
    { value: 'hail', label: 'Hail Protection', description: 'Protection against hail damage' },
    { value: 'wind', label: 'Wind Protection', description: 'Protection against strong winds' },
    { value: 'temperature', label: 'Temperature Extremes', description: 'Protection against heat/cold stress' },
    { value: 'pests', label: 'Pest Outbreak', description: 'Protection against pest damage' },
    { value: 'disease', label: 'Plant Disease', description: 'Protection against crop diseases' }
  ];

  // Available policy templates - Kenya focused
  const availablePolicies = [
    {
      id: 1,
      crop: 'Maize',
      location: 'Kitale, Kenya',
      coverage: 25000,
      premium: 450,
      duration: '6 months',
      riskLevel: 'Low',
      weatherTrigger: 'Drought & flood protection',
      yieldProtection: '85%',
      available: true
    },
    {
      id: 2,
      crop: 'Coffee',
      location: 'Meru, Kenya',
      coverage: 35000,
      premium: 680,
      duration: '12 months',
      riskLevel: 'Medium',
      weatherTrigger: 'Temperature & disease protection',
      yieldProtection: '80%',
      available: true
    },
    {
      id: 3,
      crop: 'Tea',
      location: 'Kericho, Kenya',
      coverage: 40000,
      premium: 750,
      duration: '12 months',
      riskLevel: 'Low',
      weatherTrigger: 'Hail & wind protection',
      yieldProtection: '90%',
      available: true
    },
    {
      id: 4,
      crop: 'Wheat',
      location: 'Nakuru, Kenya',
      coverage: 30000,
      premium: 580,
      duration: '4 months',
      riskLevel: 'Medium',
      weatherTrigger: 'Drought & pest protection',
      yieldProtection: '85%',
      available: true
    },
    {
      id: 5,
      crop: 'Rice',
      location: 'Mombasa, Kenya',
      coverage: 28000,
      premium: 520,
      duration: '5 months',
      riskLevel: 'High',
      weatherTrigger: 'Flood & disease protection',
      yieldProtection: '75%',
      available: true
    }
  ];

  useEffect(() => {
    const loadPoliciesData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);

      try {
        // In a real implementation, you'd fetch user policies from the contract
        // For now, we'll use mock data
        setUserPolicies([]);
      } catch (err) {
        console.error('Error loading policies data:', err);
        setError('Failed to load policies data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPoliciesData();
  }, [user]);

  const handleRegisterPolicy = async (policyTemplate: any) => {
    if (!user) return;

    try {
      // Note: The registerPolicy function signature needs to be updated
      // to match the contract expectations
      const txId = await registerPolicy(
        policyTemplate.id,
        user.addr,
        policyTemplate.location,
        policyTemplate.crop,
        policyTemplate.coverage
      );
      
      if (txId) {
        // Refresh user policies after successful registration
        // In a real implementation, you'd fetch updated policies
        console.log('Policy registered successfully!');
      }
    } catch (err) {
      console.error('Error registering policy:', err);
    }
  };

  const calculateCustomPremium = (policy: typeof customPolicy) => {
    if (!policy.coverageAmount || !policy.farmSize) return 0;
    
    // Basic premium calculation for Kenya
    let basePremium = policy.coverageAmount * 0.015; // 1.5% base rate
    
    // Adjust for crop type
    const cropMultipliers: { [key: string]: number } = {
      'maize': 1.0,
      'coffee': 1.3,
      'tea': 0.9,
      'wheat': 1.1,
      'rice': 1.4,
      'beans': 1.2,
      'sugarcane': 1.1,
      'cotton': 1.3
    };
    
    basePremium *= cropMultipliers[policy.cropType] || 1.0;
    
    // Adjust for risk factors
    const riskMultiplier = 1 + (policy.riskFactors.length * 0.1);
    basePremium *= riskMultiplier;
    
    // Adjust for duration
    basePremium *= (policy.duration / 6); // 6 months baseline
    
    return Math.round(basePremium);
  };

  const handleCreateCustomPolicy = async () => {
    if (!user) return;

    try {
      const premium = calculateCustomPremium(customPolicy);
      
      // Register the custom policy
      const txId = await registerPolicy(
        Date.now(), // Use timestamp as unique ID
        user.addr,
        customPolicy.location,
        customPolicy.cropType,
        customPolicy.coverageAmount
      );
      
      if (txId) {
        setShowCustomPolicyModal(false);
        // Reset form
        setCustomPolicy({
          cropType: '',
          location: '',
          coverageAmount: 0,
          farmSize: 0,
          farmSizeUnit: 'acres',
          riskFactors: [],
          customConditions: '',
          duration: 6,
          expectedYield: 0,
          yieldUnit: 'tons'
        });
        console.log('Custom policy created successfully!');
      }
    } catch (err) {
      console.error('Error creating custom policy:', err);
    }
  };

  const handleRiskFactorToggle = (riskValue: string) => {
    setCustomPolicy(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(riskValue)
        ? prev.riskFactors.filter(r => r !== riskValue)
        : [...prev.riskFactors, riskValue]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending_claim': return 'warning';
      case 'claimed': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'default';
    }
  };

  const filteredPolicies = availablePolicies.filter(policy => {
    const matchesSearch = policy.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'all' || policy.crop.toLowerCase() === selectedCrop.toLowerCase();
    const matchesLocation = selectedLocation === 'all' || policy.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesCrop && matchesLocation;
  });

  if (authLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please connect your Flow wallet to access insurance policies.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading policies data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onConnect={logIn}
        isConnected={isConnected} 
        address={user?.addr}
      />
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Insurance Policies</h1>
            <p className="text-muted-foreground">
              Browse and purchase crop insurance policies tailored to your needs
            </p>
          </div>
          <Dialog open={showCustomPolicyModal} onOpenChange={setShowCustomPolicyModal}>
            <DialogTrigger asChild>
              <Button size="lg" variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Insurance Policy</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Crop Type */}
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select value={customPolicy.cropType} onValueChange={(value) => setCustomPolicy(prev => ({ ...prev, cropType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanCrops.map(crop => (
                        <SelectItem key={crop.value} value={crop.value}>
                          <div>
                            <div className="font-medium">{crop.label}</div>
                            <div className="text-sm text-muted-foreground">{crop.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Farm Location</Label>
                  <Select value={customPolicy.location} onValueChange={(value) => setCustomPolicy(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanLocations.map(location => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Farm Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      placeholder="Enter farm size"
                      value={customPolicy.farmSize || ''}
                      onChange={(e) => setCustomPolicy(prev => ({ ...prev, farmSize: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmSizeUnit">Unit</Label>
                    <Select value={customPolicy.farmSizeUnit} onValueChange={(value) => setCustomPolicy(prev => ({ ...prev, farmSizeUnit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Coverage Amount */}
                <div className="space-y-2">
                  <Label htmlFor="coverageAmount">Coverage Amount (KES)</Label>
                  <Input
                    id="coverageAmount"
                    type="number"
                    placeholder="Enter coverage amount"
                    value={customPolicy.coverageAmount || ''}
                    onChange={(e) => setCustomPolicy(prev => ({ ...prev, coverageAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                {/* Expected Yield */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedYield">Expected Yield</Label>
                    <Input
                      id="expectedYield"
                      type="number"
                      placeholder="Enter expected yield"
                      value={customPolicy.expectedYield || ''}
                      onChange={(e) => setCustomPolicy(prev => ({ ...prev, expectedYield: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yieldUnit">Unit</Label>
                    <Select value={customPolicy.yieldUnit} onValueChange={(value) => setCustomPolicy(prev => ({ ...prev, yieldUnit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tons">Tons</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Policy Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Policy Duration (months)</Label>
                  <Select value={customPolicy.duration.toString()} onValueChange={(value) => setCustomPolicy(prev => ({ ...prev, duration: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="4">4 months</SelectItem>
                      <SelectItem value="5">5 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Risk Factors */}
                <div className="space-y-2">
                  <Label>Risk Factors to Cover</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {riskFactors.map(risk => (
                      <div key={risk.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={risk.value}
                          checked={customPolicy.riskFactors.includes(risk.value)}
                          onChange={() => handleRiskFactorToggle(risk.value)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={risk.value} className="text-sm">
                          {risk.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="customConditions">Additional Conditions (Optional)</Label>
                  <Textarea
                    id="customConditions"
                    placeholder="Enter any specific conditions or requirements..."
                    value={customPolicy.customConditions}
                    onChange={(e) => setCustomPolicy(prev => ({ ...prev, customConditions: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Premium Calculation */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Premium:</span>
                    <span className="font-bold text-lg">
                      KES {calculateCustomPremium(customPolicy).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Premium calculated based on coverage amount, crop type, risk factors, and duration
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCustomPolicyModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCustomPolicy}
                    disabled={!customPolicy.cropType || !customPolicy.location || !customPolicy.coverageAmount || txStatus.status === 'pending'}
                  >
                    {txStatus.status === 'pending' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Policy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* Transaction Status */}
      {txStatus.status === 'pending' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Transaction in progress... {txStatus.txId && `(${txStatus.txId.substring(0, 8)}...)`}
          </AlertDescription>
        </Alert>
      )}

      {txStatus.status === 'success' && (
        <Alert>
          <AlertDescription>
            Policy registered successfully! {txStatus.txId && `Transaction ID: ${txStatus.txId}`}
          </AlertDescription>
        </Alert>
      )}

      {txStatus.status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Policy registration failed: {txStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {/* My Policies Section */}
      {userPolicies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Policies</h2>
          <div className="grid gap-4">
            {userPolicies.map((policy, index) => (
              <Card key={index} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.cropType} Insurance</CardTitle>
                      <p className="text-sm text-muted-foreground">{policy.locationId}</p>
                    </div>
                    <Badge variant={getStatusColor(policy.status) as any}>
                      {policy.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="font-semibold">{formatCurrency(policy.coverageAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Premium</p>
                      <p className="font-semibold">{formatCurrency(policy.premiumAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Policy ID</p>
                      <p className="font-semibold">#{policy.policyId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">{policy.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All crops</SelectItem>
            <SelectItem value="maize">Maize</SelectItem>
            <SelectItem value="coffee">Coffee</SelectItem>
            <SelectItem value="tea">Tea</SelectItem>
            <SelectItem value="wheat">Wheat</SelectItem>
            <SelectItem value="rice">Rice</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            <SelectItem value="nairobi">Nairobi</SelectItem>
            <SelectItem value="nakuru">Nakuru</SelectItem>
            <SelectItem value="meru">Meru</SelectItem>
            <SelectItem value="kitale">Kitale</SelectItem>
            <SelectItem value="kericho">Kericho</SelectItem>
            <SelectItem value="mombasa">Mombasa</SelectItem>
            <SelectItem value="eldoret">Eldoret</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Available Policies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Policies</h2>
        <div className="grid gap-6">
          {filteredPolicies.map((policy) => (
            <Card key={policy.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{policy.crop[0]}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{policy.crop} Insurance</CardTitle>
                      <p className="text-sm text-muted-foreground">{policy.location}</p>
                    </div>
                  </div>
                  <Badge variant={getRiskColor(policy.riskLevel) as any}>
                    {policy.riskLevel} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Coverage</p>
                    <p className="font-bold">{formatCurrency(policy.coverage)}</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-sm text-muted-foreground">Premium</p>
                    <p className="font-bold">{formatCurrency(policy.premium)}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold">{policy.duration}</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-info" />
                    <p className="text-sm text-muted-foreground">Protection</p>
                    <p className="font-bold">{policy.yieldProtection}</p>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Coverage Details:</p>
                  <p className="text-sm text-muted-foreground">{policy.weatherTrigger}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={policy.available ? 'default' : 'secondary'}>
                      {policy.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => handleRegisterPolicy(policy)}
                    disabled={!policy.available || txStatus.status === 'pending'}
                  >
                    {txStatus.status === 'pending' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Purchase Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Policies;