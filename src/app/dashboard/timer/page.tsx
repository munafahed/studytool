
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
type UiStyle = 'classic' | 'fun' | 'focused';

const themeOptions = [
  { value: 'timer-calm-city', label: 'Calm City' },
  { value: 'timer-rainy-day', label: 'Rainy Day' },
  { value: 'timer-cherry-blossom', label: 'Cherry Blossom' },
  { value: 'timer-peaceful-ocean', label: 'Peaceful Ocean' },
];

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [initialMinutes, setInitialMinutes] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [seconds, setSeconds] = useState(initialMinutes.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [theme, setTheme] = useState(themeOptions[0].value);
  const [uiStyle, setUiStyle] = useState<UiStyle>('classic');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    toast({
        title: "Time's up!",
        description: "Great work! Take a well-deserved break.",
    });
    if (Notification.permission === "granted") {
        new Notification("Time's up!", {
            body: "Your study session has finished. Time for a break!",
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
  
  const selectedThemeImage = PlaceHolderImages.find(img => img.id === theme);

  const timerUI = (
     <div className="relative w-full h-full flex flex-col items-center justify-center text-white p-4">
        {selectedThemeImage && (
            <Image
                src={selectedThemeImage.imageUrl}
                alt={selectedThemeImage.description}
                fill
                className="absolute inset-0 -z-10 object-cover brightness-75"
                unoptimized
            />
        )}
        <div className={cn("p-8 rounded-2xl w-full max-w-2xl flex flex-col items-center transition-colors duration-300", 
            uiStyle === 'classic' && "bg-black/20 backdrop-blur-sm",
            uiStyle === 'fun' && "bg-pink-400/20 backdrop-blur-md",
            uiStyle === 'focused' && "bg-gray-900/40 backdrop-blur-lg"
        )}>
            <div className="flex gap-2 mb-8">
                <Button variant={mode === 'pomodoro' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => switchMode('pomodoro')}>Pomodoro</Button>
                <Button variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => switchMode('shortBreak')}>Short Break</Button>
                <Button variant={mode === 'longBreak' ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => switchMode('longBreak')}>Long Break</Button>
            </div>

            <h1 className={cn("text-8xl md:text-9xl font-bold tracking-tighter mb-8",
              uiStyle === 'classic' && "font-sans",
              uiStyle === 'fun' && "font-headline text-yellow-300",
              uiStyle === 'focused' && "font-mono text-cyan-300"
            )}>
                {formatTime(seconds)}
            </h1>

            <div className="flex items-center gap-4">
                <Button 
                    onClick={toggleTimer} 
                    size="lg" 
                    className={cn("rounded-full h-16 w-32 text-2xl transition-all duration-300",
                        uiStyle === 'classic' && "bg-white text-primary hover:bg-gray-200",
                        uiStyle === 'fun' && "bg-yellow-400 text-purple-800 hover:bg-yellow-300 transform hover:scale-110",
                        uiStyle === 'focused' && "bg-cyan-400/90 text-gray-900 hover:bg-cyan-300"
                    )}
                >
                    {isActive ? <Pause /> : <Play />}
                    <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
                </Button>
                <Button onClick={resetTimer} variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-white/20">
                    <RotateCcw className="h-6 w-6" />
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-white/20">
                            <Settings className="h-6 w-6" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Timer Durations</h4>
                                <p className="text-sm text-muted-foreground">
                                Adjust your timer durations in minutes.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="pomodoro">Pomodoro</Label>
                                <Input id="pomodoro" type="number" value={initialMinutes.pomodoro} onChange={(e) => handleTimeChange(e, 'pomodoro')} className="col-span-2 h-8" />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="shortBreak">Short Break</Label>
                                <Input id="shortBreak" type="number" value={initialMinutes.shortBreak} onChange={(e) => handleTimeChange(e, 'shortBreak')} className="col-span-2 h-8" />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="longBreak">Long Break</Label>
                                <Input id="longBreak" type="number" value={initialMinutes.longBreak} onChange={(e) => handleTimeChange(e, 'longBreak')} className="col-span-2 h-8" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Background Theme</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {themeOptions.map(option => (
                                        <Button key={option.value} variant={theme === option.value ? 'secondary' : 'ghost'} onClick={() => setTheme(option.value)}>{option.label}</Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">UI Style</h4>
                                <RadioGroup defaultValue={uiStyle} onValueChange={(value: UiStyle) => setUiStyle(value)} className='grid grid-cols-3 gap-2'>
                                    <div>
                                        <RadioGroupItem value="classic" id="classic" className="sr-only" />
                                        <Label htmlFor="classic" className={cn("block w-full text-center p-2 border rounded-md cursor-pointer", uiStyle === 'classic' && 'bg-secondary text-secondary-foreground')}>
                                            Classic
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="fun" id="fun" className="sr-only" />
                                        <Label htmlFor="fun" className={cn("block w-full text-center p-2 border rounded-md cursor-pointer", uiStyle === 'fun' && 'bg-secondary text-secondary-foreground')}>
                                            Fun
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="focused" id="focused" className="sr-only" />
                                        <Label htmlFor="focused" className={cn("block w-full text-center p-2 border rounded-md cursor-pointer", uiStyle === 'focused' && 'bg-secondary text-secondary-foreground')}>
                                            Focused
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen w-full", isFullScreen ? 'fixed inset-0 bg-background z-50' : 'relative')}>
      <div className="absolute top-4 right-4 z-10">
        {!isFullScreen ? (
            <Button onClick={() => setIsFullScreen(true)} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                <Maximize className="h-5 w-5"/>
                <span className="sr-only">Full Screen</span>
            </Button>
        ) : (
            <Button onClick={() => setIsFullScreen(false)} variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                <Minimize className="h-5 w-5"/>
                <span className="sr-only">Exit Full Screen</span>
            </Button>
        )}
      </div>
      {timerUI}
    </div>
  );
}
