import React, { useState, useCallback, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { ResultTable } from './components/ResultTable';
import { DashboardStats } from './components/DashboardStats';
import { fetchBusinessStatus, fetchBusinessStatusBatch } from './services/ntsService';
import { LogItem, ProcessStatus } from './types';
import { LayoutGrid } from 'lucide-react';

// Helper to generate unique ID safe for insecure contexts (HTTP)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  const [serviceKey, setServiceKey] = useState<string>('');
  const [businessNumbers, setBusinessNumbers] = useState<string>('');
  const [results, setResults] = useState<LogItem[]>([]);
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  
  // Ref to signal cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStart = useCallback(async () => {
    if (!serviceKey || !businessNumbers) return;

    // Initialize AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
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

    // =================================================================================
    // [Legacy Code Preserved]
    // Previous implementation: Processing item by item
    // =================================================================================
    /*
    let completed = 0;
    const newResults: LogItem[] = [];
    
    // 2. Process each item individually as requested
    for (const b_no of list) {
      // Check for cancellation before starting the request
      if (signal.aborted) {
        break;
      }

      try {
        const data = await fetchBusinessStatus(serviceKey, b_no, signal);
        
        if (data) {
          newResults.unshift({
            ...data,
            id: generateId(),
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
            id: generateId(),
            timestamp: Date.now(),
            isSuccess: false,
            errorMessage: 'No data returned'
          });
        }
      } catch (e: any) {
        if (e.name === 'AbortError') break;

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
          id: generateId(),
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
    */
    // =================================================================================

    // =================================================================================
    // [New Implementation]
    // Batch processing
    // =================================================================================
    
    // Split into chunks of 100 (Common API limit for NTS is 100)
    const BATCH_SIZE = 100;
    const chunks = [];
    for (let i = 0; i < total; i += BATCH_SIZE) {
      chunks.push(list.slice(i, i + BATCH_SIZE));
    }

    let processedCount = 0;

    for (const chunk of chunks) {
      if (signal.aborted) break;

      try {
        const batchData = await fetchBusinessStatusBatch(serviceKey, chunk, signal);
        
        // Prepare map for quick lookup
        const resultCount = batchData.length;
        const resultMap = new Map(batchData.map(item => [item.b_no, item]));
        
        // Construct results preserving the order of the chunk (or reversed if we want LIFO in table)
        // Here we map the requested numbers to results
        const chunkResults: LogItem[] = chunk.map(requestedBNo => {
          const cleanBNo = requestedBNo.replace(/[^0-9]/g, '');
          const data = resultMap.get(cleanBNo);

          if (data) {
            return {
              ...data,
              id: generateId(),
              timestamp: Date.now(),
              isSuccess: true
            };
          } else {
            // Requested but not returned by API
            return {
              b_no: requestedBNo,
              b_stt: '', b_stt_cd: '', tax_type: '데이터 없음', tax_type_cd: '',
              end_dt: '', utcc_yn: '', tax_type_change_dt: '', invoice_apply_dt: '',
              rbf_tax_type: '', rbf_tax_type_cd: '',
              id: generateId(),
              timestamp: Date.now(),
              isSuccess: false,
              errorMessage: '결과 없음'
            };
          }
        });

        // Add new results to the top of the list
        setResults(prev => [...chunkResults, ...prev]);

      } catch (e: any) {
        if (e.name === 'AbortError') break;

        // Mark all items in this chunk as failed
        const errorResults: LogItem[] = chunk.map(b_no => ({
          b_no,
          b_stt: '', b_stt_cd: '', tax_type: '에러 발생', tax_type_cd: '',
          end_dt: '', utcc_yn: '', tax_type_change_dt: '', invoice_apply_dt: '',
          rbf_tax_type: '', rbf_tax_type_cd: '',
          id: generateId(),
          timestamp: Date.now(),
          isSuccess: false,
          errorMessage: e.message || 'Batch request failed'
        }));
        
        setResults(prev => [...errorResults, ...prev]);
      }

      processedCount += chunk.length;
      setProgress(Math.min((processedCount / total) * 100, 100));
      
      // Small delay for UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (signal.aborted) {
      setStatus(ProcessStatus.IDLE);
    } else {
      setStatus(ProcessStatus.COMPLETED);
    }
  }, [serviceKey, businessNumbers]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

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
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">사업자 번호 상태 조회</h1>
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
                onCancel={handleCancel}
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
