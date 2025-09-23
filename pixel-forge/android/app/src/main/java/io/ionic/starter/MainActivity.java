package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();

        // Registrar manualmente el plugin
        this.registerPlugin(WallpaperPlugin.class);
    }
}
