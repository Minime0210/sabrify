import { motion } from 'framer-motion';
import { MoodType } from '@/data/islamicContent';

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood?: MoodType;
}

const moods: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'anxious', emoji: '😰', label: 'Anxious' },
  { type: 'sad', emoji: '😔', label: 'Sad' },
  { type: 'stressed', emoji: '😫', label: 'Stressed' },
  { type: 'peaceful', emoji: '😌', label: 'Peaceful' },
  { type: 'grateful', emoji: '🤲', label: 'Grateful' },
];

export const MoodSelector = ({ onSelect, selectedMood }: MoodSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-heading text-foreground mb-2">
          How are you feeling today?
        </h2>
        <p className="text-sm text-muted-foreground">
          Select your current state for personalized reminders
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => onSelect(mood.type)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
              selectedMood === mood.type
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-card hover:bg-secondary shadow-soft'
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
