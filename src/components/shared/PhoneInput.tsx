import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidCIPhonePrefix } from '@/lib/validationSchemas';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  countryCode?: string;
  maxLength?: number;
  className?: string;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = '07 01 02 03 04',
  disabled = false,
  id = 'phone',
  label = 'Numéro de téléphone',
  countryCode = '+225',
  maxLength = 10,
  className,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(sanitized);
  };

  const hasValidPrefix = isValidCIPhonePrefix(value);
  const showPrefixWarning = value.length >= 2 && !hasValidPrefix;

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
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              "input-institutional pr-10",
              (error || showPrefixWarning) && "border-destructive focus-visible:ring-destructive"
            )}
            maxLength={maxLength}
          />
          <Phone className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none",
            (error || showPrefixWarning) ? "text-destructive" : "text-muted-foreground"
          )} />
        </div>
      </div>
      {showPrefixWarning && !error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Le numéro doit commencer par 01, 05 ou 07
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
};
