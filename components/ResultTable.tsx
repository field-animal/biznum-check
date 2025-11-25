import React from 'react';
import { LogItem } from '../types';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ResultTableProps {
  results: LogItem[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return dateStr || '-';
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

const StatusBadge: React.FC<{ status: string; code: string }> = ({ status, code }) => {
  // 01: 계속사업자 (Continuing) -> Green
  // 02: 휴업자 (Dormant) -> Yellow
  // 03: 폐업자 (Closed) -> Red
  
  let colorClass = "bg-slate-100 text-slate-700";
  let icon = <HelpCircle className="w-3 h-3" />;

  if (code === '01') {
    colorClass = "bg-green-100 text-green-700 border border-green-200";
    icon = <CheckCircle2 className="w-3 h-3" />;
  } else if (code === '02') {
    colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    icon = <AlertCircle className="w-3 h-3" />;
  } else if (code === '03') {
    colorClass = "bg-red-100 text-red-700 border border-red-200";
    icon = <XCircle className="w-3 h-3" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {status || "알 수 없음"}
    </span>
  );
};

export const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <HelpCircle className="w-10 h-10 mb-2 opacity-20" />
        <p>조회 결과가 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                번호 (No)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                사업자등록번호 (Biz No)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                상태 (Status)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                과세 유형 (Tax Type)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                폐업 일자 (End Date)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                전환 일자 (Change Date)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                기타 (Etc)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {results.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                  {results.length - index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 font-mono">
                  {item.b_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.isSuccess ? (
                    <StatusBadge status={item.b_stt} code={item.b_stt_cd} />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Error
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {item.tax_type || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(item.end_dt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(item.tax_type_change_dt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                  {item.errorMessage ? (
                    <span className="text-red-500">{item.errorMessage}</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                       {item.invoice_apply_dt && <span>세금계산서적용: {formatDate(item.invoice_apply_dt)}</span>}
                       {!item.invoice_apply_dt && <span>-</span>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};