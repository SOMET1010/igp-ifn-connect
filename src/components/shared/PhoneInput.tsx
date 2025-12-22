import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  countryCode?: string;
  maxLength?: number;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '07 01 02 03 04',
  disabled = false,
  id = 'phone',
  label = 'Numéro de téléphone',
  countryCode = '+225',
  maxLength = 10,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(sanitized);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className="form-label-lg">
          {label}
        </Label>
      )}
      <div className="flex gap-2">
        <div className="flex items-center justify-center h-12 px-3 bg-muted rounded-md text-sm font-medium text-muted-foreground border border-border">
          {countryCode}
        </div>
        <div className="relative flex-1">
          <Input
            id={id}
            type="tel"
            inputMode="numeric"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="input-institutional pr-10"
            maxLength={maxLength}
          />
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
