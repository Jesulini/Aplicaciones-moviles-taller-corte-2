package io.ionic.starter;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;

@CapacitorPlugin(name = "MyCustomPlugin")
public class MyCustomPlugin extends Plugin {

  @PluginMethod()
  public void execute(PluginCall call) {
    JSObject resp = new JSObject();
    System.out.println("LOG: FROM PLUGIN");
    resp.put("message", "Hello world");
    call.resolve(resp);
  }

  @PluginMethod()
  public void setWallpaper(PluginCall call) {
    String base64Image = call.getString("imageBase64");
    String type = call.getString("type"); // "home", "lock" o "both"

    if (base64Image == null || base64Image.isEmpty()) {
      call.reject("No image provided");
      return;
    }

    try {
      byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
      Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

      if ("home".equals(type)) {
        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
      } else if ("lock".equals(type)) {
        wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
      } else {
        // both
        wallpaperManager.setBitmap(bitmap);
      }

      JSObject resp = new JSObject();
      resp.put("message", "Wallpaper set successfully");
      call.resolve(resp);

    } catch (IOException e) {
      call.reject("Error setting wallpaper: " + e.getMessage());
    }
  }
}
