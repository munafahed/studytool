"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, Maximize2, Minimize2, Sparkles, Sun, Moon, Star, Rocket, Cherry, Book, Grid, Leaf, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface Theme {
  id: string;
  name: string;
  nameAr: string;
  icon: any;
  gradient: string;
  buttonColor: string;
  textColor: string;
  accentColor: string;
  decorations: string;
  pattern: string;
}

const themes: Theme[] = [
  {
    id: 'starlight',
    name: 'Starlight Goals',
    nameAr: 'النجوم الساطعة',
    icon: Star,
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    buttonColor: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400',
    textColor: 'text-yellow-100',
    accentColor: 'text-yellow-300',
    decorations: 'stars',
    pattern: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)'
  },
  {
    id: 'pastel',
    name: 'Pastel Power',
    nameAr: 'طاقة الباستيل',
    icon: Sparkles,
    gradient: 'from-pink-200 via-purple-200 to-blue-200',
    buttonColor: 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-300 hover:to-purple-400',
    textColor: 'text-purple-900',
    accentColor: 'text-pink-600',
    decorations: 'bubbles',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(251, 207, 232, 0.5) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(196, 181, 253, 0.5) 0%, transparent 50%)'
  },
  {
    id: 'anime',
    name: 'Anime Style',
    nameAr: 'تصميم الأنمي',
    icon: Sparkles,
    gradient: 'from-purple-400 via-pink-500 to-red-500',
    buttonColor: 'bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-300 hover:to-pink-400',
    textColor: 'text-white',
    accentColor: 'text-yellow-300',
    decorations: 'anime',
    pattern: 'linear-gradient(45deg, rgba(236, 72, 153, 0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(236, 72, 153, 0.3) 25%, transparent 25%)'
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    nameAr: 'زهر الكرز',
    icon: Cherry,
    gradient: 'from-pink-100 via-rose-200 to-purple-200',
    buttonColor: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
    textColor: 'text-pink-900',
    accentColor: 'text-rose-600',
    decorations: 'petals',
    pattern: 'radial-gradient(circle at 40% 20%, rgba(251, 207, 232, 0.6) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(253, 164, 175, 0.4) 0%, transparent 50%)'
  },
  {
    id: 'space',
    name: 'Space Explorer',
    nameAr: 'مغامرة الفضاء',
    icon: Rocket,
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    buttonColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400',
    textColor: 'text-cyan-100',
    accentColor: 'text-cyan-300',
    decorations: 'planets',
    pattern: 'radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)'
  },
  {
    id: 'sunny',
    name: 'Sunny Motivation',
    nameAr: 'قوة الإيجابية',
    icon: Sun,
    gradient: 'from-yellow-300 via-orange-400 to-yellow-300',
    buttonColor: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400',
    textColor: 'text-orange-900',
    accentColor: 'text-orange-600',
    decorations: 'rays',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 70%)'
  },
  {
    id: 'grid',
    name: 'Grid Paper',
    nameAr: 'دفتر الملاحظات',
    icon: Grid,
    gradient: 'from-gray-100 via-slate-200 to-gray-100',
    buttonColor: 'bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-600 hover:to-gray-700',
    textColor: 'text-gray-800',
    accentColor: 'text-slate-600',
    decorations: 'grid',
    pattern: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)'
  },
  {
    id: 'greenery',
    name: 'Minimal Greenery',
    nameAr: 'نباتات الظل',
    icon: Leaf,
    gradient: 'from-emerald-50 via-green-100 to-emerald-50',
    buttonColor: 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600',
    textColor: 'text-green-900',
    accentColor: 'text-green-600',
    decorations: 'leaves',
    pattern: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)'
  },
  {
    id: 'retro',
    name: 'Retro Vibe',
    nameAr: 'ألوان السبعينات',
    icon: Circle,
    gradient: 'from-orange-700 via-yellow-600 to-orange-700',
    buttonColor: 'bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600',
    textColor: 'text-orange-100',
    accentColor: 'text-yellow-300',
    decorations: 'geometric',
    pattern: 'repeating-linear-gradient(45deg, rgba(180, 83, 9, 0.2) 0px, rgba(180, 83, 9, 0.2) 10px, transparent 10px, transparent 20px)'
  },
  {
    id: 'books',
    name: 'Book Journey',
    nameAr: 'رحلة الكتب',
    icon: Book,
    gradient: 'from-amber-100 via-yellow-50 to-amber-100',
    buttonColor: 'bg-gradient-to-r from-amber-700 to-yellow-800 hover:from-amber-600 hover:to-yellow-700',
    textColor: 'text-amber-900',
    accentColor: 'text-amber-700',
    decorations: 'books',
    pattern: 'linear-gradient(90deg, rgba(217, 119, 6, 0.1) 1px, transparent 1px)'
  }
];

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [initialMinutes, setInitialMinutes] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [seconds, setSeconds] = useState(initialMinutes.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    toast({
        title: "⏰ انتهى الوقت!",
        description: "عمل رائع! خذ استراحة مستحقة.",
    });
    if (Notification.permission === "granted") {
        new Notification("⏰ انتهى الوقت!", {
            body: "انتهت جلسة الدراسة. حان وقت الاستراحة!",
        });
    }
  }, [toast]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds <= 0 && isActive) {
        handleTimeUp();
        setSeconds(0);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, seconds, handleTimeUp]);
  
  useEffect(() => {
    if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
  }, []);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setSeconds(initialMinutes[newMode] * 60);
  }

  const toggleTimer = () => {
    if (seconds > 0) {
        setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(initialMinutes[mode] * 60);
  };
  
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, modeToChange: TimerMode) => {
    const newMinutes = parseInt(e.target.value, 10);
    if (!isNaN(newMinutes) && newMinutes > 0) {
        const newInitialMinutes = { ...initialMinutes, [modeToChange]: newMinutes };
        setInitialMinutes(newInitialMinutes);
        if(mode === modeToChange && !isActive) {
            setSeconds(newMinutes * 60);
        }
    }
  };

  const progress = ((initialMinutes[mode] * 60 - seconds) / (initialMinutes[mode] * 60)) * 100;

  const ThemeIcon = currentTheme.icon;

  const renderDecorations = () => {
    const decType = currentTheme.decorations;
    
    if (decType === 'stars') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-200 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      );
    }
    
    if (decType === 'bubbles') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10%',
                width: `${20 + Math.random() * 60}px`,
                height: `${20 + Math.random() * 60}px`,
              }}
              animate={{
                y: [0, -800],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      );
    }
    
    if (decType === 'petals') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-pink-300 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 8,
              }}
            />
          ))}
        </div>
      );
    }
    
    if (decType === 'planets') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30"
            style={{ top: '10%', right: '15%' }}
            animate={{
              y: [0, 20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-red-500 opacity-40"
            style={{ bottom: '15%', left: '10%' }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, -360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 opacity-50"
            style={{ top: '60%', right: '20%' }}
            animate={{
              y: [0, 10, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
          />
        </div>
      );
    }
    
    if (decType === 'rays') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-yellow-300/40 via-transparent to-transparent origin-top"
                style={{
                  transform: `rotate(${i * 30}deg) translateX(-50%)`,
                }}
              />
            ))}
          </motion.div>
        </div>
      );
    }
    
    if (decType === 'leaves') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-600/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              🍃
            </motion.div>
          ))}
        </div>
      );
    }
    
    if (decType === 'geometric') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border-4 border-yellow-600/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      );
    }
    
    if (decType === 'books') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-amber-700/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${30 + Math.random() * 40}px`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            >
              📚
            </motion.div>
          ))}
        </div>
      );
    }
    
    if (decType === 'anime') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              style={{
                left: '100%',
                top: `${Math.random() * 100}%`,
                width: `${100 + Math.random() * 200}px`,
              }}
              animate={{
                x: [0, -1500],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute text-yellow-300"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${15 + Math.random() * 25}px`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      );
    }
    
    if (decType === 'grid') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-slate-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${25 + Math.random() * 35}px`,
              }}
              animate={{
                y: [0, -15, 0],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              📝
            </motion.div>
          ))}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`pencil-${i}`}
              className="absolute text-gray-600/15"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
              animate={{
                rotate: [0, 360],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              ✏️
            </motion.div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn("relative w-full transition-all duration-500", isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen')}>
      <div 
        className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-1000", currentTheme.gradient)}
        style={{ backgroundImage: currentTheme.pattern, backgroundSize: currentTheme.decorations === 'grid' ? '20px 20px' : 'auto' }}
      />
      
      {renderDecorations()}
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30", currentTheme.textColor)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">⚙️ إعدادات المؤقت</h4>
                  <p className="text-sm text-muted-foreground">
                    اضبط أوقات الدراسة والاستراحة
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="pomodoro" className="text-right">دراسة</Label>
                    <Input 
                      id="pomodoro" 
                      type="number" 
                      value={initialMinutes.pomodoro} 
                      onChange={(e) => handleTimeChange(e, 'pomodoro')} 
                      className="col-span-2 h-9" 
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="shortBreak" className="text-right">استراحة قصيرة</Label>
                    <Input 
                      id="shortBreak" 
                      type="number" 
                      value={initialMinutes.shortBreak} 
                      onChange={(e) => handleTimeChange(e, 'shortBreak')} 
                      className="col-span-2 h-9" 
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="longBreak" className="text-right">استراحة طويلة</Label>
                    <Input 
                      id="longBreak" 
                      type="number" 
                      value={initialMinutes.longBreak} 
                      onChange={(e) => handleTimeChange(e, 'longBreak')} 
                      className="col-span-2 h-9" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-bold">🎨 اختر الثيم</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {themes.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <Button
                          key={theme.id}
                          variant={currentTheme.id === theme.id ? 'default' : 'outline'}
                          className="justify-start h-auto py-3 px-3"
                          onClick={() => setCurrentTheme(theme)}
                        >
                          <Icon className="h-4 w-4 mr-2 shrink-0" />
                          <div className="flex flex-col items-start text-xs">
                            <span className="font-semibold">{theme.nameAr}</span>
                            <span className="text-[10px] opacity-70">{theme.name}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={cn("rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30", currentTheme.textColor)}
          >
            {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <div className="flex flex-col items-center gap-8">
            <motion.div
              animate={{ rotate: isActive ? 360 : 0 }}
              transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" }}
              className={cn("p-4 rounded-full backdrop-blur-md bg-white/10", currentTheme.accentColor)}
            >
              <ThemeIcon className="h-12 w-12" />
            </motion.div>

            <div className="text-center space-y-2">
              <h1 className={cn("text-2xl md:text-3xl font-bold", currentTheme.textColor)}>
                {currentTheme.nameAr}
              </h1>
              <p className={cn("text-sm md:text-base opacity-80", currentTheme.textColor)}>
                {currentTheme.name}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant={mode === 'pomodoro' ? 'default' : 'ghost'}
                onClick={() => switchMode('pomodoro')}
                className={cn(
                  "rounded-full backdrop-blur-md",
                  mode === 'pomodoro' ? currentTheme.buttonColor + ' text-white' : 'bg-white/20 hover:bg-white/30 ' + currentTheme.textColor
                )}
              >
                🎯 دراسة
              </Button>
              <Button
                variant={mode === 'shortBreak' ? 'default' : 'ghost'}
                onClick={() => switchMode('shortBreak')}
                className={cn(
                  "rounded-full backdrop-blur-md",
                  mode === 'shortBreak' ? currentTheme.buttonColor + ' text-white' : 'bg-white/20 hover:bg-white/30 ' + currentTheme.textColor
                )}
              >
                ☕ استراحة قصيرة
              </Button>
              <Button
                variant={mode === 'longBreak' ? 'default' : 'ghost'}
                onClick={() => switchMode('longBreak')}
                className={cn(
                  "rounded-full backdrop-blur-md",
                  mode === 'longBreak' ? currentTheme.buttonColor + ' text-white' : 'bg-white/20 hover:bg-white/30 ' + currentTheme.textColor
                )}
              >
                🌴 استراحة طويلة
              </Button>
            </div>

            <motion.div
              className="relative"
              animate={isActive ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      strokeDasharray: '1000',
                      strokeDashoffset: 1000 * (1 - progress / 100),
                    }}
                  />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn("text-center backdrop-blur-xl bg-white/10 rounded-full p-12", currentTheme.textColor)}>
                    <motion.div
                      key={seconds}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn("text-6xl md:text-7xl font-bold tabular-nums", currentTheme.accentColor)}
                    >
                      {formatTime(seconds)}
                    </motion.div>
                    <div className="text-sm md:text-base mt-2 opacity-70">
                      {mode === 'pomodoro' ? '⏱️ وقت الدراسة' : mode === 'shortBreak' ? '☕ استراحة قصيرة' : '🌴 استراحة طويلة'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                disabled={seconds === 0}
                className={cn(
                  "rounded-full h-16 px-8 text-lg font-bold shadow-2xl transform transition-all hover:scale-105",
                  currentTheme.buttonColor,
                  "text-white"
                )}
              >
                {isActive ? (
                  <>
                    <Pause className="h-6 w-6 mr-2" />
                    إيقاف مؤقت
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-2" />
                    ابدأ
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                size="lg"
                variant="ghost"
                className={cn(
                  "rounded-full h-16 w-16 backdrop-blur-md bg-white/20 hover:bg-white/30",
                  currentTheme.textColor
                )}
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className={cn("text-center text-sm", currentTheme.textColor)}
            >
              <p>💡 نصيحة: ركز لمدة {initialMinutes.pomodoro} دقيقة، ثم خذ استراحة!</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
