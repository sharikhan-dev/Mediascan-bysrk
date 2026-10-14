import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Info,
  Activity,
} from 'lucide-react';
import { Report } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface HealthTrendsViewProps {
  reports: Report[];
  onUploadClick: () => void;
}

export const HealthTrendsView: React.FC<HealthTrendsViewProps> = ({
  reports,
  onUploadClick,
}) => {
  const availableParameters = useMemo(() => {
    const names = new Set<string>();
    reports.forEach((r) => {
      r.results?.forEach((res) => {
        names.add(res.test_name);
      });
    });
    return Array.from(names).sort();
  }, [reports]);

  const [selectedParameter, setSelectedParameter] = useState<string>(() => {
    if (availableParameters.includes('Fasting Glucose')) return 'Fasting Glucose';
    if (availableParameters.includes('Hemoglobin')) return 'Hemoglobin';
    if (availableParameters.includes('Total Cholesterol')) return 'Total Cholesterol';
    return availableParameters[0] || '';
  });

  const trendData = useMemo(() => {
    if (!selectedParameter) return [];

    const matched = reports
      .filter((r) =>
        r.results?.some((res) => res.test_name.toLowerCase() === selectedParameter.toLowerCase())
      )
      .map((r) => {
        const res = r.results?.find(
          (test) => test.test_name.toLowerCase() === selectedParameter.toLowerCase()
        )!;

        return {
          date: r.report_date,
          value: res.measured_value,
          unit: res.unit,
          refLow: res.reference_range_low,
          refHigh: res.reference_range_high,
          labName: r.laboratory_name || 'Lab',
          filename: r.original_filename,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return matched;
  }, [reports, selectedParameter]);

  const unitsUsed = useMemo(() => {
    const set = new Set<string>();
    trendData.forEach((d) => set.add(d.unit));
    return Array.from(set);
  }, [trendData]);

  const hasInconsistentUnits = unitsUsed.length > 1;

  const labsUsed = useMemo(() => {
    const set = new Set<string>();
    trendData.forEach((d) => set.add(d.labName));
    return Array.from(set);
  }, [trendData]);

  const stats = useMemo(() => {
    if (trendData.length === 0) return null;
    const values = trendData.map((d) => d.value);
    const first = values[0];
    const latest = values[values.length - 1];
    const delta = latest - first;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const unit = trendData[0].unit;
    const refLow = trendData[trendData.length - 1].refLow;
    const refHigh = trendData[trendData.length - 1].refHigh;

    return {
      first,
      latest,
      delta: Number(delta.toFixed(2)),
      min,
      max,
      unit,
      refLow,
      refHigh,
    };
  }, [trendData]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-[#0A0F1D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
            Longitudinal Telemetry
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
            Biomarker Trajectories
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Chronological measurement series plotted against laboratory reference standards.
          </p>
        </div>

        {availableParameters.length > 0 && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <label htmlFor="editorial-param-select" className="text-slate-500 font-bold uppercase">
              Parameter:
            </label>
            <select
              id="editorial-param-select"
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="px-3 py-1.5 font-bold text-slate-900 bg-white border border-slate-300 focus:outline-none focus:border-slate-900 cursor-pointer uppercase"
            >
              {availableParameters.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {availableParameters.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 space-y-3 font-mono">
          <Activity className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 font-editorial">No Biomarkers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload at least one laboratory blood report to visualize biomarker trends across dates.
          </p>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 font-bold text-xs text-white bg-[#0A0F1D] hover:bg-blue-600 uppercase"
          >
            Upload First Report
          </button>
        </div>
      ) : (
        <>
          {/* Inconsistent Unit Alert Banner */}
          {hasInconsistentUnits && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-900 font-mono flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider">Inconsistent Measurement Units Detected</p>
                <p className="text-amber-800 font-sans mt-0.5">
                  Different reports for <strong>{selectedParameter}</strong> utilized distinct units ({unitsUsed.join(', ')}). Values may not be directly comparable without unit conversion.
                </p>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="p-4 bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Latest Recorded</span>
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.latest} <span className="text-xs font-normal text-slate-500">{stats.unit}</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Baseline Value</span>
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.first} <span className="text-xs font-normal text-slate-500">{stats.unit}</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Net Observed Delta</span>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    stats.delta > 0 ? 'text-amber-600' : stats.delta < 0 ? 'text-blue-600' : 'text-slate-900'
                  }`}
                >
                  {stats.delta > 0 ? `+${stats.delta}` : stats.delta}{' '}
                  <span className="text-xs font-normal text-slate-500">{stats.unit}</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Reference Standard</span>
                <div className="text-sm font-bold text-slate-900 tabular-nums mt-1">
                  {stats.refLow !== null && stats.refHigh !== null
                    ? `${stats.refLow} – ${stats.refHigh} ${stats.unit}`
                    : 'Variable per lab'}
                </div>
              </div>
            </div>
          )}

          {/* Chart Container */}
          <div className="p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 font-mono text-xs">
              <div>
                <h3 className="text-sm font-bold text-[#0A0F1D] font-editorial uppercase tracking-wider">
                  {selectedParameter} Chronological Curve
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Across {trendData.length} laboratory report{trendData.length === 1 ? '' : 's'}
                </p>
              </div>

              {stats?.refLow !== null && stats?.refHigh !== null && (
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <div className="w-2.5 h-2.5 bg-emerald-500" />
                  <span>Normal Bounds: {stats?.refLow} – {stats?.refHigh} {stats?.unit}</span>
                </div>
              )}
            </div>

            {trendData.length > 0 ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={['dataMin - 15', 'dataMax + 15']}
                      tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                      tickMargin={8}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-[#0A0F1D] text-white border border-slate-700 text-xs font-mono space-y-1">
                              <p className="font-bold text-blue-400">{selectedParameter}</p>
                              <p className="text-sm font-bold text-white">
                                {data.value} {data.unit}
                              </p>
                              <p className="text-[10px] text-slate-400">Date: {data.date}</p>
                              <p className="text-[10px] text-slate-400">Lab: {data.labName}</p>
                              {data.refLow !== null && data.refHigh !== null && (
                                <p className="text-[10px] text-emerald-400">
                                  Ref: {data.refLow} – {data.refHigh} {data.unit}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {stats?.refLow !== null && (
                      <ReferenceLine
                        y={stats?.refLow}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{
                          value: `Lower: ${stats?.refLow}`,
                          fill: '#10B981',
                          fontSize: 9,
                          fontFamily: 'monospace',
                          position: 'insideBottomLeft',
                        }}
                      />
                    )}

                    {stats?.refHigh !== null && (
                      <ReferenceLine
                        y={stats?.refHigh}
                        stroke="#F59E0B"
                        strokeDasharray="3 3"
                        label={{
                          value: `Upper: ${stats?.refHigh}`,
                          fill: '#F59E0B',
                          fontSize: 9,
                          fontFamily: 'monospace',
                          position: 'insideTopLeft',
                        }}
                      />
                    )}

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0A0F1D"
                      strokeWidth={2.5}
                      dot={{ fill: '#0A0F1D', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                Insufficient data to plot this biomarker.
              </div>
            )}
          </div>

          {/* Historical Data Table */}
          <div className="bg-white border border-slate-200 overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-slate-200">
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                Chronological Data Ledger
              </h4>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Measured Value</th>
                  <th className="py-2.5 px-4 font-semibold">Laboratory</th>
                  <th className="py-2.5 px-4 font-semibold">Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trendData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 tabular-nums text-slate-900 font-bold">{d.date}</td>
                    <td className="py-2.5 px-4 font-bold tabular-nums text-slate-900">
                      {d.value} {d.unit}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans">{d.labName}</td>
                    <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                      {d.refLow !== null && d.refHigh !== null
                        ? `${d.refLow} – ${d.refHigh} ${d.unit}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Trend Notice */}
          <div className="p-4 bg-slate-100 border-l-4 border-slate-800 text-xs text-slate-600 leading-relaxed font-mono">
            <strong className="text-slate-900 font-sans block mb-0.5">Laboratory Methodology Notice:</strong>
            When blood specimens are processed across different laboratories ({labsUsed.join(', ')}), variations in instrumentation and assay calibration can cause values to shift without biological changes. Always have your physician interpret multi-lab trajectories.
          </div>
        </>
      )}
    </div>
  );
};
