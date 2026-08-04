export type InstagramPost = {
  id: string;
  type: string;
  thumbnail_url: string;
  caption: string;
  post_url: string;
  published_at?: string | null;
};

export type YouTubeVideo = {
  id: string;
  thumbnail_url: string;
  title: string;
  video_url: string;
  published_at?: string | null;
};

export type SocialMediaPayload = {
  instagram: InstagramPost[];
  youtube: YouTubeVideo[];
  meta: {
    instagram_enabled: boolean;
    youtube_enabled: boolean;
  };
};
