export interface MdEntry {
  id: string;
  filename: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
  html: string;
}

export interface Settings {
  idField?: string;
  exclude?: string[];
}

export interface MdData {
  entries: MdEntry[];
  keys: string[];
  settings: Settings;
}
