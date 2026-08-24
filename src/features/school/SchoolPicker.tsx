import { useEffect, useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { getAllSchools } from '../../services/firestoreService';
import type { School } from '../../types';

export interface SchoolChoice {
  /** Id de uma escola da rede, ou '' quando a escolha foi "Outra". */
  schoolId: string;
  /** Nome digitado à mão. Vazio quando a escola veio da lista. */
  schoolNameOther: string;
}

// Sentinela da opção "Outra". Id vazio nunca colide com id real de escola.
const OUTRA = { id: '', name: 'Outra escola (não está na lista)' } as School;

const GRUPO_OUTRA = 'Não listada';

interface SchoolPickerProps {
  value: SchoolChoice;
  onChange: (value: SchoolChoice) => void;
  disabled?: boolean;
  /** Texto de apoio abaixo do seletor, quando não há erro. */
  helperText?: string;
}

/**
 * Seleção da própria escola pelo professor: lista as escolas da rede e oferece
 * "Outra", que abre um campo de texto livre. As duas saídas são exclusivas —
 * escolher da lista limpa o texto e vice-versa.
 */
export function SchoolPicker({ value, onChange, disabled, helperText }: SchoolPickerProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  // Estado próprio porque "Outra" recém-escolhida ainda tem o texto vazio, e
  // sem isso ela seria indistinguível de "nada selecionado".
  const [modoOutra, setModoOutra] = useState(value.schoolNameOther !== '');

  useEffect(() => {
    let cancelado = false;
    getAllSchools()
      .then((lista) => { if (!cancelado) setSchools(lista); })
      .catch(() => { if (!cancelado) setErro('Não foi possível carregar a lista de escolas.'); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, []);

  // O perfil carrega o usuário depois da primeira renderização.
  useEffect(() => {
    if (value.schoolNameOther !== '') setModoOutra(true);
  }, [value.schoolNameOther]);

  // groupBy do Autocomplete só agrupa bem se as opções já vierem na ordem dos
  // grupos; daí a ordenação por região antes do nome.
  const opcoes = useMemo(() => {
    const ordenadas = [...schools].sort(
      (a, b) =>
        (a.region ?? '').localeCompare(b.region ?? '', 'pt-BR') ||
        a.name.localeCompare(b.name, 'pt-BR'),
    );
    return [...ordenadas, OUTRA];
  }, [schools]);

  const selecionada = modoOutra
    ? OUTRA
    : schools.find((s) => s.id === value.schoolId) ?? null;

  const handleSelect = (_evento: unknown, opcao: School | null) => {
    if (!opcao) {
      setModoOutra(false);
      onChange({ schoolId: '', schoolNameOther: '' });
      return;
    }
    if (opcao.id === '') {
      setModoOutra(true);
      onChange({ schoolId: '', schoolNameOther: value.schoolNameOther });
      return;
    }
    setModoOutra(false);
    onChange({ schoolId: opcao.id, schoolNameOther: '' });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Autocomplete
        options={opcoes}
        value={selecionada}
        onChange={handleSelect}
        loading={loading}
        disabled={disabled || loading}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        groupBy={(o) => (o.id === '' ? GRUPO_OUTRA : o.region ?? 'Sem região')}
        noOptionsText="Nenhuma escola encontrada"
        renderInput={(params) => (
          <TextField
            {...params}
            label="Escola"
            error={!!erro}
            helperText={
              erro ||
              (loading ? 'Carregando escolas…' : helperText ?? 'Digite para filtrar pelo nome')
            }
          />
        )}
      />

      {modoOutra && (
        <TextField
          fullWidth
          required
          label="Nome da sua escola"
          value={value.schoolNameOther}
          disabled={disabled}
          onChange={(e) => onChange({ schoolId: '', schoolNameOther: e.target.value })}
          helperText="Escreva o nome completo. A secretaria da rede cadastra a escola depois."
        />
      )}
    </Box>
  );
}
