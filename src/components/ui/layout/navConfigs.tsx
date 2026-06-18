import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import DomainIcon from '@mui/icons-material/Domain';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import type { NavConfig } from './nav.types';

export const professorNavConfig: NavConfig = {
  sections: [
    {
      items: [
        { label: 'Início',        icon: HomeIcon,       path: '/app/professor/inicio', end: true },
        { label: 'Questionário',  icon: AssignmentIcon, path: '/app/professor/questionario' },
        { label: 'Relatórios',    icon: BarChartIcon,   path: '/app/professor/relatorios' },
      ],
    },
    {
      items: [
        { label: 'Perfil', icon: PersonIcon, path: '/app/professor/perfil' },
      ],
    },
  ],
  profilePath: '/app/professor/perfil',
  homePath: '/app/professor/inicio',
};

export const gestorNavConfig: NavConfig = {
  sections: [
    {
      items: [
        { label: 'Início',    icon: HomeIcon,     path: '/app/gestor/inicio',    end: true },
        { label: 'Equipe',    icon: GroupIcon,    path: '/app/gestor/equipe' },
        { label: 'Escola',    icon: SchoolIcon,   path: '/app/gestor/escola' },
        { label: 'Relatórios', icon: BarChartIcon, path: '/app/gestor/relatorios' },
      ],
    },
  ],
  profilePath: '/app/gestor/inicio',
  homePath: '/app/gestor/inicio',
};

export const secretariaNavConfig: NavConfig = {
  sections: [
    {
      items: [
        { label: 'Início',     icon: HomeIcon,                  path: '/app/secretaria/inicio',    end: true },
        { label: 'Escolas',    icon: DomainIcon,                path: '/app/secretaria/escolas' },
        { label: 'Relatórios', icon: BarChartIcon,              path: '/app/secretaria/relatorios' },
        { label: 'Admin',      icon: AdminPanelSettingsIcon,    path: '/app/secretaria/admin' },
      ],
    },
  ],
  profilePath: '/app/secretaria/inicio',
  homePath: '/app/secretaria/inicio',
};
