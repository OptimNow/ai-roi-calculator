// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput, MoneyInput, PercentInput, SectionHeader } from './InputComponents';

/**
 * The inputs are deliberately lenient while you type and strict when you leave:
 * `onChange` fires only for a parseable value, and blur is what normalises an
 * empty or out-of-range field. That is why the clearing/negative cases below
 * assert on blur rather than on change — clamping mid-keystroke would fight the
 * user (typing "-" or clearing to retype would snap the field back to 0).
 */
describe('InputComponents', () => {
  describe('NumberInput', () => {
    it('should render with label', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} />);

      expect(screen.getByText('Test Input')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveValue(100);
    });

    it('should call onChange when value changes', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '150' } });

      expect(onChange).toHaveBeenCalledWith(150);
    });

    it('should validate minimum value', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} min={50} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '25' } });

      expect(onChange).toHaveBeenCalledWith(50); // Should enforce min
    });

    it('should validate maximum value', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} max={200} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '300' } });

      expect(onChange).toHaveBeenCalledWith(200); // Should enforce max
    });

    it('should handle NaN values', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });
      expect(onChange).not.toHaveBeenCalled(); // Clearing the field mid-edit is allowed

      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(0); // Blur falls back to min, which defaults to 0
      expect(input).toHaveValue(0);
    });

    it('should render tooltip when provided', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} tooltip="Help text" />);

      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    it('should disable input when disabled prop is true', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} disabled />);

      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
    });
  });

  describe('MoneyInput', () => {
    it('should render with dollar sign prefix', () => {
      const onChange = vi.fn();
      render(<MoneyInput label="Price" value={99.99} onChange={onChange} />);

      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveValue(99.99);
    });

    it('should prevent negative values', () => {
      const onChange = vi.fn();
      render(<MoneyInput label="Price" value={50} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '-10' } });
      expect(onChange).not.toHaveBeenCalled(); // A negative is never propagated

      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledWith(0); // Should not allow negative
      expect(input).toHaveValue(0);
    });

    it('should handle precision correctly', () => {
      const onChange = vi.fn();
      render(<MoneyInput label="Price" value={1.2345} onChange={onChange} precision={4} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.0001');
    });

    it('should handle NaN and default to 0', () => {
      const onChange = vi.fn();
      render(<MoneyInput label="Price" value={50} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('PercentInput', () => {
    it('should render with percentage sign suffix', () => {
      const onChange = vi.fn();
      render(<PercentInput label="Rate" value={75} onChange={onChange} />);

      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toHaveValue(75);
    });

    it('should enforce 0-100 range', () => {
      const onChange = vi.fn();
      render(<PercentInput label="Rate" value={50} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');

      // Test exceeding max
      fireEvent.change(input, { target: { value: '150' } });
      expect(onChange).toHaveBeenCalledWith(100);

      // Test below min
      fireEvent.change(input, { target: { value: '-10' } });
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('should handle decimal percentages', () => {
      const onChange = vi.fn();
      render(<PercentInput label="Rate" value={75.5} onChange={onChange} />);

      expect(screen.getByRole('spinbutton')).toHaveValue(75.5);
    });

    it('should have correct step attribute', () => {
      const onChange = vi.fn();
      render(<PercentInput label="Rate" value={50} onChange={onChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('SectionHeader', () => {
    it('should render title correctly', () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<SectionHeader title="Test Section" onToggle={onToggle} isOpen={true} />);

      fireEvent.click(screen.getByRole('button', { name: /test section/i }));

      expect(onToggle).toHaveBeenCalled();
    });

    it('should show correct icon when open', () => {
      render(<SectionHeader title="Test Section" onToggle={vi.fn()} isOpen={true} />);

      expect(screen.getByText('▼')).toBeInTheDocument();
    });

    it('should show correct icon when closed', () => {
      render(<SectionHeader title="Test Section" onToggle={vi.fn()} isOpen={false} />);

      expect(screen.getByText('▶')).toBeInTheDocument();
    });

    it('should not show icon when onToggle is not provided', () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.queryByText('▼')).not.toBeInTheDocument();
      expect(screen.queryByText('▶')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all inputs should have proper ARIA labels', () => {
      const onChange = vi.fn();

      render(<NumberInput label="Test Number" value={100} onChange={onChange} />);
      expect(screen.getByRole('spinbutton')).toHaveAccessibleName('Test Number');
      screen.getByLabelText('Test Number');

      render(<MoneyInput label="Test Money" value={50} onChange={onChange} />);
      expect(screen.getByLabelText('Test Money')).toHaveAccessibleName('Test Money');

      render(<PercentInput label="Test Percent" value={75} onChange={onChange} />);
      expect(screen.getByLabelText('Test Percent')).toHaveAccessibleName('Test Percent');
    });

    it('should support keyboard navigation', () => {
      const onChange = vi.fn();
      render(<NumberInput label="Test Input" value={100} onChange={onChange} step={10} />);

      const input = screen.getByRole('spinbutton');
      input.focus();

      expect(document.activeElement).toBe(input);
    });
  });
});
