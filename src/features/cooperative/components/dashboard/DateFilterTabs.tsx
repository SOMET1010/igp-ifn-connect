/**
 * Composant de filtres temporels pour le dashboard coopérative
 */
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateFilterValue, DATE_FILTER_OPTIONS } from '../../types/dateFilter.types';

interface DateFilterTabsProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

export const DateFilterTabs: React.FC<DateFilterTabsProps> = ({ value, onChange }) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DateFilterValue)} className="w-full">
      <TabsList className="w-full grid grid-cols-4 h-9">
        {DATE_FILTER_OPTIONS.map((option) => (
          <TabsTrigger 
            key={option.value} 
            value={option.value}
            className="text-xs px-2"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
