
export interface MemeImage {
  id: string;
  url: string;
  originalUrl?: string;
  prompt: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}
