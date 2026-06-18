import React from 'react';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { School } from '../../types';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

interface SchoolFormValues {
  name: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
}

interface SchoolFormProps {
  initialValues?: Partial<School>;
  onChange: (values: SchoolFormValues) => void;
  values: SchoolFormValues;
}

export function SchoolForm({ values, onChange }: SchoolFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    onChange({ ...values, [name]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth required
          label="Nome da escola"
          name="name"
          value={values.name}
          onChange={handleChange}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select name="state" value={values.state} onChange={handleChange as any} label="Estado">
            <MenuItem value="">— Selecione —</MenuItem>
            {ESTADOS.map((uf) => (
              <MenuItem key={uf} value={uf}>{uf}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>
        <TextField fullWidth label="Cidade" name="city" value={values.city} onChange={handleChange} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Endereço" name="address" value={values.address} onChange={handleChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField fullWidth label="Telefone de contato" name="phone" value={values.phone} onChange={handleChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField fullWidth type="email" label="Email de contato" name="email" value={values.email} onChange={handleChange} />
      </Grid>
    </Grid>
  );
}

export type { SchoolFormValues };
