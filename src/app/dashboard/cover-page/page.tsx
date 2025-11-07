"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Upload, FileText, Plus, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCoverPageDocument } from '@/lib/cover-page-generator';
import { detectPrimaryLanguage } from '@/lib/language-utils';
import { correctSpelling } from '@/ai/spell-check-flow';

interface Student {
  name: string;
  id: string;
}

interface CoverPageData {
  projectType: 'individual' | 'group';
  students: Student[];
  college: string;
  major: string;
  courseName: string;
  topicName: string;
  professorName: string;
  submissionDate: string;
  logo: File | null;
}

export default function CoverPageGenerator() {
  const [formData, setFormData] = useState<CoverPageData>({
    projectType: 'individual',
    students: [{ name: '', id: '' }],
    college: '',
    major: '',
    courseName: '',
    topicName: '',
    professorName: '',
    submissionDate: new Date().toISOString().split('T')[0],
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<'ar' | 'en'>('ar');
  const { toast } = useToast();

  useEffect(() => {
    const textData = {
      college: formData.college,
      major: formData.major,
      courseName: formData.courseName,
      topicName: formData.topicName,
      professorName: formData.professorName,
      ...formData.students.reduce((acc, student, i) => ({
        ...acc,
        [`student${i}`]: student.name,
      }), {}),
    };
    const lang = detectPrimaryLanguage(textData);
    setDetectedLanguage(lang);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentChange = (index: number, field: 'name' | 'id', value: string) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map((student, i) =>
        i === index ? { ...student, [field]: value } : student
      ),
    }));
  };

  const addStudent = () => {
    setFormData(prev => ({
      ...prev,
      students: [...prev.students, { name: '', id: '' }],
    }));
  };

  const removeStudent = (index: number) => {
    if (formData.students.length > 1) {
      setFormData(prev => ({
        ...prev,
        students: prev.students.filter((_, i) => i !== index),
      }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: detectedLanguage === 'ar' ? 'خطأ' : 'Error',
          description: detectedLanguage === 'ar' ? 'الرجاء اختيار صورة فقط' : 'Please select an image only',
        });
        return;
      }
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoCorrect = async () => {
    setIsCorrecting(true);
    try {
      const fieldsToCorrect = [
        { key: 'college', value: formData.college },
        { key: 'major', value: formData.major },
        { key: 'courseName', value: formData.courseName },
        { key: 'topicName', value: formData.topicName },
        { key: 'professorName', value: formData.professorName },
      ];

      const corrections: Record<string, string> = {};

      for (const field of fieldsToCorrect) {
        if (field.value.trim()) {
          try {
            const result = await correctSpelling({
              text: field.value,
              language: detectedLanguage,
            });
            corrections[field.key] = result.correctedText;
          } catch (error) {
            console.error(`Error correcting ${field.key}:`, error);
            corrections[field.key] = field.value;
          }
        }
      }

      const correctedStudents = await Promise.all(
        formData.students.map(async (student) => {
          if (student.name.trim()) {
            try {
              const result = await correctSpelling({
                text: student.name,
                language: detectedLanguage,
              });
              return { ...student, name: result.correctedText };
            } catch (error) {
              return student;
            }
          }
          return student;
        })
      );

      setFormData(prev => ({
        ...prev,
        ...corrections,
        students: correctedStudents,
      }));

      toast({
        title: detectedLanguage === 'ar' ? 'تم التصحيح ✓' : 'Corrected ✓',
        description: detectedLanguage === 'ar' 
          ? 'تم تصحيح الأخطاء الإملائية والنحوية بنجاح' 
          : 'Spelling and grammar corrected successfully',
      });
    } catch (error) {
      console.error('Error in auto-correct:', error);
      toast({
        variant: 'destructive',
        title: detectedLanguage === 'ar' ? 'خطأ' : 'Error',
        description: detectedLanguage === 'ar' 
          ? 'حدث خطأ أثناء التصحيح' 
          : 'An error occurred during correction',
      });
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleGenerateDocument = async () => {
    const hasStudentData = formData.students.some(s => s.name.trim());
    if (!hasStudentData || !formData.college || !formData.courseName || !formData.topicName) {
      toast({
        variant: 'destructive',
        title: detectedLanguage === 'ar' ? 'خطأ' : 'Error',
        description: detectedLanguage === 'ar' 
          ? 'الرجاء ملء جميع الحقول المطلوبة' 
          : 'Please fill all required fields',
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateCoverPageDocument(formData, logoPreview, detectedLanguage);
      toast({
        title: detectedLanguage === 'ar' ? 'تم بنجاح! ✓' : 'Success! ✓',
        description: detectedLanguage === 'ar' 
          ? 'تم إنشاء صفحة الغلاف وتحميلها بنجاح' 
          : 'Cover page created and downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating cover page:', error);
      toast({
        variant: 'destructive',
        title: detectedLanguage === 'ar' ? 'خطأ' : 'Error',
        description: detectedLanguage === 'ar' 
          ? 'حدث خطأ أثناء إنشاء صفحة الغلاف' 
          : 'An error occurred while creating the cover page',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const labels = detectedLanguage === 'ar' ? {
    title: 'مولد صفحة الغلاف الأكاديمية',
    description: 'أنشئ صفحة غلاف احترافية لبحثك أو تقريرك الجامعي',
    projectType: 'نوع المشروع',
    individual: 'فردي',
    group: 'مجموعة',
    studentName: 'اسم الطالب',
    studentId: 'الرقم الجامعي',
    college: 'الكلية',
    major: 'التخصص',
    courseName: 'اسم المادة',
    topicName: 'اسم الموضوع / البحث',
    professorName: 'اسم الدكتور',
    submissionDate: 'تاريخ التسليم',
    logo: 'شعار الجامعة (اختياري)',
    uploadLogo: 'رفع الشعار',
    changeLogo: 'تغيير الشعار',
    addStudent: 'إضافة طالب',
    removeStudent: 'حذف',
    autoCorrect: 'تصحيح تلقائي',
    correcting: 'جاري التصحيح...',
    download: 'تحميل صفحة الغلاف (Word)',
    generating: 'جاري الإنشاء...',
    preview: 'معاينة صفحة الغلاف',
    previewDesc: 'هكذا ستظهر صفحة الغلاف',
    course: 'المادة',
    submittedTo: 'مقدم إلى',
    preparedBy: 'إعداد الطالب',
    preparedByGroup: 'إعداد الطلاب',
    student: 'الطالب',
    submissionDateLabel: 'تاريخ التسليم',
  } : {
    title: 'Academic Cover Page Generator',
    description: 'Create a professional cover page for your research or report',
    projectType: 'Project Type',
    individual: 'Individual',
    group: 'Group',
    studentName: 'Student Name',
    studentId: 'Student ID',
    college: 'College',
    major: 'Major',
    courseName: 'Course Name',
    topicName: 'Topic / Research Title',
    professorName: 'Professor Name',
    submissionDate: 'Submission Date',
    logo: 'University Logo (Optional)',
    uploadLogo: 'Upload Logo',
    changeLogo: 'Change Logo',
    addStudent: 'Add Student',
    removeStudent: 'Remove',
    autoCorrect: 'Auto-Correct',
    correcting: 'Correcting...',
    download: 'Download Cover Page (Word)',
    generating: 'Generating...',
    preview: 'Cover Page Preview',
    previewDesc: 'This is how your cover page will look',
    course: 'Course',
    submittedTo: 'Submitted to',
    preparedBy: 'Prepared by',
    preparedByGroup: 'Prepared by',
    student: 'Student',
    submissionDateLabel: 'Submission Date',
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{labels.title}</CardTitle>
            <CardDescription>{labels.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{labels.projectType}</Label>
              <RadioGroup
                value={formData.projectType}
                onValueChange={(value: 'individual' | 'group') => {
                  setFormData(prev => ({
                    ...prev,
                    projectType: value,
                    students: value === 'individual' ? [{ name: '', id: '' }] : prev.students,
                  }));
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer">{labels.individual}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group" className="cursor-pointer">{labels.group}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-4 space-y-4">
              {formData.students.map((student, index) => (
                <div key={index} className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold">
                      {labels.student} {formData.projectType === 'group' ? index + 1 : ''}
                    </Label>
                    {formData.projectType === 'group' && formData.students.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {labels.removeStudent}
                      </Button>
                    )}
                  </div>
                  <Input
                    value={student.name}
                    onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
                    placeholder={detectedLanguage === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                    className={detectedLanguage === 'ar' ? 'text-right' : ''}
                  />
                  <Input
                    value={student.id}
                    onChange={(e) => handleStudentChange(index, 'id', e.target.value)}
                    placeholder={detectedLanguage === 'ar' ? 'أدخل الرقم الجامعي' : 'Enter student ID'}
                    className={detectedLanguage === 'ar' ? 'text-right' : ''}
                  />
                </div>
              ))}
              
              {formData.projectType === 'group' && (
                <Button
                  variant="outline"
                  onClick={addStudent}
                  className="w-full"
                >
                  <Plus className={detectedLanguage === 'ar' ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                  {labels.addStudent}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">{labels.college} *</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                placeholder={detectedLanguage === 'ar' ? 'مثال: كلية الهندسة' : 'Example: College of Engineering'}
                className={detectedLanguage === 'ar' ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">{labels.major}</Label>
              <Input
                id="major"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder={detectedLanguage === 'ar' ? 'مثال: هندسة البرمجيات' : 'Example: Software Engineering'}
                className={detectedLanguage === 'ar' ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">{labels.courseName} *</Label>
              <Input
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder={detectedLanguage === 'ar' ? 'مثال: مقدمة في البرمجة' : 'Example: Introduction to Programming'}
                className={detectedLanguage === 'ar' ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicName">{labels.topicName} *</Label>
              <Input
                id="topicName"
                name="topicName"
                value={formData.topicName}
                onChange={handleInputChange}
                placeholder={detectedLanguage === 'ar' ? 'أدخل عنوان البحث أو التقرير' : 'Enter research or report title'}
                className={detectedLanguage === 'ar' ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professorName">{labels.professorName}</Label>
              <Input
                id="professorName"
                name="professorName"
                value={formData.professorName}
                onChange={handleInputChange}
                placeholder={detectedLanguage === 'ar' ? 'أدخل اسم الدكتور' : 'Enter professor name'}
                className={detectedLanguage === 'ar' ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDate">{labels.submissionDate}</Label>
              <Input
                id="submissionDate"
                name="submissionDate"
                type="date"
                value={formData.submissionDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">{labels.logo}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  className="w-full"
                >
                  <Upload className={detectedLanguage === 'ar' ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                  {formData.logo ? labels.changeLogo : labels.uploadLogo}
                </Button>
              </div>
              {logoPreview && (
                <div className="mt-2 flex justify-center">
                  <img src={logoPreview} alt="Logo preview" className="h-20 object-contain" />
                </div>
              )}
            </div>

            <Button
              onClick={handleAutoCorrect}
              disabled={isCorrecting}
              variant="secondary"
              className="w-full"
            >
              {isCorrecting ? (
                <>
                  <Wand2 className={`${detectedLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                  {labels.correcting}
                </>
              ) : (
                <>
                  <Wand2 className={`${detectedLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {labels.autoCorrect}
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateDocument}
              disabled={isGenerating}
              className="w-full mt-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <FileText className={`${detectedLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4 animate-pulse`} />
                  {labels.generating}
                </>
              ) : (
                <>
                  <Download className={`${detectedLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {labels.download}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{labels.preview}</CardTitle>
            <CardDescription>{labels.previewDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-white min-h-[800px] flex flex-col items-center justify-center text-center space-y-8">
              {logoPreview && (
                <img src={logoPreview} alt="University Logo" className="h-40 object-contain mb-6" />
              )}
              
              {formData.college && (
                <h2 className="text-4xl font-bold text-gray-800">{formData.college}</h2>
              )}
              
              {formData.major && (
                <p className="text-2xl text-gray-600">{formData.major}</p>
              )}
              
              <div className="h-px w-40 bg-gray-400 my-6"></div>
              
              {formData.courseName && (
                <p className="text-3xl font-bold text-gray-700">
                  {labels.course}: {formData.courseName}
                </p>
              )}
              
              {formData.topicName && (
                <h1 className="text-4xl font-bold text-gray-900 mt-10 leading-relaxed">{formData.topicName}</h1>
              )}
              
              <div className="flex-grow"></div>
              
              <div className="space-y-3 text-gray-700 mt-12">
                {formData.professorName && (
                  <p className="text-2xl font-bold">
                    {labels.submittedTo}: {detectedLanguage === 'ar' ? 'د. ' : 'Dr. '}{formData.professorName}
                  </p>
                )}
                
                {formData.projectType === 'individual' ? (
                  <>
                    {formData.students[0]?.name && (
                      <p className="text-2xl">{labels.preparedBy}: {formData.students[0].name}</p>
                    )}
                    {formData.students[0]?.id && (
                      <p className="text-xl text-gray-600">{labels.studentId}: {formData.students[0].id}</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold">{labels.preparedByGroup}:</p>
                    <table className="mx-auto border-collapse border border-gray-400 text-lg">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 px-4 py-2">{labels.studentName}</th>
                          <th className="border border-gray-400 px-4 py-2">{labels.studentId}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.students.filter(s => s.name.trim()).map((student, i) => (
                          <tr key={i}>
                            <td className="border border-gray-400 px-4 py-2">{student.name}</td>
                            <td className="border border-gray-400 px-4 py-2">{student.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {formData.submissionDate && (
                  <p className="text-xl text-gray-600">
                    {labels.submissionDateLabel}: {new Date(formData.submissionDate).toLocaleDateString(
                      detectedLanguage === 'ar' ? 'en-US' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
