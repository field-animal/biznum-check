import React, { useState } from 'react';
import { Key, FileText, Play, RotateCcw, Loader2, Square } from 'lucide-react';
import { ProcessStatus } from '../types';

interface InputFormProps {
  serviceKey: string;
  setServiceKey: (key: string) => void;
  businessNumbers: string;
  setBusinessNumbers: (nums: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onReset: () => void;
  status: ProcessStatus;
  progress: number;
}

export const InputForm: React.FC<InputFormProps> = ({
  serviceKey,
  setServiceKey,
  businessNumbers,
  setBusinessNumbers,
  onStart,
  onCancel,
  onReset,
  status,
  progress
}) => {
  const isProcessing = status === ProcessStatus.PROCESSING;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          입력 정보 (Input)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          서비스 키와 조회할 사업자등록번호를 입력해주세요.
        </p>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            서비스 키 (Service Key)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="password"
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              placeholder="공공데이터포털 서비스 키 입력"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              disabled={isProcessing}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            * 국세청 사업자등록정보 진위확인 및 상태조회 API 인증키
          </p>
        </div>

        <div className="flex-grow flex flex-col min-h-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            사업자 번호 (Business Numbers)
          </label>
          <textarea
            value={businessNumbers}
            onChange={(e) => setBusinessNumbers(e.target.value)}
            placeholder={`4198800046\n1234567890\n... (한 줄에 하나씩 입력)`}
            className="flex-grow w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono resize-none transition-colors"
            disabled={isProcessing}
          />
          <div className="text-right text-xs text-slate-400 mt-1">
            {businessNumbers.split('\n').filter(line => line.trim()).length} 건 입력됨
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isProcessing && (
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex gap-3">
          {isProcessing ? (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white shadow-sm transition-all bg-red-500 hover:bg-red-600 active:transform active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              중단 (Stop)
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={!serviceKey || !businessNumbers.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-white shadow-sm transition-all
                ${!serviceKey || !businessNumbers.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95'
                }`}
            >
              <Play className="w-4 h-4" />
              상태 조회 (Run)
            </button>
          )}
          
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};