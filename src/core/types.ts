export interface MdEntry {
  id: string;
  filename: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
  html: string;
}

export interface MdEntryMeta {
  id: string;
  filename: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
}

export interface Settings {
  idField?: string;
  exclude?: string[];
}

export interface MdMeta {
  entries: MdEntryMeta[];
  keys: string[];
  settings: Settings;
}
