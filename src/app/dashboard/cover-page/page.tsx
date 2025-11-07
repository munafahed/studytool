"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCoverPageDocument } from '@/lib/cover-page-generator';

interface CoverPageData {
  studentName: string;
  studentId: string;
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
    studentName: '',
    studentId: '',
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
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'الرجاء اختيار صورة فقط',
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

  const handleGenerateDocument = async () => {
    if (!formData.studentName || !formData.college || !formData.courseName || !formData.topicName) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateCoverPageDocument(formData, logoPreview);
      toast({
        title: 'تم بنجاح! ✓',
        description: 'تم إنشاء صفحة الغلاف وتحميلها بنجاح',
      });
    } catch (error) {
      console.error('Error generating cover page:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء صفحة الغلاف',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">مولد صفحة الغلاف الأكاديمية</CardTitle>
            <CardDescription>أنشئ صفحة غلاف احترافية لبحثك أو تقريرك الجامعي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">اسم الطالب *</Label>
              <Input
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="أدخل اسمك الكامل"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">الرقم الجامعي</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="أدخل رقمك الجامعي"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">الكلية *</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                placeholder="مثال: كلية الهندسة"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">التخصص</Label>
              <Input
                id="major"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder="مثال: هندسة البرمجيات"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">اسم المادة *</Label>
              <Input
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder="مثال: مقدمة في البرمجة"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicName">اسم الموضوع / البحث *</Label>
              <Input
                id="topicName"
                name="topicName"
                value={formData.topicName}
                onChange={handleInputChange}
                placeholder="أدخل عنوان البحث أو التقرير"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professorName">اسم الدكتور</Label>
              <Input
                id="professorName"
                name="professorName"
                value={formData.professorName}
                onChange={handleInputChange}
                placeholder="أدخل اسم الدكتور"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDate">تاريخ التسليم</Label>
              <Input
                id="submissionDate"
                name="submissionDate"
                type="date"
                value={formData.submissionDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">شعار الجامعة (اختياري)</Label>
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
                  <Upload className="ml-2 h-4 w-4" />
                  {formData.logo ? 'تغيير الشعار' : 'رفع الشعار'}
                </Button>
              </div>
              {logoPreview && (
                <div className="mt-2 flex justify-center">
                  <img src={logoPreview} alt="Logo preview" className="h-20 object-contain" />
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerateDocument}
              disabled={isGenerating}
              className="w-full mt-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <FileText className="ml-2 h-4 w-4 animate-pulse" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Download className="ml-2 h-4 w-4" />
                  تحميل صفحة الغلاف (Word)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit sticky top-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl">معاينة صفحة الغلاف</CardTitle>
            <CardDescription>هكذا ستظهر صفحة الغلاف</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white min-h-[600px] flex flex-col items-center justify-center text-center space-y-6">
              {logoPreview && (
                <img src={logoPreview} alt="University Logo" className="h-24 object-contain mb-4" />
              )}
              
              {formData.college && (
                <h2 className="text-2xl font-bold text-gray-800">{formData.college}</h2>
              )}
              
              {formData.major && (
                <p className="text-lg text-gray-600">{formData.major}</p>
              )}
              
              <div className="h-px w-32 bg-gray-300 my-4"></div>
              
              {formData.courseName && (
                <p className="text-xl font-semibold text-gray-700">المادة: {formData.courseName}</p>
              )}
              
              {formData.topicName && (
                <h1 className="text-3xl font-bold text-gray-900 mt-8">{formData.topicName}</h1>
              )}
              
              <div className="flex-grow"></div>
              
              <div className="space-y-2 text-gray-700">
                {formData.professorName && (
                  <p className="text-lg">إشراف: د. {formData.professorName}</p>
                )}
                {formData.studentName && (
                  <p className="text-lg">إعداد الطالب: {formData.studentName}</p>
                )}
                {formData.studentId && (
                  <p className="text-md text-gray-600">الرقم الجامعي: {formData.studentId}</p>
                )}
                {formData.submissionDate && (
                  <p className="text-md text-gray-600">
                    تاريخ التسليم: {new Date(formData.submissionDate).toLocaleDateString('ar-SA')}
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
