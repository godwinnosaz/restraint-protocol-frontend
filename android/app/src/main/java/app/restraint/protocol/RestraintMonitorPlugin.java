package app.restraint.protocol;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.util.Log;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.text.TextUtils;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;
import org.json.JSONException;

@CapacitorPlugin(name = "RestraintMonitor")
public class RestraintMonitorPlugin extends Plugin {

    private BroadcastReceiver violationReceiver;
    private static final String PREFS_NAME = "RestraintPrefs";

    @Override
    public void load() {
        violationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if ("app.restraint.protocol.VIOLATION".equals(intent.getAction())) {
                    JSObject ret = new JSObject();
                    ret.put("type", intent.getStringExtra("type"));
                    ret.put("data", intent.getStringExtra("data"));
                    ret.put("category", intent.getStringExtra("category"));
                    ret.put("severity", intent.getStringExtra("severity"));
                    notifyListeners("onViolation", ret);
                }
            }
        };
        IntentFilter filter = new IntentFilter("app.restraint.protocol.VIOLATION");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(violationReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(violationReceiver, filter);
        }
    }

    @PluginMethod
    public void updateBlacklist(PluginCall call) {
        JSArray domains = call.getArray("domains");
        JSArray apps = call.getArray("apps");
        JSArray keywords = call.getArray("keywords");

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        
        if (domains != null) editor.putString("blocked_domains", domains.toString());
        if (apps != null) editor.putString("blocked_apps", apps.toString());
        if (keywords != null) editor.putString("blocked_keywords", keywords.toString());
        
        editor.apply();
        call.resolve();
    }

    @PluginMethod
    public void setMonitoringActive(PluginCall call) {
        boolean active = call.getBoolean("active", false);
        setMonitoringState(active);
        call.resolve();
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        setMonitoringState(true);
        call.resolve();
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        setMonitoringState(false);
        call.resolve();
    }

    private void setMonitoringState(boolean active) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean("monitoring_active", active).apply();
        Log.d("RestraintMonitor", "Monitoring active: " + active);
    }

    @PluginMethod
    public void hasUsageAccessPermission(PluginCall call) {
        Context context = getContext();
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), context.getPackageName());
        
        JSObject ret = new JSObject();
        ret.put("granted", mode == AppOpsManager.MODE_ALLOWED);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestUsageAccessPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void hasAccessibilityPermission(PluginCall call) {
        int accessibilityEnabled = 0;
        final String service = getContext().getPackageName() + "/" + RestraintAccessibilityService.class.getCanonicalName();
        try {
            accessibilityEnabled = Settings.Secure.getInt(getContext().getContentResolver(), android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {
            Log.e("RestraintMonitor", "Error finding setting, default to not enabled: " + e.getMessage());
        }
        TextUtils.SimpleStringSplitter mStringColonSplitter = new TextUtils.SimpleStringSplitter(':');

        boolean accessibilityFound = false;
        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (settingValue != null) {
                mStringColonSplitter.setString(settingValue);
                while (mStringColonSplitter.hasNext()) {
                    String accessibilityService = mStringColonSplitter.next();
                    if (accessibilityService.equalsIgnoreCase(service)) {
                        accessibilityFound = true;
                        break;
                    }
                }
            }
        }

        JSObject ret = new JSObject();
        ret.put("granted", accessibilityFound);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getCurrentForegroundApp(PluginCall call) {
        String currentApp = "";
        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long time = System.currentTimeMillis();
        List<UsageStats> appList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time);
        if (appList != null && appList.size() > 0) {
            SortedMap<Long, UsageStats> mySortedMap = new TreeMap<Long, UsageStats>();
            for (UsageStats usageStats : appList) {
                mySortedMap.put(usageStats.getLastTimeUsed(), usageStats);
            }
            if (!mySortedMap.isEmpty()) {
                currentApp = mySortedMap.get(mySortedMap.lastKey()).getPackageName();
            }
        }

        JSObject ret = new JSObject();
        ret.put("packageName", currentApp);
        call.resolve(ret);
    }
}
