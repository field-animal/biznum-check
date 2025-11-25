import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ResultTable } from './components/ResultTable';
import { DashboardStats } from './components/DashboardStats';
import { fetchBusinessStatus } from './services/ntsService';
import { LogItem, ProcessStatus } from './types';
import { LayoutGrid } from 'lucide-react';

const App: React.FC = () => {
  const [serviceKey, setServiceKey] = useState<string>('');
  const [businessNumbers, setBusinessNumbers] = useState<string>('');
  const [results, setResults] = useState<LogItem[]>([]);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);

  const handleStart = useCallback(async () => {
    if (!serviceKey || !businessNumbers) return;

    setStatus(ProcessStatus.PROCESSING);
    setResults([]); // Clear previous results
    setProgress(0);

    // 1. Parse input
    const list = businessNumbers
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (list.length === 0) {
      setStatus(ProcessStatus.IDLE);
      return;
    }

    const total = list.length;
    let completed = 0;
    const newResults: LogItem[] = [];

    // 2. Process each item individually as requested
    for (const b_no of list) {
      try {
        const data = await fetchBusinessStatus(serviceKey, b_no);
        
        if (data) {
          newResults.unshift({
            ...data,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            isSuccess: true
          });
        } else {
           // Handle case where API returns OK but empty data (unlikely if b_no was sent)
           newResults.unshift({
            b_no: b_no,
            b_stt: '',
            b_stt_cd: '',
            tax_type: '조회 실패',
            tax_type_cd: '',
            end_dt: '',
            utcc_yn: '',
            tax_type_change_dt: '',
            invoice_apply_dt: '',
            rbf_tax_type: '',
            rbf_tax_type_cd: '',
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            isSuccess: false,
            errorMessage: 'No data returned'
          });
        }
      } catch (e: any) {
        newResults.unshift({
          b_no: b_no,
          b_stt: '',
          b_stt_cd: '',
          tax_type: '에러 발생',
          tax_type_cd: '',
          end_dt: '',
          utcc_yn: '',
          tax_type_change_dt: '',
          invoice_apply_dt: '',
          rbf_tax_type: '',
          rbf_tax_type_cd: '',
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          isSuccess: false,
          errorMessage: e.message || 'Unknown error'
        });
      }

      completed++;
      setProgress((completed / total) * 100);
      
      // Update state incrementally to show progress in table
      setResults([...newResults]);
      
      // Small delay to be nice to the API and allow UI to render
      await new Promise(resolve => setTimeout(resolve, 50)); 
    }

    setStatus(ProcessStatus.COMPLETED);
  }, [serviceKey, businessNumbers]);

  const handleReset = useCallback(() => {
    setBusinessNumbers('');
    setResults([]);
    setStatus(ProcessStatus.IDLE);
    setProgress(0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">BizCheck</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <InputForm
                serviceKey={serviceKey}
                setServiceKey={setServiceKey}
                businessNumbers={businessNumbers}
                setBusinessNumbers={setBusinessNumbers}
                onStart={handleStart}
                onReset={handleReset}
                status={status}
                progress={progress}
              />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <DashboardStats results={results} />
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  조회 결과 <span className="text-slate-400 font-normal ml-1">({results.length})</span>
                </h2>
                {status === ProcessStatus.PROCESSING && (
                  <span className="text-xs font-medium text-indigo-600 animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
              
              <ResultTable results={results} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;