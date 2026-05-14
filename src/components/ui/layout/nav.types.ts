import type { ElementType } from 'react';

export interface NavItem {
  label: string;
  icon: ElementType;
  path: string;
  end?: boolean;
}

export interface NavSection {
  items: NavItem[];
}

export interface NavConfig {
  sections: NavSection[];
  profilePath: string;
  homePath: string;
}
