
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { mockData } from '@/services/api';

interface FilterSectionProps {
  selectedState?: string;
  selectedDisease?: string;
  selectedWeek?: string;
  onStateChange?: (state: string) => void;
  onDiseaseChange?: (disease: string) => void;
  onWeekChange?: (week: string) => void;
  onReset?: () => void;
  showWeek?: boolean;
}

const FilterSection = ({
  selectedState,
  selectedDisease,
  selectedWeek,
  onStateChange,
  onDiseaseChange,
  onWeekChange,
  onReset,
  showWeek = false,
}: FilterSectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          Filters
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {onStateChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">State/UT</label>
              <Select value={selectedState || ""} onValueChange={onStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onDiseaseChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Disease</label>
              <Select value={selectedDisease || ""} onValueChange={onDiseaseChange}>
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
          )}

          {showWeek && onWeekChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Week</label>
              <Select value={selectedWeek || ""} onValueChange={onWeekChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.weeks.map((week) => (
                    <SelectItem key={week} value={week}>
                      {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
