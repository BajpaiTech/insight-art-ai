import { useState } from 'react';
import { Sparkles, BarChart3, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataUpload } from '@/components/DataUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartGenerator } from '@/components/ChartGenerator';

type Step = 'upload' | 'preview' | 'generate' | 'export';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleDataParsed = (data: any[], filename: string) => {
    setUploadedData(data);
    setFileName(filename);
    setCurrentStep('preview');
  };

  const handleContinueToGenerate = () => {
    setCurrentStep('generate');
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedData([]);
    setFileName('');
  };

  const steps = [
    { key: 'upload', label: 'Upload Data', icon: FileText, active: currentStep === 'upload' },
    { key: 'preview', label: 'Preview', icon: BarChart3, active: currentStep === 'preview' },
    { key: 'generate', label: 'Generate', icon: Sparkles, active: currentStep === 'generate' },
    { key: 'export', label: 'Export', icon: Download, active: currentStep === 'export' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  DataStory.AI
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered Infographic Generator</p>
              </div>
            </div>
            
            {uploadedData.length > 0 && (
              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center space-x-2">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                  ${step.active 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-muted-foreground/30 text-muted-foreground'
                  }
                `}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className={`text-sm font-medium ${
                  step.active ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-muted-foreground/30 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section - Only show on upload step */}
        {currentStep === 'upload' && (
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Turn Your <span className="bg-brand-gradient bg-clip-text text-transparent">Data</span> Into Beautiful
              </h1>
              <h1 className="text-5xl font-bold tracking-tight">
                <span className="bg-brand-gradient bg-clip-text text-transparent">Stories</span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload your spreadsheet data and let AI create stunning, shareable infographics in under 2 minutes. 
              Perfect for presentations, social media, and reports.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                <span>Professional Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                <span>Instant Export</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <DataUpload onDataParsed={handleDataParsed} />
          )}

          {currentStep === 'preview' && (
            <div className="space-y-8">
              <DataPreview data={uploadedData} fileName={fileName} />
              <div className="text-center">
                <Button 
                  onClick={handleContinueToGenerate}
                  size="lg"
                  variant="gradient"
                  className="px-8"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Chart
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'generate' && (
            <ChartGenerator data={uploadedData} fileName={fileName} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with ❤️ for data storytellers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
