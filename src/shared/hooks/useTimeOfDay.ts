import { useMemo } from 'react';
import { Sunrise, Sun, Sunset, Moon, LucideIcon } from 'lucide-react';

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

interface TimeContext {
  timeOfDay: TimeOfDay;
  hour: number;
  dayName: string; // "lundi", "mardi", etc.
  periodName: string; // "matin", "après-midi", "soir"
  greeting: {
    fr: string;
    dioula: string;
    nouchi: string;
  };
  marketStatus: {
    isOpen: boolean;
    message: string;
    emoji: string;
  };
  ambiance: {
    primary: string;
    secondary: string;
    overlay: string;
  };
  icon: LucideIcon;
}

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const TIME_CONFIG: Record<TimeOfDay, Omit<TimeContext, 'hour' | 'timeOfDay' | 'dayName' | 'periodName'>> = {
  dawn: {
    greeting: {
      fr: "Le jour se lève !",
      dioula: "Sɔgɔma bɛ bɔ !",
      nouchi: "Ça commence à faire jour !"
    },
    marketStatus: {
      isOpen: false,
      message: "Le marché ouvre bientôt",
      emoji: "🌅"
    },
    ambiance: {
      primary: "hsl(340 50% 70%)",
      secondary: "hsl(30 80% 70%)",
      overlay: "hsl(340 50% 70% / 0.15)"
    },
    icon: Sunrise
  },
  morning: {
    greeting: {
      fr: "Bon matin !",
      dioula: "Sɔgɔma ɲuman !",
      nouchi: "Yako mon gars !"
    },
    marketStatus: {
      isOpen: true,
      message: "Le marché est très actif",
      emoji: "🛒"
    },
    ambiance: {
      primary: "hsl(36 100% 50%)",
      secondary: "hsl(28 81% 52%)",
      overlay: "hsl(36 100% 50% / 0.2)"
    },
    icon: Sunrise
  },
  afternoon: {
    greeting: {
      fr: "Bon après-midi !",
      dioula: "Tile ɲuman !",
      nouchi: "Ça gère ?"
    },
    marketStatus: {
      isOpen: true,
      message: "Le marché est actif",
      emoji: "☀️"
    },
    ambiance: {
      primary: "hsl(28 81% 52%)",
      secondary: "hsl(36 100% 50%)",
      overlay: "hsl(28 81% 52% / 0.25)"
    },
    icon: Sun
  },
  evening: {
    greeting: {
      fr: "Bonsoir !",
      dioula: "Wula ɲuman !",
      nouchi: "La journée était comment ?"
    },
    marketStatus: {
      isOpen: true,
      message: "Le marché ferme bientôt",
      emoji: "🌇"
    },
    ambiance: {
      primary: "hsl(14 100% 50%)",
      secondary: "hsl(28 81% 44%)",
      overlay: "hsl(14 100% 50% / 0.2)"
    },
    icon: Sunset
  },
  night: {
    greeting: {
      fr: "Bonne nuit !",
      dioula: "Su ɲuman !",
      nouchi: "Bonne nuit champion !"
    },
    marketStatus: {
      isOpen: false,
      message: "Le marché est fermé",
      emoji: "🌙"
    },
    ambiance: {
      primary: "hsl(260 50% 30%)",
      secondary: "hsl(240 50% 25%)",
      overlay: "hsl(260 50% 30% / 0.3)"
    },
    icon: Moon
  }
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

function getPeriodName(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'dawn':
    case 'morning':
      return 'matin';
    case 'afternoon':
      return 'après-midi';
    case 'evening':
      return 'soir';
    case 'night':
      return 'nuit';
  }
}

export function useTimeOfDay(): TimeContext {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const timeOfDay = getTimeOfDay(hour);
    const config = TIME_CONFIG[timeOfDay];

    return {
      timeOfDay,
      hour,
      dayName: DAYS_FR[dayOfWeek],
      periodName: getPeriodName(timeOfDay),
      ...config
    };
  }, []);
}

export default useTimeOfDay;
