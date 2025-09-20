package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import io.ionic.starter.MyWallpaperPicker;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerPlugin(MyWallpaperPicker.class);
    }
}
