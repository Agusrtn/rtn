export type VideoCategory = 'entretenimiento' | 'streams-pasados' | string;

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  publishedAt: string;
  duration?: string;
  isLive?: boolean;
  viewCount?: string;
  channel?: string;
  channelId?: string;
  category: VideoCategory;
}

export const categoryLabels: Record<string, string> = {
  entretenimiento: 'Entretenimiento',
  'streams-pasados': 'Directos Pasados',
};

export const categoryOrder: VideoCategory[] = ['entretenimiento', 'streams-pasados'];