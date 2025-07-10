export interface NavigationItem {
  label: string;
  icon?: string;
  url?: string;
  permissions?: [string, string][];
  children?: NavigationItem[];
}