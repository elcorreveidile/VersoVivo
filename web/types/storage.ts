export interface StorageFile {
  name: string;
  path: string;
  size: number;
  type: string;
  contentType: string;
  url: string;
  timeCreated: Date;
  updated: Date;
  isUsed: boolean;
  references?: {
    type: 'poem' | 'book';
    id: string;
    title: string;
    field: string;
  }[];
}

export interface StorageUsage {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  unusedFiles: number;
  unusedSize: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
  skipped: number;
}

export interface ExportData {
  timestamp: string;
  version: string;
  data: {
    poems: any[];
    books: any[];
  };
}
