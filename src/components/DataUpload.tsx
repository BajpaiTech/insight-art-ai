import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { XMLParser } from 'fast-xml-parser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface DataUploadProps {
  onDataParsed: (data: any[], fileName: string) => void;
}

export const DataUpload = ({ onDataParsed }: DataUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message);
        } else {
          // Limit to 100 rows for performance
          const limitedData = results.data.slice(0, 100);
          onDataParsed(limitedData, file.name);
        }
        setIsUploading(false);
      },
      error: (error) => {
        setError('Failed to parse CSV file: ' + error.message);
        setIsUploading(false);
      }
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Limit to 100 rows for performance
        const limitedData = jsonData.slice(0, 100);
        onDataParsed(limitedData, file.name);
        setIsUploading(false);
      } catch (err) {
        setError('Failed to parse Excel file');
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        let dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Limit to 100 rows for performance
        const limitedData = dataArray.slice(0, 100);
        onDataParsed(limitedData, file.name);
        setIsUploading(false);
      } catch (err) {
        setError('Failed to parse JSON file: Invalid JSON format');
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const parseXML = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });
        const xmlData = parser.parse(e.target?.result as string);
        
        // Try to find array data in XML structure
        let dataArray = [];
        if (Array.isArray(xmlData)) {
          dataArray = xmlData;
        } else {
          // Look for common root elements that might contain arrays
          const possibleArrays = Object.values(xmlData).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            dataArray = possibleArrays[0] as any[];
          } else {
            // If no arrays found, wrap the data in an array
            dataArray = [xmlData];
          }
        }
        
        // Limit to 100 rows for performance
        const limitedData = dataArray.slice(0, 100);
        onDataParsed(limitedData, file.name);
        setIsUploading(false);
      } catch (err) {
        setError('Failed to parse XML file: Invalid XML format');
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(file);
    } else if (fileExtension === 'json') {
      parseJSON(file);
    } else if (fileExtension === 'xml') {
      parseXML(file);
    } else {
      setError('Please upload a CSV, Excel (.xlsx, .xls), JSON (.json), or XML (.xml) file');
      setIsUploading(false);
      clearInterval(progressInterval);
    }
  }, [onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Upload Your Data
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Drop your CSV or Excel file here and we'll turn it into a beautiful, shareable infographic in under 2 minutes.
        </p>
      </div>

      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-300 ease-smooth
            ${isDragActive 
              ? 'border-primary bg-accent/50 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/20'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-lg font-medium">Processing your file...</p>
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {isDragActive ? (
                  <Upload className="h-16 w-16 text-primary animate-bounce" />
                ) : (
                  <FileSpreadsheet className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-semibold">
                  {isDragActive ? 'Drop your file here!' : 'Drag & drop your data file'}
                </p>
                <p className="text-muted-foreground">
                  or <Button variant="link" className="p-0 h-auto font-semibold">browse files</Button>
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Supports CSV, XLSX, XLS, JSON, and XML files</p>
                <p>Maximum 100 rows for optimal performance</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};