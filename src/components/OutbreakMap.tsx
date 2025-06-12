
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapData, epidemiologyAPI, mockData } from '@/services/api';
import FilterSection from './FilterSection';
import LoadingSpinner from './LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, Zap } from 'lucide-react';

const OutbreakMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapData, setMapData] = useState<MapData[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, [selectedDisease, selectedWeek]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      // Using mock data for demonstration
      const data = mockData.generateMapData().filter(item => {
        return (!selectedDisease || item.disease === selectedDisease) &&
               (!selectedWeek || item.week === selectedWeek);
      });
      setMapData(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [78.9629, 20.5937], // India center
        zoom: 4.5,
      });

      map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        addDataToMap();
      });

      setShowTokenInput(false);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const addDataToMap = () => {
    if (!map.current || !mapData.length) return;

    // Add data source
    if (map.current.getSource('outbreak-data')) {
      map.current.removeLayer('outbreak-circles');
      map.current.removeSource('outbreak-data');
    }

    const features = mapData.map(item => ({
      type: 'Feature',
      properties: {
        cases: item.cases,
        district: item.district,
        state: item.state,
        disease: item.disease,
        week: item.week,
      },
      geometry: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude],
      },
    }));

    map.current.addSource('outbreak-data', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    // Add circles layer
    map.current.addLayer({
      id: 'outbreak-circles',
      type: 'circle',
      source: 'outbreak-data',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'cases'],
          0, 4,
          1000, 20,
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'cases'],
          0, '#ffffcc',
          250, '#fd8d3c',
          500, '#e31a1c',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
        'circle-opacity': 0.8,
      },
    });

    // Add popup on click
    map.current.on('click', 'outbreak-circles', (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      new (window as any).mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${properties.district}</h3>
            <p><strong>State:</strong> ${properties.state}</p>
            <p><strong>Disease:</strong> ${properties.disease}</p>
            <p><strong>Cases:</strong> ${properties.cases}</p>
            <p><strong>Week:</strong> ${properties.week}</p>
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseenter', 'outbreak-circles', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'outbreak-circles', () => {
      map.current.getCanvas().style.cursor = '';
    });
  };

  useEffect(() => {
    if (map.current && mapData.length) {
      addDataToMap();
    }
  }, [mapData]);

  const handleReset = () => {
    setSelectedDisease('');
    setSelectedWeek('');
  };

  const maxCases = Math.max(...mapData.map(item => item.cases), 0);
  const totalDistricts = mapData.length;
  const avgCases = mapData.length > 0 
    ? Math.round(mapData.reduce((sum, item) => sum + item.cases, 0) / mapData.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTokenInput && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <MapPin className="w-5 h-5" />
              Mapbox Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              To display the interactive map, please enter your Mapbox public token. 
              You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={initializeMap} disabled={!mapboxToken}>
                Initialize Map
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <FilterSection
        selectedDisease={selectedDisease}
        selectedWeek={selectedWeek}
        onDiseaseChange={setSelectedDisease}
        onWeekChange={setSelectedWeek}
        onReset={handleReset}
        showWeek={true}
      />

      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Highest Cases</p>
                <p className="text-2xl font-bold text-red-800">{maxCases}</p>
              </div>
              <Zap className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Districts Affected</p>
                <p className="text-2xl font-bold text-blue-800">{totalDistricts}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Average Cases</p>
                <p className="text-2xl font-bold text-green-800">{avgCases}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Outbreak Distribution Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 relative rounded-lg overflow-hidden border border-border">
            {showTokenInput ? (
              <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Map will appear here after Mapbox token is provided</p>
                </div>
              </div>
            ) : (
              <div ref={mapContainer} className="w-full h-full" />
            )}
          </div>
          
          {!showTokenInput && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Map Legend</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                  <span>Low (0-250 cases)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Medium (250-500 cases)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>High (500+ cases)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OutbreakMap;
