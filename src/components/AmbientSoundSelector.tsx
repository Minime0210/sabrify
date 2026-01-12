import { motion } from 'framer-motion';
import { Cloud, Wind, Moon, VolumeX } from 'lucide-react';
import { AmbientSoundType } from '@/hooks/useAmbientSound';
import { Slider } from '@/components/ui/slider';

interface AmbientSoundSelectorProps {
  currentSound: AmbientSoundType;
  isPlaying: boolean;
  volume: number;
  onSelectSound: (type: AmbientSoundType) => void;
  onVolumeChange: (volume: number) => void;
}

const soundOptions: { type: AmbientSoundType; icon: React.ReactNode; label: string }[] = [
  { type: 'none', icon: <VolumeX className="w-5 h-5" />, label: 'Off' },
  { type: 'rain', icon: <Cloud className="w-5 h-5" />, label: 'Rain' },
  { type: 'wind', icon: <Wind className="w-5 h-5" />, label: 'Wind' },
  { type: 'masjid', icon: <Moon className="w-5 h-5" />, label: 'Masjid' },
];

export const AmbientSoundSelector = ({
  currentSound,
  isPlaying,
  volume,
  onSelectSound,
  onVolumeChange,
}: AmbientSoundSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {soundOptions.map(({ type, icon, label }) => (
          <motion.button
            key={type}
            onClick={() => onSelectSound(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-xl transition-all
              ${currentSound === type 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80'
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${currentSound === type ? 'bg-primary/20' : 'bg-secondary'}
            `}>
              {icon}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </motion.button>
        ))}
      </div>
      
      {currentSound !== 'none' && isPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-3 px-4"
        >
          <span className="text-xs text-muted-foreground">Volume</span>
          <Slider
            value={[volume * 100]}
            onValueChange={([val]) => onVolumeChange(val / 100)}
            max={100}
            step={1}
            className="flex-1"
          />
        </motion.div>
      )}
    </div>
  );
};
