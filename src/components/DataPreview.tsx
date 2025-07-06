import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DataPreviewProps {
  data: any[];
  fileName: string;
}

export const DataPreview = ({ data, fileName }: DataPreviewProps) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0] || {});
  const previewRows = data.slice(0, 5); // Show first 5 rows for preview

  const detectColumnType = (column: string) => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
    
    if (values.length === 0) return 'empty';
    
    // Check if all values are numbers
    const numericValues = values.filter(val => !isNaN(Number(val)));
    if (numericValues.length === values.length) return 'numeric';
    
    // Check if values look like dates
    const dateValues = values.filter(val => !isNaN(Date.parse(val)));
    if (dateValues.length === values.length) return 'date';
    
    return 'text';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-chart-1 text-white';
      case 'date': return 'bg-chart-2 text-white';
      case 'text': return 'bg-chart-3 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Data Preview
          <Badge variant="secondary">{fileName}</Badge>
        </CardTitle>
        <CardDescription>
          {data.length} rows × {columns.length} columns
          {data.length >= 100 && ' (limited to 100 rows for performance)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Column Types */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Column Types</h4>
          <div className="flex flex-wrap gap-2">
            {columns.map(column => {
              const type = detectColumnType(column);
              return (
                <Badge 
                  key={column} 
                  className={getTypeColor(type)}
                  variant="secondary"
                >
                  {column} ({type})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Data Table Preview */}
        <div className="rounded-md border max-h-64 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column} className="font-semibold">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map(column => (
                    <TableCell key={column} className="max-w-32 truncate">
                      {String(row[column] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            ... and {data.length - 5} more rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};