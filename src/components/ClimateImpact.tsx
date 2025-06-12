
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClimateImpact as ClimateImpactData, epidemiologyAPI, mockData } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from './LoadingSpinner';
import { Thermometer, CloudRain, Leaf, TrendingUp } from 'lucide-react';

const ClimateImpact = () => {
  const [climateData, setClimateData] = useState<ClimateImpactData[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('Dengue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClimateData();
  }, [selectedDisease]);

  const fetchClimateData = async () => {
    setLoading(true);
    try {
      // Using mock data for demonstration
      const data = mockData.generateClimateData();
      setClimateData(data);
    } catch (error) {
      console.error('Error fetching climate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageTemp = climateData.length > 0 
    ? (climateData.reduce((sum, item) => sum + item.avgTemp, 0) / climateData.length).toFixed(1)
    : 0;
  
  const averagePreci = climateData.length > 0
    ? (climateData.reduce((sum, item) => sum + item.avgPreci, 0) / climateData.length).toFixed(1)
    : 0;

  const averageLAI = climateData.length > 0
    ? (climateData.reduce((sum, item) => sum + item.avgLAI, 0) / climateData.length).toFixed(2)
    : 0;

  const totalCases = climateData.reduce((sum, item) => sum + item.cases, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disease Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Climate Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select Disease
            </label>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger>
                <SelectValue placeholder="Select disease" />
              </SelectTrigger>
              <SelectContent>
                {mockData.diseases.map((disease) => (
                  <SelectItem key={disease} value={disease}>
                    {disease}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Climate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Avg Temperature</p>
                <p className="text-2xl font-bold text-red-800">{averageTemp}°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Precipitation</p>
                <p className="text-2xl font-bold text-blue-800">{averagePreci}mm</p>
              </div>
              <CloudRain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg LAI</p>
                <p className="text-2xl font-bold text-green-800">{averageLAI}</p>
              </div>
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Cases</p>
                <p className="text-2xl font-bold text-purple-800">{totalCases.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Climate Data Charts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Climate Factors vs {selectedDisease} Cases by State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={climateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="avgTemp" 
                    fill="#ef4444" 
                    name="Temperature (°C)"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="avgPreci" 
                    fill="#3b82f6" 
                    name="Precipitation (mm)"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="cases" 
                    fill="#10b981" 
                    name="Cases"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaf Area Index (LAI) Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={climateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="avgLAI" 
                    fill="#22c55e" 
                    name="LAI Index"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="cases" 
                    fill="#8b5cf6" 
                    name="Cases"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClimateImpact;
