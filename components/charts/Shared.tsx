'use client';

import { useState } from 'react';
import { Card, CardTitle } from '../ui/card';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '../ui/tooltip';
import { Info } from 'lucide-react';

export const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#64748b',
  '#ec4899',
  '#14b8a6',
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
