import { Flame, Thermometer, Snowflake } from 'lucide-react';

interface Props {
  temperature: 'hot' | 'warm' | 'cold' | null | undefined;
}

export function TemperatureBadge({ temperature }: Props) {
  if (!temperature) return null;

  const config = {
    hot: {
      label: 'HOT',
      bg: 'bg-red-500 text-white',
      icon: Flame
    },
    warm: {
      label: 'WARM',
      bg: 'bg-orange-100 text-orange-700',
      icon: Thermometer
    },
    cold: {
      label: 'COLD',
      bg: 'bg-blue-100 text-blue-700',
      icon: Snowflake
    },
  };

  const { label, bg, icon: Icon } = config[temperature] || config.warm;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
