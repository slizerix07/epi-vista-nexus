import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.epidemiological-data.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface TrendData {
  week: string;
  cases: number;
  state: string;
  disease: string;
}

export interface TopDisease {
  disease: string;
  cases: number;
  percentage: number;
}

export interface ClimateImpact {
  state: string;
  avgTemp: number;
  avgPreci: number;
  avgLAI: number;
  cases: number;
}

export interface MapData {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  cases: number;
  disease: string;
  week: string;
}

export const epidemiologyAPI = {
  getTrendData: async (state?: string, disease?: string): Promise<TrendData[]> => {
    const params = new URLSearchParams();
    if (state) params.append('state_ut', state);
    if (disease) params.append('Disease', disease);
    
    const response = await api.get(`/trend?${params.toString()}`);
    return response.data;
  },

  getTopDiseases: async (state: string, week: string): Promise<TopDisease[]> => {
    const response = await api.get(`/top-diseases?state_ut=${state}&week=${week}`);
    return response.data;
  },

  getClimateImpact: async (disease: string): Promise<ClimateImpact[]> => {
    const response = await api.get(`/climate-impact?Disease=${disease}`);
    return response.data;
  },

  getMapData: async (disease?: string, week?: string): Promise<MapData[]> => {
    const params = new URLSearchParams();
    if (disease) params.append('Disease', disease);
    if (week) params.append('week', week);
    
    const response = await api.get(`/map?${params.toString()}`);
    return response.data;
  },
};

// Mock data for development
export const mockData = {
  states: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'],
  diseases: ['Dengue', 'Malaria', 'Chikungunya', 'H1N1', 'Typhoid', 'Hepatitis'],
  weeks: ['2024-W01', '2024-W02', '2024-W03', '2024-W04', '2024-W05'],
  
  generateTrendData: (): TrendData[] => {
    const data: TrendData[] = [];
    mockData.states.forEach(state => {
      mockData.diseases.forEach(disease => {
        mockData.weeks.forEach(week => {
          data.push({
            week,
            cases: Math.floor(Math.random() * 1000) + 50,
            state,
            disease,
          });
        });
      });
    });
    return data;
  },

  generateTopDiseases: (): TopDisease[] => [
    { disease: 'Dengue', cases: 1250, percentage: 35 },
    { disease: 'Malaria', cases: 980, percentage: 28 },
    { disease: 'Chikungunya', cases: 650, percentage: 18 },
    { disease: 'H1N1', cases: 420, percentage: 12 },
    { disease: 'Typhoid', cases: 250, percentage: 7 },
  ],

  generateClimateData: (): ClimateImpact[] => 
    mockData.states.map(state => ({
      state,
      avgTemp: 25 + Math.random() * 15,
      avgPreci: Math.random() * 200,
      avgLAI: Math.random() * 5,
      cases: Math.floor(Math.random() * 1000) + 100,
    })),

  generateMapData: (): MapData[] => {
    const data: MapData[] = [];
    mockData.states.forEach(state => {
      for (let i = 0; i < 5; i++) {
        data.push({
          district: `${state} District ${i + 1}`,
          state,
          latitude: 20 + Math.random() * 15,
          longitude: 70 + Math.random() * 15,
          cases: Math.floor(Math.random() * 500) + 10,
          disease: mockData.diseases[Math.floor(Math.random() * mockData.diseases.length)],
          week: mockData.weeks[Math.floor(Math.random() * mockData.weeks.length)],
        });
      }
    });
    return data;
  },
};
