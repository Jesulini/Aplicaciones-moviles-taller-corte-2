package io.ionic.starter;

import android.util.Log;
import android.webkit.JavascriptInterface;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WallpaperPlugin")
public class WallpaperPlugin extends Plugin {

    @JavascriptInterface   // 👈 en vez de @PluginMethod
    public void setWallpaper(PluginCall call) {
        String url = call.getString("url");
        String type = call.getString("type");

        Log.d("WallpaperPlugin", "setWallpaper llamado con URL: " + url + " y type: " + type);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
