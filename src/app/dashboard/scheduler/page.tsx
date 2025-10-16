"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: number;
  title: string;
  dueDate: Date;
}

export default function SchedulerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleAddTask = () => {
    if (newTask.trim() && date) {
      setTasks([...tasks, { id: Date.now(), title: newTask, dueDate: date }]);
      setNewTask('');
      toast({
        title: 'Task Added',
        description: `"${newTask}" has been scheduled.`,
      });
    }
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
        title: 'Task Removed',
        description: `The task has been removed from your schedule.`,
    });
  };

  const sortedTasks = tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Content Scheduler & Reminder</CardTitle>
          <CardDescription>Schedule your tasks and set reminders to stay on track.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-2">
            <div className="flex-grow space-y-2">
              <Label htmlFor="new-task">New Task</Label>
              <Input
                id="new-task"
                placeholder="e.g., Finish history essay"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
                <Label>Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Task</span>
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline">Your Schedule</h3>
            {sortedTasks.length > 0 ? (
                <ul className="space-y-2">
                    {sortedTasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                            <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{format(task.dueDate, "PPP")}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                                <Trash2 className="h-4 w-4 text-red-500"/>
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-muted-foreground py-4">No tasks scheduled yet. Add one above!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
