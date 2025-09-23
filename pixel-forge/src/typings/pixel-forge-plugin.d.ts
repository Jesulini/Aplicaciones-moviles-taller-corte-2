export interface WallpaperPluginType {
  setWallpaper(options: { url: string; type: 'home' | 'lock' }): Promise<{ success: boolean }>;
}
