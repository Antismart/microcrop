// Temporary simplified chart component to avoid TypeScript errors
import React from 'react';

export const SimpleChart = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className="w-full h-64 bg-muted/20 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Chart component will be implemented here</p>
    </div>
  );
};

export const SimpleChartContainer = SimpleChart;
export const SimpleChartContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SimpleChartTooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SimpleChartTooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SimpleChartLegend = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SimpleChartLegendContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// For recharts compatibility
export const ResponsiveContainer = SimpleChart;
export const LineChart = SimpleChart;
export const BarChart = SimpleChart;
export const PieChart = SimpleChart;
export const Line = () => null;
export const Bar = () => null;
export const XAxis = () => null;
export const YAxis = () => null;