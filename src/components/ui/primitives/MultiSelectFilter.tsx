import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import type { SelectChangeEvent } from '@mui/material/Select';

interface MultiSelectFilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectFilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelectFilter({ label, options, value, onChange }: MultiSelectFilterProps) {
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const next = e.target.value;
    onChange(typeof next === 'string' ? next.split(',') : next);
  };

  const renderValue = (selected: string[]) => {
    if (selected.length === 0) return 'Nenhuma';
    if (selected.length === options.length) return 'Todas';
    if (selected.length === 1) return options.find((o) => o.value === selected[0])?.label ?? selected[0];
    return `${selected.length} selecionadas`;
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} size="small" />}
        renderValue={renderValue}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            <Checkbox checked={value.includes(o.value)} size="small" />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
