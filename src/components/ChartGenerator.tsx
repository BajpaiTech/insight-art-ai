import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Sparkles, Download } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface ChartGeneratorProps {
  data: any[];
  fileName: string;
}

type ChartType = 'bar' | 'line' | 'pie';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ChartGenerator = ({ data, fileName }: ChartGeneratorProps) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {});
  }, [data]);

  const numericColumns = useMemo(() => {
    return columns.filter(column => {
      const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
      const numericValues = values.filter(val => !isNaN(Number(val)));
      return numericValues.length > values.length * 0.8; // At least 80% numeric
    });
  }, [columns, data]);

  const textColumns = useMemo(() => {
    return columns.filter(column => !numericColumns.includes(column));
  }, [columns, numericColumns]);

  // Auto-suggest chart configuration
  useMemo(() => {
    if (textColumns.length > 0 && !xColumn) {
      setXColumn(textColumns[0]);
    }
    if (numericColumns.length > 0 && !yColumn) {
      setYColumn(numericColumns[0]);
    }
  }, [textColumns, numericColumns, xColumn, yColumn]);

  const chartData = useMemo(() => {
    if (!xColumn || !yColumn || !data) return [];
    
    if (selectedChart === 'pie') {
      // For pie chart, aggregate data by category
      const aggregated: { [key: string]: number } = {};
      data.forEach(row => {
        const category = String(row[xColumn] || 'Unknown');
        const value = Number(row[yColumn]) || 0;
        aggregated[category] = (aggregated[category] || 0) + value;
      });
      
      return Object.entries(aggregated).map(([name, value]) => ({
        name,
        value,
      }));
    }
    
    // For bar and line charts
    return data.map(row => ({
      [xColumn]: String(row[xColumn] || ''),
      [yColumn]: Number(row[yColumn]) || 0,
    }));
  }, [data, xColumn, yColumn, selectedChart]);

  const generateAIInsights = () => {
    if (!chartData.length) return null;
    
    // Simple AI-like insights based on data patterns
    const insights: string[] = [];
    
    if (selectedChart === 'pie') {
      const pieData = chartData as { name: string; value: number }[];
      const total = pieData.reduce((sum, item) => sum + item.value, 0);
      const largest = pieData.reduce((max, item) => item.value > max.value ? item : max);
      const percentage = ((largest.value / total) * 100).toFixed(1);
      insights.push(`${largest.name} accounts for ${percentage}% of the total`);
    } else {
      const values = chartData.map(item => Number(item[yColumn]) || 0);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (max > avg * 2) {
        const maxItem = chartData.find(item => Number(item[yColumn]) === max);
        insights.push(`${maxItem?.[xColumn]} shows exceptional performance`);
      }
      
      if (values.length > 3) {
        const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
        insights.push(`Overall trend appears to be ${trend}`);
      }
    }
    
    return insights;
  };

  const insights = generateAIInsights();

  const renderChart = () => {
    if (!chartData.length) return <div className="h-64 flex items-center justify-center text-muted-foreground">No data to display</div>;

    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xColumn} stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey={yColumn} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey={xColumn} stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yColumn} 
                stroke={CHART_COLORS[1]} 
                strokeWidth={3}
                dot={{ fill: CHART_COLORS[1], strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Generate Your Chart
        </h2>
        <p className="text-muted-foreground text-lg">
          Customize your visualization and let AI provide insights
        </p>
      </div>

      {/* Chart Configuration */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>Configure your chart type and data columns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chart Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedChart === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart('bar')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Bar
                </Button>
                <Button
                  variant={selectedChart === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart('line')}
                >
                  <LineChartIcon className="h-4 w-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={selectedChart === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChart('pie')}
                >
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  Pie
                </Button>
              </div>
            </div>

            {/* X-Axis Column */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedChart === 'pie' ? 'Category' : 'X-Axis'}
              </label>
              <Select value={xColumn} onValueChange={setXColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(column => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Y-Axis Column */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedChart === 'pie' ? 'Value' : 'Y-Axis'}
              </label>
              <Select value={yColumn} onValueChange={setYColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map(column => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Chart
            </div>
            <ExportModal fileName={fileName || 'chart'} chartContainerId="chart-container">
              <Button variant="gradient" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </ExportModal>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="chart-container" className="bg-white rounded-lg p-6">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {fileName ? `${fileName} - ${selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Chart` : 'Data Visualization'}
              </h3>
              <p className="text-sm text-gray-600">
                {xColumn && yColumn ? `${xColumn} vs ${yColumn}` : 'Chart Analysis'}
              </p>
            </div>
            {renderChart()}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};