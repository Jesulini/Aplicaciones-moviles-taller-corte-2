import { PluginListenerHandle, Plugin } from '@capacitor/core';

export interface MyWallpaperPlugin extends Plugin {
  setHomeScreenWallpaper(options: { data: string }): Promise<{ success: boolean }>;
  setLockScreenWallpaper(options: { data: string }): Promise<{ success: boolean }>;
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    MyWallpaper: MyWallpaperPlugin;
  }
}
