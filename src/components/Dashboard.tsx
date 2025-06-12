
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData, TopDisease, epidemiologyAPI, mockData } from '@/services/api';
import FilterSection from './FilterSection';
import LoadingSpinner from './LoadingSpinner';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('2024-W05');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedDisease, selectedWeek]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Using mock data for demonstration
      const trends = mockData.generateTrendData().filter(item => {
        return (!selectedState || item.state === selectedState) &&
               (!selectedDisease || item.disease === selectedDisease);
      });
      
      const diseases = mockData.generateTopDiseases();
      
      setTrendData(trends);
      setTopDiseases(diseases);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedState('');
    setSelectedDisease('');
    setSelectedWeek('2024-W05');
  };

  const totalCases = trendData.reduce((sum, item) => sum + item.cases, 0);
  const weeklyAverage = Math.round(totalCases / (trendData.length || 1));
  const activeDiseases = new Set(trendData.map(item => item.disease)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterSection
        selectedState={selectedState}
        selectedDisease={selectedDisease}
        selectedWeek={selectedWeek}
        onStateChange={setSelectedState}
        onDiseaseChange={setSelectedDisease}
        onWeekChange={setSelectedWeek}
        onReset={handleReset}
        showWeek={true}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Cases</p>
                <p className="text-2xl font-bold text-blue-800">{totalCases.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Weekly Average</p>
                <p className="text-2xl font-bold text-green-800">{weeklyAverage}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Active Diseases</p>
                <p className="text-2xl font-bold text-yellow-800">{activeDiseases}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">States Affected</p>
                <p className="text-2xl font-bold text-purple-800">
                  {new Set(trendData.map(item => item.state)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Case Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#0088FE', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disease Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Diseases - {selectedState || 'All States'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topDiseases}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cases"
                  >
                    {topDiseases.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Cases']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
