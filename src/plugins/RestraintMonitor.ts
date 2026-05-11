import { registerPlugin, WebPlugin, PluginListenerHandle } from '@capacitor/core';

export interface ViolationEvent {
  type: string;
  data: string;
  category: string;
  severity: string;
}

export interface BlacklistItem {
  id: string;
  category: string;
  type: 'domain' | 'app_package' | 'keyword';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'block' | 'fail_session';
}

export interface RestraintMonitorPlugin {
  hasUsageAccessPermission(): Promise<{ granted: boolean }>;
  requestUsageAccessPermission(): Promise<void>;
  hasAccessibilityPermission(): Promise<{ granted: boolean }>;
  requestAccessibilityPermission(): Promise<void>;
  getCurrentForegroundApp(): Promise<{ packageName: string }>;
  updateBlacklist(data: { domains: BlacklistItem[], apps: BlacklistItem[], keywords: BlacklistItem[] }): Promise<void>;
  setMonitoringActive(data: { active: boolean }): Promise<void>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  addListener(eventName: 'onViolation', listenerFunc: (event: ViolationEvent) => void): Promise<PluginListenerHandle>;
}

class RestraintMonitorWeb extends WebPlugin implements RestraintMonitorPlugin {
  async hasUsageAccessPermission(): Promise<{ granted: boolean }> {
    return { granted: true };
  }
  async requestUsageAccessPermission(): Promise<void> {
    console.log('Usage access permission requested (web mock)');
  }
  async hasAccessibilityPermission(): Promise<{ granted: boolean }> {
    return { granted: true };
  }
  async requestAccessibilityPermission(): Promise<void> {
    console.log('Accessibility permission requested (web mock)');
  }
  async getCurrentForegroundApp(): Promise<{ packageName: string }> {
    return { packageName: '' };
  }
  async updateBlacklist(data: any): Promise<void> {
    console.log('Blacklist updated (web mock)', data);
  }
  async setMonitoringActive(data: { active: boolean }): Promise<void> {
    console.log('Monitoring active set to:', data.active, '(web mock)');
  }
  async startMonitoring(): Promise<void> {
    console.log('Monitoring started (web mock)');
  }
  async stopMonitoring(): Promise<void> {
    console.log('Monitoring stopped (web mock)');
  }
  async addListener(eventName: string, listenerFunc: any): Promise<any> {
    console.log(`Listener added for ${eventName} (web mock)`);
    return { remove: () => console.log(`Listener removed for ${eventName} (web mock)`) };
  }
}

const RestraintMonitor = registerPlugin<RestraintMonitorPlugin>('RestraintMonitor', {
  web: () => new RestraintMonitorWeb(),
});

export default RestraintMonitor;
