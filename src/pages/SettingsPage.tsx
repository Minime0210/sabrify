import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Bell, Moon, Sun, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReminderSettings {
  morning: boolean;
  midday: boolean;
  evening: boolean;
  beforeSleep: boolean;
  randomReminders: boolean;
}

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [reminders, setReminders] = useState<ReminderSettings>({
    morning: true,
    midday: false,
    evening: true,
    beforeSleep: true,
    randomReminders: false,
  });

  // Check for system dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleReminder = (key: keyof ReminderSettings) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-card shadow-sm"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center">
        <Link to="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-heading font-medium text-foreground ml-2">
          Settings
        </h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            Appearance
          </h2>
          <div className="sakina-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
        </section>

        {/* Reminders */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Reminders
            </h2>
          </div>
          <div className="sakina-card divide-y divide-border">
            {[
              { key: 'morning', label: 'Morning Reminder', time: '6:00 AM', icon: '🌅' },
              { key: 'midday', label: 'Midday Check-in', time: '12:00 PM', icon: '☀️' },
              { key: 'evening', label: 'Evening Reflection', time: '6:00 PM', icon: '🌆' },
              { key: 'beforeSleep', label: 'Before Sleep', time: '10:00 PM', icon: '🌙' },
              { key: 'randomReminders', label: 'Random Gentle Reminders', time: 'Throughout the day', icon: '✨' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
                <ToggleSwitch 
                  enabled={reminders[item.key as keyof ReminderSettings]} 
                  onToggle={() => toggleReminder(item.key as keyof ReminderSettings)} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Privacy
            </h2>
          </div>
          <div className="sakina-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your data stays with you</p>
                <p className="text-xs text-muted-foreground">
                  All data is stored locally on your device
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
              <p>• No ads or tracking</p>
              <p>• No account required</p>
              <p>• Works completely offline</p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            About
          </h2>
          <div className="sakina-card p-4 text-center space-y-2">
            <p className="font-heading text-xl text-foreground">Sakina</p>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-4">
              Made with love for the Ummah 💚
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
