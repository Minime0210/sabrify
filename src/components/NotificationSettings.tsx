import { useState } from 'react';
import { Bell, BellOff, Sun, Moon, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export function NotificationSettings() {
  const { 
    permission, 
    isSupported, 
    settings, 
    updateSettings, 
    requestPermission,
    applySchedule 
  } = useNotifications();
  const [isSaving, setIsSaving] = useState(false);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications enabled!');
    } else {
      toast.error('Please enable notifications in your browser settings');
    }
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const success = await applySchedule();
      if (success) {
        toast.success('Reminder schedule saved!');
      }
    } catch (error) {
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Islamic Reminders
        </CardTitle>
        <CardDescription>
          Schedule daily reminders for dhikr and reflection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' && (
          <Button 
            onClick={handleEnableNotifications}
            className="w-full"
            variant="outline"
          >
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        )}

        <div className="space-y-4">
          {/* Morning Reminder */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Sun className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <Label className="text-sm font-medium">Morning Adhkar</Label>
                <p className="text-xs text-muted-foreground">Start your day with remembrance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.morningTime}
                onChange={(e) => updateSettings({ morningTime: e.target.value })}
                className="w-24 h-8 text-xs"
                disabled={!settings.morningEnabled}
              />
              <Switch
                checked={settings.morningEnabled}
                onCheckedChange={(checked) => updateSettings({ morningEnabled: checked })}
              />
            </div>
          </div>

          {/* Evening Reminder */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/20">
                <Moon className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <Label className="text-sm font-medium">Evening Adhkar</Label>
                <p className="text-xs text-muted-foreground">Reflect on your day</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.eveningTime}
                onChange={(e) => updateSettings({ eveningTime: e.target.value })}
                className="w-24 h-8 text-xs"
                disabled={!settings.eveningEnabled}
              />
              <Switch
                checked={settings.eveningEnabled}
                onCheckedChange={(checked) => updateSettings({ eveningEnabled: checked })}
              />
            </div>
          </div>

          {/* Before Sleep Reminder */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-500/20">
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <Label className="text-sm font-medium">Before Sleep</Label>
                <p className="text-xs text-muted-foreground">End your day peacefully</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={settings.beforeSleepTime}
                onChange={(e) => updateSettings({ beforeSleepTime: e.target.value })}
                className="w-24 h-8 text-xs"
                disabled={!settings.beforeSleepEnabled}
              />
              <Switch
                checked={settings.beforeSleepEnabled}
                onCheckedChange={(checked) => updateSettings({ beforeSleepEnabled: checked })}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSaveSchedule} 
          className="w-full"
          disabled={isSaving || (!settings.morningEnabled && !settings.eveningEnabled && !settings.beforeSleepEnabled)}
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Reminders are stored locally and will work even when the app is closed
        </p>
      </CardContent>
    </Card>
  );
}
