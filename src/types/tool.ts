export interface ToolWriteupRef {
  title: string;
  slug: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  blurb: string;
  commands: string[];
  writeups: ToolWriteupRef[];
  iconName: string;
  accentColor: string;
  colorClass: string;
  hoverBorder: string;
}
