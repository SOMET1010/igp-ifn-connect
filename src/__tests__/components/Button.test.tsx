import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with default type="button"', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should allow type="submit" override', () => {
    const { getByRole } = render(<Button type="submit">Submit</Button>);
    const button = getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should render all variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    
    variants.forEach((variant) => {
      const { unmount, getByRole } = render(<Button variant={variant}>{variant}</Button>);
      expect(getByRole('button', { name: variant })).toBeInTheDocument();
      unmount();
    });
  });

  it('should render all sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    
    sizes.forEach((size) => {
      const { unmount, getByRole } = render(<Button size={size}>Size {size}</Button>);
      expect(getByRole('button')).toBeInTheDocument();
      unmount();
    });
  });

  it('should apply custom className', () => {
    const { getByRole } = render(<Button className="custom-class">Custom</Button>);
    const button = getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });
});
