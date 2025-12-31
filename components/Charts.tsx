import React, { memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
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
