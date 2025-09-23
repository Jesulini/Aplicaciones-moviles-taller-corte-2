import { registerPlugin } from "@capacitor/core";

export interface IMyCustomPluginConfig {
  execute: () => Promise<{ message: string }>;
  setWallpaper: (options: { imageBase64: string; type: "home" | "lock" | "both" }) 
    => Promise<{ message: string }>;
}

const MyCustomPlugin = registerPlugin<IMyCustomPluginConfig>("MyCustomPlugin");
export default MyCustomPlugin;
