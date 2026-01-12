import { useState, useEffect, useCallback } from 'react';

export interface ReminderSettings {
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
  beforeSleepEnabled: boolean;
  beforeSleepTime: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  morningEnabled: false,
  morningTime: '06:00',
  eveningEnabled: false,
  eveningTime: '18:00',
  beforeSleepEnabled: false,
  beforeSleepTime: '22:00',
};

const STORAGE_KEY = 'sabrify_reminder_settings';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [scheduledReminders, setScheduledReminders] = useState<number[]>([]);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }

    // Load saved settings
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notification settings:', e);
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, []);

  const scheduleReminder = useCallback((time: string, type: 'morning' | 'evening' | 'beforeSleep') => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled.getTime() - now.getTime();

    const messages = {
      morning: {
        title: '🌅 Morning Reminder',
        body: 'Start your day with dhikr and gratitude. "And in the morning, glorify Him." (Quran 33:42)',
      },
      evening: {
        title: '🌙 Evening Reminder',
        body: 'Take a moment to reflect. "And glorify Him morning and evening." (Quran 33:42)',
      },
      beforeSleep: {
        title: '✨ Before Sleep',
        body: 'End your day with peace. Recite the evening adhkar before rest.',
      },
    };

    const timeoutId = window.setTimeout(() => {
      if (permission === 'granted') {
        const msg = messages[type];
        new Notification(msg.title, {
          body: msg.body,
          icon: '/icons/icon-192.png',
          tag: type,
        });
        
        // Reschedule for the next day
        scheduleReminder(time, type);
      }
    }, delay);

    return timeoutId;
  }, [permission]);

  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const applySchedule = useCallback(async () => {
    // Clear existing scheduled reminders
    scheduledReminders.forEach(id => clearTimeout(id));
    const newReminders: number[] = [];

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    await registerServiceWorker();

    if (settings.morningEnabled) {
      const id = scheduleReminder(settings.morningTime, 'morning');
      if (id) newReminders.push(id);
    }

    if (settings.eveningEnabled) {
      const id = scheduleReminder(settings.eveningTime, 'evening');
      if (id) newReminders.push(id);
    }

    if (settings.beforeSleepEnabled) {
      const id = scheduleReminder(settings.beforeSleepTime, 'beforeSleep');
      if (id) newReminders.push(id);
    }

    setScheduledReminders(newReminders);
    return true;
  }, [permission, settings, scheduledReminders, requestPermission, registerServiceWorker, scheduleReminder]);

  return {
    permission,
    isSupported,
    settings,
    updateSettings,
    requestPermission,
    applySchedule,
  };
}
