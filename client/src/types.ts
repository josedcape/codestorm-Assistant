export interface FileInfo {
  id: string;
  name: string;
  path?: string;
  content: string;
  language: string;
  isDirectory?: boolean;
  children?: FileInfo[];
}

export interface TabInfo {
  id: string;
  fileId: string;
  name: string;
  isActive: boolean;
  isDirty: boolean;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
}
