import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  unit: string;
  showKeypad?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  unit,
  showKeypad = false,
}: QuantitySelectorProps) {
  const [keypadMode, setKeypadMode] = useState(showKeypad);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
      triggerFeedback('tap');
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
      triggerFeedback('tap');
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleKeypadInput = (key: string) => {
    triggerFeedback('tap');
    
    if (key === 'C') {
      setInputValue('');
      return;
    }
    
    if (key === '⌫') {
      setInputValue(prev => prev.slice(0, -1));
      return;
    }
    
    if (key === '✓') {
      const numValue = parseInt(inputValue) || min;
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
      return;
    }
    
    const newValue = inputValue + key;
    if (newValue.length <= 5) {
      setInputValue(newValue);
    }
  };

  const triggerFeedback = (type: 'tap' | 'error') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'tap' ? 30 : [50, 30, 50]);
    }
  };

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKeypadMode(!keypadMode)}
          className="text-xs text-muted-foreground"
        >
          <Calculator className="h-3 w-3 mr-1" />
          {keypadMode ? 'Utiliser le slider' : 'Utiliser le clavier'}
        </Button>
      </div>

      {keypadMode ? (
        /* Keypad Mode */
        <div className="space-y-4">
          {/* Display */}
          <div className="text-center p-4 bg-muted rounded-xl">
            <span className="text-4xl font-bold text-foreground">
              {inputValue || '0'}
            </span>
            <span className="text-xl text-muted-foreground ml-2">{unit}</span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {keypadKeys.flat().map((key) => (
              <Button
                key={key}
                variant={key === '✓' ? 'default' : 'outline'}
                className={cn(
                  "h-14 text-xl font-bold",
                  key === 'C' && "text-orange-500",
                  key === '⌫' && "text-red-500"
                )}
                onClick={() => handleKeypadInput(key)}
              >
                {key}
              </Button>
            ))}
            <Button
              className="col-span-3 h-14 text-xl font-bold bg-green-600 hover:bg-green-700"
              onClick={() => handleKeypadInput('✓')}
            >
              ✓ Valider
            </Button>
          </div>

          {/* Max indicator */}
          <p className="text-center text-xs text-muted-foreground">
            Maximum disponible: {max} {unit}
          </p>
        </div>
      ) : (
        /* Slider Mode */
        <div className="space-y-4">
          {/* Quantity Display */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleDecrement}
              disabled={value <= min}
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="text-center min-w-[120px]">
              <span className="text-4xl font-bold text-foreground">{value}</span>
              <span className="text-xl text-muted-foreground ml-2">{unit}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleIncrement}
              disabled={value >= max}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Slider */}
          <div className="px-4">
            <Slider
              value={[value]}
              onValueChange={handleSliderChange}
              min={min}
              max={max}
              step={1}
              className="w-full"
            />
          </div>

          {/* Range Labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-4">
            <span>{min} {unit}</span>
            <span>{max} {unit} disponibles</span>
          </div>
        </div>
      )}
    </div>
  );
}
