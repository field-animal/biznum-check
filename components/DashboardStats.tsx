import React from 'react';
import { LogItem } from '../types';
import { Users, UserMinus, UserX, Activity } from 'lucide-react';

interface DashboardStatsProps {
  results: LogItem[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ results }) => {
  const total = results.length;
  const continuing = results.filter(r => r.b_stt_cd === '01').length;
  const dormant = results.filter(r => r.b_stt_cd === '02').length;
  const closed = results.filter(r => r.b_stt_cd === '03').length;
  // Calculate others/errors
  const others = total - continuing - dormant - closed;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Total Checked</p>
          <p className="text-2xl font-bold text-slate-800">{total}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-green-50 rounded-lg text-green-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Continuing</p>
          <p className="text-2xl font-bold text-slate-800">{continuing}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
          <UserMinus className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Dormant</p>
          <p className="text-2xl font-bold text-slate-800">{dormant}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-red-50 rounded-lg text-red-600">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase">Closed/Err</p>
          <p className="text-2xl font-bold text-slate-800">{closed + others}</p>
        </div>
      </div>
    </div>
  );
};