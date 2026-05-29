'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  data: number[];
}

export function SparkLine({ data }: SparkLineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data || data.length === 0) {
    return <div className="w-full h-12 bg-elevated/40 rounded-lg animate-pulse" />;
  }

  // Map raw numbers to format expected by Recharts
  const chartData = data.map((v, i) => ({ id: i, val: v }));
  
  // Decide line color based on directional trend
  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = isPositive ? '#10B981' : '#EF4444'; // var(--color-positive) or var(--color-negative)

  return (
    <div className="w-full h-12 mt-3 opacity-80 hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
