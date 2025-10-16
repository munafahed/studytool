
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calculator, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

const gradePoints: { [key: string]: number } = {
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

const gradeOptions = Object.keys(gradePoints);

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

export default function GpaCalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: 'History 101', grade: 'A', credits: '3' },
    { id: 2, name: 'Math 203', grade: 'B+', credits: '4' },
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const { toast } = useToast();

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', grade: 'A', credits: '' }]);
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const handleCourseChange = (id: number, field: keyof Omit<Course, 'id'>, value: string) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  const calculateGpa = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const credits = parseFloat(course.credits);
      if (!isNaN(credits) && credits > 0 && course.grade) {
        totalPoints += gradePoints[course.grade] * credits;
        totalCredits += credits;
      }
    }

    if (totalCredits === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter valid credits for at least one course.',
      });
      setGpa(null);
      return;
    }

    const calculatedGpa = totalPoints / totalCredits;
    setGpa(calculatedGpa);
    toast({
        title: 'GPA Calculated!',
        description: `Your GPA is ${calculatedGpa.toFixed(2)}`,
    });
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">GPA Calculator</CardTitle>
          <CardDescription>Calculate your Grade Point Average based on grades and credits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <AnimatePresence>
                {courses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-end gap-2 p-3 bg-secondary/50 rounded-lg"
                    >
                        <div className="grid gap-1.5 flex-grow">
                            <Label htmlFor={`course-name-${course.id}`}>Course Name (Optional)</Label>
                            <Input
                                id={`course-name-${course.id}`}
                                placeholder={`e.g., Biology 101`}
                                value={course.name}
                                onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-1.5 w-24">
                            <Label htmlFor={`grade-${course.id}`}>Grade</Label>
                             <Select value={course.grade} onValueChange={(value) => handleCourseChange(course.id, 'grade', value)}>
                                <SelectTrigger id={`grade-${course.id}`}>
                                    <SelectValue placeholder="Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5 w-24">
                            <Label htmlFor={`credits-${course.id}`}>Credits</Label>
                            <Input
                                id={`credits-${course.id}`}
                                type="number"
                                placeholder="e.g., 3"
                                value={course.credits}
                                onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)} className="text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
          <Button variant="outline" onClick={addCourse} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Another Course
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={calculateGpa} className="w-full" disabled={courses.length === 0}>
            <Calculator className="mr-2 h-4 w-4" /> Calculate GPA
          </Button>
          {gpa !== null && (
            <div className="w-full text-center pt-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-primary/10 rounded-lg"
                >
                    <Label className="text-sm font-medium text-primary">Your Calculated GPA</Label>
                    <div className="text-4xl font-bold font-headline text-primary mt-1 flex items-center justify-center gap-2">
                        <Sparkles className="h-6 w-6" />
                        {gpa.toFixed(2)}
                        <Sparkles className="h-6 w-6" />
                    </div>
                </motion.div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
