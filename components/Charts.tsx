import React, { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, ComposedChart, ReferenceLine
} from 'recharts';

interface CostValueChartData {
  name: string;
  value: number;
  fill: string;
}

interface CostBreakdownData {
  name: string;
  value: number;
}

interface CostValueChartProps {
  data: CostValueChartData[];
  formatMoney: (val: number, decimals?: number) => string;
}

interface CostBreakdownChartProps {
  data: CostBreakdownData[];
  colors: string[];
}

/**
 * Memoized Cost vs Value Bar Chart
 * Only re-renders when data or formatMoney function changes
 */
export const CostValueChart = memo<CostValueChartProps>(({ data, formatMoney }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(val) => `$${val / 1000}k`}
        />
        <RechartsTooltip
          formatter={(val: number) => formatMoney(val, 0)}
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if data actually changed
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.formatMoney === nextProps.formatMoney
  );
});

CostValueChart.displayName = 'CostValueChart';

/**
 * Memoized Cost Breakdown Pie Chart
 * Only re-renders when data or colors change
 */
export const CostBreakdownChart = memo<CostBreakdownChartProps>(({ data, colors }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(val: number) => `$${val.toFixed(2)}`}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if data or colors changed
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    JSON.stringify(prevProps.colors) === JSON.stringify(nextProps.colors)
  );
});

CostBreakdownChart.displayName = 'CostBreakdownChart';

interface ROICurveData {
  month: number;
  cumulativeProfit: number;
}

interface ROICurveChartProps {
  data: ROICurveData[];
  breakEvenMonth: number | undefined;
  formatMoney: (val: number, decimals?: number) => string;
}

/**
 * Memoized ROI Curve Chart - Shows cumulative profit over time
 * Visualizes break-even point and profit trajectory
 */
export const ROICurveChart = memo<ROICurveChartProps>(({ data, breakEvenMonth, formatMoney }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.05}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          label={{ value: 'Months', position: 'insideBottom', offset: -10, style: { fill: '#64748b', fontSize: 12 } }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
          label={{ value: 'Cumulative Profit', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
        />
        <RechartsTooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div style={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'white',
                  padding: '8px 12px'
                }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Month {label}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                    {formatMoney(payload[0].value as number, 0)}
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ stroke: '#ACE849', strokeWidth: 2, strokeDasharray: '5 5' }}
        />
        <ReferenceLine
          y={0}
          stroke="#94a3b8"
          strokeWidth={2}
          strokeDasharray="3 3"
          label={{ value: 'Break-even Line', position: 'right', fill: '#64748b', fontSize: 11 }}
        />
        {breakEvenMonth !== undefined && breakEvenMonth > 0 && (
          <ReferenceLine
            x={breakEvenMonth}
            stroke="#ACE849"
            strokeWidth={2}
            label={{ value: `Month ${breakEvenMonth}`, position: 'top', fill: '#ACE849', fontSize: 11, fontWeight: 'bold' }}
          />
        )}
        <Area
          type="monotone"
          dataKey="cumulativeProfit"
          fill="url(#profitGradient)"
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="cumulativeProfit"
          stroke="#22c55e"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: '#22c55e', stroke: 'white', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.breakEvenMonth === nextProps.breakEvenMonth &&
    prevProps.formatMoney === nextProps.formatMoney
  );
});

ROICurveChart.displayName = 'ROICurveChart';

interface TornadoChartData {
  variable: string;
  low: number;  // Deviation from baseline (negative)
  high: number; // Deviation from baseline (positive)
  baseline: number;
  lowAbsolute: number;  // Absolute ROI at -20%
  highAbsolute: number; // Absolute ROI at +20%
}

interface TornadoChartProps {
  data: TornadoChartData[];
}

/**
 * Tornado Chart - Shows sensitivity analysis impact ranking
 * Variables sorted by impact magnitude (largest range at top)
 */
export const TornadoChart = memo<TornadoChartProps>(({ data }) => {
  // Sort by impact magnitude (high - low)
  const sortedData = [...data].sort((a, b) =>
    Math.abs(b.high - b.low) - Math.abs(a.high - a.low)
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(0)}%`}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis
          type="category"
          dataKey="variable"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
          width={110}
        />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TornadoChartData;
              const range = Math.abs(data.high - data.low);
              return (
                <div style={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'white',
                  padding: '8px 12px'
                }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
                    {data.variable}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>
                    Baseline: {data.baseline.toFixed(1)}% ROI
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>
                    Low (-20%): {data.lowAbsolute.toFixed(1)}% ({data.low > 0 ? '+' : ''}{data.low.toFixed(1)}%)
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#22c55e' }}>
                    High (+20%): {data.highAbsolute.toFixed(1)}% ({data.high > 0 ? '+' : ''}{data.high.toFixed(1)}%)
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#ACE849', marginTop: '4px', fontWeight: 'bold' }}>
                    Impact Range: {range.toFixed(1)}%
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ fill: 'transparent' }}
        />
        <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
        <Bar dataKey="low" fill="#ef4444" />
        <Bar dataKey="high" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

TornadoChart.displayName = 'TornadoChart';
