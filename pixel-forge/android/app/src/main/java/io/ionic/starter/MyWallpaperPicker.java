package io.ionic.starter;

import android.app.WallpaperManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;

@CapacitorPlugin(name = "MyWallpaper")
public class MyWallpaperPicker extends Plugin {

    // Establecer wallpaper en Home Screen
    public void setHomeScreenWallpaper(PluginCall call) {
        String base64Data = call.getString("data");
        if (base64Data == null) {
            call.reject("No data provided");
            return;
        }

        try {
            byte[] decoded = Base64.decode(base64Data, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);

            WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM);
            } else {
                wallpaperManager.setBitmap(bitmap);
            }

            call.resolve();
        } catch (IOException e) {
            call.reject("Failed to set home screen wallpaper", e);
        }
    }

    // Establecer wallpaper en Lock Screen
    public void setLockScreenWallpaper(PluginCall call) {
        String base64Data = call.getString("data");
        if (base64Data == null) {
            call.reject("No data provided");
            return;
        }

        try {
            byte[] decoded = Base64.decode(base64Data, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);

            WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK);
            } else {
                // En versiones antiguas solo se puede aplicar a todo el dispositivo
                wallpaperManager.setBitmap(bitmap);
            }

            call.resolve();
        } catch (IOException e) {
            call.reject("Failed to set lock screen wallpaper", e);
        }
    }
}
