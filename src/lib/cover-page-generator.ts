import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, ImageRun, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';

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

export async function generateCoverPageDocument(data: CoverPageData, logoDataUrl: string | null) {
  const children: Paragraph[] = [];

  if (logoDataUrl) {
    try {
      const mimeMatch = logoDataUrl.match(/^data:image\/(\w+);base64,/);
      const imageType = mimeMatch ? mimeMatch[1] : 'png';
      const base64Data = logoDataUrl.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: {
                width: 120,
                height: 120,
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
        text: data.college,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (data.major) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: data.major,
            size: 28,
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
          style: "single",
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
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `المادة: ${data.courseName}`,
            size: 32,
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
        spacing: { after: 600, before: 400 },
        children: [
          new TextRun({
            text: data.topicName,
            size: 40,
            bold: true,
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 800 },
      children: [],
    })
  );

  if (data.professorName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `إشراف: د. ${data.professorName}`,
            size: 28,
          }),
        ],
      })
    );
  }

  if (data.studentName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `إعداد الطالب: ${data.studentName}`,
            size: 28,
          }),
        ],
      })
    );
  }

  if (data.studentId) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `الرقم الجامعي: ${data.studentId}`,
            size: 24,
          }),
        ],
      })
    );
  }

  if (data.submissionDate) {
    const formattedDate = new Date(data.submissionDate).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `تاريخ التسليم: ${formattedDate}`,
            size: 24,
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
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `صفحة_غلاف_${data.topicName || 'بحث'}.docx`;
  saveAs(blob, fileName);
}
