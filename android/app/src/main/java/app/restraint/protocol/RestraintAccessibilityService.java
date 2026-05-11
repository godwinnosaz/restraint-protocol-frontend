package app.restraint.protocol;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

public class RestraintAccessibilityService extends AccessibilityService {
    private static final String TAG = "RestraintAccessibility";
    private static final String PREFS_NAME = "RestraintPrefs";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("monitoring_active", false)) return;

        int eventType = event.getEventType();
        
        // 1. App Detection
        if (eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
            if (!packageName.isEmpty() && !packageName.equals(getPackageName())) {
                checkAppViolation(packageName);
            }
        }

        // 2. Content/URL Detection
        if (eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
            eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            
            AccessibilityNodeInfo nodeInfo = event.getSource();
            if (nodeInfo == null) return;

            inspectNodes(nodeInfo);
        }
    }

    private void checkAppViolation(String packageName) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String appsJson = prefs.getString("blocked_apps", "[]");
        try {
            JSONArray apps = new JSONArray(appsJson);
            for (int i = 0; i < apps.length(); i++) {
                JSONObject item = apps.getJSONObject(i);
                String value = item.getString("value");
                if (packageName.equals(value)) {
                    triggerViolation(item.getString("category"), "BLOCKED_APP_OPENED", packageName, item.getString("severity"));
                }
            }
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing blocked apps", e);
        }
    }

    private void inspectNodes(AccessibilityNodeInfo node) {
        if (node == null) return;

        if (node.getText() != null) {
            String text = node.getText().toString().toLowerCase();
            
            // 1. Check Keywords
            checkKeywords(text);

            // 2. Check URL Bar specifically
            if (node.getViewIdResourceName() != null && node.getViewIdResourceName().contains("url_bar")) {
                checkUrl(text);
            }
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            inspectNodes(node.getChild(i));
        }
    }

    private void checkKeywords(String text) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String keywordsJson = prefs.getString("blocked_keywords", "[]");
        try {
            JSONArray keywords = new JSONArray(keywordsJson);
            for (int i = 0; i < keywords.length(); i++) {
                JSONObject item = keywords.getJSONObject(i);
                String value = item.getString("value").toLowerCase();
                if (text.contains(value)) {
                    triggerViolation(item.getString("category"), "KEYWORD_DETECTED", value, item.getString("severity"));
                }
            }
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing keywords", e);
        }
    }

    private void checkUrl(String url) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String domainsJson = prefs.getString("blocked_domains", "[]");
        try {
            JSONArray domains = new JSONArray(domainsJson);
            for (int i = 0; i < domains.length(); i++) {
                JSONObject item = domains.getJSONObject(i);
                String value = item.getString("value").toLowerCase();
                if (url.contains(value)) {
                    triggerViolation(item.getString("category"), "BLOCKED_DOMAIN_ATTEMPT", value, item.getString("severity"));
                }
            }
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing domains", e);
        }
    }

    private void triggerViolation(String category, String type, String data, String severity) {
        Log.w(TAG, "Violation detected [" + category + "]: " + data);
        Intent intent = new Intent("app.restraint.protocol.VIOLATION");
        intent.putExtra("category", category);
        intent.putExtra("type", type);
        intent.putExtra("data", data);
        intent.putExtra("severity", severity);
        sendBroadcast(intent);
    }

    @Override
    public void onInterrupt() {
    }
}
