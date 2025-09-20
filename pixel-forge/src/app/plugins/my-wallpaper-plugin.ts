export interface MyWallpaperPlugin {
  setHomeScreenWallpaper(options: { data: string }): Promise<void>;
  setLockScreenWallpaper(options: { data: string }): Promise<void>;
}
