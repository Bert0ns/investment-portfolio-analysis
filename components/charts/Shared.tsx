'use client';

import { useState } from 'react';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../ui/tooltip';
import { Info } from 'lucide-react';

export const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#64748b', // slate-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f43f5e', // rose-500
  '#d946ef', // fuchsia-500
  '#0ea5e9', // sky-500
  '#78716c', // stone-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#71717a', // zinc-500
];

export function ChartTitleWithInfo({ title, info }: { title: string; info: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <CardTitle>{title}</CardTitle>
      <TooltipProvider>
        <UITooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
            className="inline-flex outline-none focus:ring-2 focus:ring-ring rounded-full p-1.5 -m-1.5"
          >
            <Info
              size={16}
              className="text-muted-foreground hover:text-foreground cursor-help transition-colors"
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-62.5 text-center leading-relaxed">
            <p>{info}</p>
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    </div>
  );
}

export const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-primary font-semibold">{payload[0].value.toFixed(2)}%</p>
      </Card>
    );
  }
  return null;
};

export function ChartContainer({
  title,
  info,
  children,
}: {
  title: string;
  info: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <CardHeader>
        <ChartTitleWithInfo title={title} info={info} />
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 256, minWidth: 0 }}>{children}</div>
      </CardContent>
    </>
  );
}
