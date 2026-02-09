export interface ProductInfo {
  material: string;
  size: string;
  weight: string;
  price: string;
}

export interface GeneratedImage {
  id: string;
  type: TaskType;
  url: string | null;
  loading: boolean;
  error: string | null;
  timestamp: number;
}

export enum TaskType {
  WHITE_BG = 'White Background',
  SIZE_GUIDE = 'Size Guide',
  DETAIL = 'Detail Close-up',
  WEARING = 'Wearing Photo',
  LIFESTYLE = 'Lifestyle Scene',
}

export interface QCItem {
  id: string;
  label: string;
  checked: boolean;
}