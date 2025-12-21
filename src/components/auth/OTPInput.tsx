import React from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, disabled = false }) => {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="justify-center"
    >
      <InputOTPGroup>
        <InputOTPSlot 
          index={0} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
        <InputOTPSlot 
          index={1} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
        <InputOTPSlot 
          index={2} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
      </InputOTPGroup>
      <InputOTPSeparator className="text-muted-foreground">-</InputOTPSeparator>
      <InputOTPGroup>
        <InputOTPSlot 
          index={3} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
        <InputOTPSlot 
          index={4} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
        <InputOTPSlot 
          index={5} 
          className="w-12 h-14 text-2xl font-bold border-2 border-border rounded-xl bg-card"
        />
      </InputOTPGroup>
    </InputOTP>
  );
};

export default OTPInput;
