import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

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

export async function generateCoverPageDocument(
  data: CoverPageData, 
  logoDataUrl: string | null,
  language: 'ar' | 'en' = 'ar'
) {
  const children: (Paragraph | Table)[] = [];

  const labels = language === 'ar' ? {
    course: 'المادة',
    submittedTo: 'مقدم إلى',
    preparedBy: 'إعداد الطالب',
    preparedByGroup: 'إعداد الطلاب',
    studentName: 'اسم الطالب',
    studentId: 'الرقم الجامعي',
    submissionDate: 'تاريخ التسليم',
    dr: 'د. ',
  } : {
    course: 'Course',
    submittedTo: 'Submitted to',
    preparedBy: 'Prepared by',
    preparedByGroup: 'Prepared by',
    studentName: 'Student Name',
    studentId: 'Student ID',
    submissionDate: 'Submission Date',
    dr: 'Dr. ',
  };

  if (logoDataUrl) {
    try {
      const mimeMatch = logoDataUrl.match(/^data:image\/(\w+);base64,/);
      const imageType = mimeMatch ? mimeMatch[1] : 'png';
      const base64Data = logoDataUrl.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 200,
                height: 200,
              },
              type: imageType === 'jpeg' ? 'jpg' : imageType,
            } as any),
          ],
        })
      );
    } catch (error) {
      console.error('Error processing logo:', error);
    }
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [],
    })
  );

  if (data.college) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: data.college,
            size: 56,
            bold: true,
          }),
        ],
      })
    );
  }

  if (data.major) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 500 },
        children: [
          new TextRun({
            text: data.major,
            size: 40,
            bold: false,
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 300 },
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [],
    })
  );

  if (data.courseName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `${labels.course}: ${data.courseName}`,
            size: 44,
            bold: true,
          }),
        ],
      })
    );
  }

  if (data.topicName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 800, before: 500 },
        children: [
          new TextRun({
            text: data.topicName,
            size: 56,
            bold: true,
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 1000 },
      children: [],
    })
  );

  if (data.professorName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `${labels.submittedTo}: ${labels.dr}${data.professorName}`,
            size: 36,
            bold: true,
          }),
        ],
      })
    );
  }

  if (data.projectType === 'individual') {
    const student = data.students[0];
    if (student?.name) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 250 },
          children: [
            new TextRun({
              text: `${labels.preparedBy}: ${student.name}`,
              size: 36,
            }),
          ],
        })
      );
    }

    if (student?.id) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `${labels.studentId}: ${student.id}`,
              size: 32,
            }),
          ],
        })
      );
    }
  } else {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `${labels.preparedByGroup}:`,
            size: 36,
            bold: true,
          }),
        ],
      })
    );

    const validStudents = data.students.filter(s => s.name.trim());
    
    if (validStudents.length > 0) {
      const table = new Table({
        alignment: AlignmentType.CENTER,
        width: {
          size: 70,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: labels.studentName,
                        size: 32,
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: labels.studentId,
                        size: 32,
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          ...validStudents.map(student => 
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: student.name,
                          size: 28,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: student.id || '',
                          size: 28,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          ),
        ],
      });

      children.push(table);
      
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300, before: 300 },
          children: [],
        })
      );
    }
  }

  if (data.submissionDate) {
    const formattedDate = new Date(data.submissionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `${labels.submissionDate}: ${formattedDate}`,
            size: 32,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${language === 'ar' ? 'صفحة_غلاف' : 'Cover_Page'}_${data.topicName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || (language === 'ar' ? 'بحث' : 'Research')}.docx`;
  saveAs(blob, fileName);
}
