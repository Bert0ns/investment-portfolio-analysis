import React from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export interface SettingsSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max: number;
  step: number;
  inputWidth?: string;
  inputClassName?: string;
  sliderClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  description?: React.ReactNode;
  wrapperClassName?: string;
}

export function SettingsSlider({
  label,
  value,
  onChange,
  max,
  step,
  inputWidth = 'w-28',
  inputClassName = 'h-8 pl-6 pr-2 text-right font-bold text-primary bg-primary/10 border-primary/20 focus-visible:ring-primary/30',
  sliderClassName = 'py-1',
  prefix,
  suffix,
  description,
  wrapperClassName = 'space-y-3',
}: SettingsSliderProps) {
  return (
    <div className={wrapperClassName}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className={`relative ${inputWidth}`}>
          {prefix}
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className={inputClassName}
          />
          {suffix}
        </div>
      </div>
      <Slider
        value={[value]}
        max={max}
        step={step}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        className={sliderClassName}
      />
      {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
