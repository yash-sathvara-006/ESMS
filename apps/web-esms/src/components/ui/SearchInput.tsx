import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './Input';
import { useDebouncedCallback } from '../../hooks/useDebounce';

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  value?: string;
  onChange?: (val: string) => void;
  onDebouncedChange?: (val: string) => void;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  onDebouncedChange,
  debounceMs = 350,
  placeholder = 'Search...',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Keep internal in sync with controlled value if passed
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced callback
  const debouncedNotify = useDebouncedCallback((val: string) => {
    if (onDebouncedChange) {
      onDebouncedChange(val);
    }
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (onChange) {
      onChange(val);
    }
    debouncedNotify(val);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange('');
    }
    if (onDebouncedChange) {
      onDebouncedChange('');
    }
  };

  return (
    <Input
      placeholder={placeholder}
      value={internalValue}
      onChange={handleChange}
      leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      rightIcon={
        internalValue ? (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              p: 0.25,
              color: '#94a3b8',
              '&:hover': { color: '#0f172a', backgroundColor: '#f1f5f9' }
            }}
          >
            <X className="w-3.5 h-3.5" />
          </IconButton>
        ) : undefined
      }
      {...props}
    />
  );
};
