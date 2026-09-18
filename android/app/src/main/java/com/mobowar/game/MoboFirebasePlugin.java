package com.mobowar.game;

import android.content.pm.PackageInfo;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.FirebaseApp;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

import java.util.Iterator;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "MoboFirebase")
public class MoboFirebasePlugin extends Plugin {
    private static final Pattern VALID_NAME = Pattern.compile("^[A-Za-z][A-Za-z0-9_]{0,39}$");
    private FirebaseAnalytics analytics;
    private FirebaseCrashlytics crashlytics;
    private boolean available;

    @Override
    public void load() {
        try {
            FirebaseApp app = FirebaseApp.initializeApp(getContext());
            if (app == null) return;
            analytics = FirebaseAnalytics.getInstance(getContext());
            crashlytics = FirebaseCrashlytics.getInstance();
            available = true;
        } catch (Exception ignored) {
            available = false;
        }
    }

    @PluginMethod
    public void logEvent(PluginCall call) {
        String name = call.getString("name", "");
        if (!available || !VALID_NAME.matcher(name).matches()) { call.resolve(); return; }
        analytics.logEvent(name, toBundle(call.getObject("params", new JSObject())));
        call.resolve();
    }

    @PluginMethod
    public void setUserProperty(PluginCall call) {
        String name = call.getString("name", "");
        String value = call.getString("value", "");
        if (available && VALID_NAME.matcher(name).matches()) analytics.setUserProperty(name, value == null ? null : value.substring(0, Math.min(36, value.length())));
        call.resolve();
    }

    @PluginMethod
    public void setCustomKey(PluginCall call) {
        String name = call.getString("name", "");
        Object value = call.getData().opt("value");
        if (available && VALID_NAME.matcher(name).matches() && value != null) {
            if (value instanceof Number) crashlytics.setCustomKey(name, ((Number) value).doubleValue());
            else if (value instanceof Boolean) crashlytics.setCustomKey(name, (Boolean) value);
            else crashlytics.setCustomKey(name, String.valueOf(value).substring(0, Math.min(1024, String.valueOf(value).length())));
        }
        call.resolve();
    }

    @PluginMethod
    public void log(PluginCall call) {
        if (available) crashlytics.log(call.getString("message", "").substring(0, Math.min(1024, call.getString("message", "").length())));
        call.resolve();
    }

    @PluginMethod
    public void recordException(PluginCall call) {
        if (available) {
            String name = call.getString("name", "JavaScriptError");
            String message = call.getString("message", "Unknown JavaScript error");
            crashlytics.recordException(new Exception(name + ": " + message));
        }
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", available);
        result.put("debugBuild", isDebugBuild());
        result.put("packageName", getContext().getPackageName());
        try {
            PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            result.put("appVersion", info.versionName == null ? "unknown" : info.versionName);
            long versionCode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
            result.put("buildNumber", String.valueOf(versionCode));
        } catch (Exception ignored) {
            result.put("appVersion", "unknown");
            result.put("buildNumber", "unknown");
        }
        call.resolve(result);
    }

    @PluginMethod
    public void testCrash(PluginCall call) {
        if (!isDebugBuild()) { call.reject("Test Crash is available only in debug builds."); return; }
        if (!available) { call.reject("Firebase is not configured."); return; }
        getActivity().runOnUiThread(() -> { throw new RuntimeException("Mobo War Crashlytics test crash"); });
        call.resolve();
    }

    private Bundle toBundle(JSObject params) {
        Bundle bundle = new Bundle();
        Iterator<String> keys = params.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            if (!VALID_NAME.matcher(key).matches()) continue;
            Object value = params.opt(key);
            if (value instanceof String) bundle.putString(key, ((String) value).substring(0, Math.min(100, ((String) value).length())));
            else if (value instanceof Integer) bundle.putLong(key, ((Integer) value).longValue());
            else if (value instanceof Long) bundle.putLong(key, (Long) value);
            else if (value instanceof Number) bundle.putDouble(key, ((Number) value).doubleValue());
            else if (value instanceof Boolean) bundle.putLong(key, (Boolean) value ? 1 : 0);
        }
        return bundle;
    }

    private boolean isDebugBuild() {
        return (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }
}
