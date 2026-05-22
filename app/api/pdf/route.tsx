import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import {
  QuestionPaperPDF,
  type QuestionPaperPDFProps,
} from '@/components/pdf/QuestionPaperPDF';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuestionPaperPDFProps;

    if (!body.assessment?.sections?.length) {
      return NextResponse.json({ error: 'No sections to export' }, { status: 400 });
    }

    const buffer = await renderToBuffer(
      <QuestionPaperPDF
        assessment={body.assessment}
        schoolName={body.schoolName}
        subject={body.subject}
        grade={body.grade}
      />
    );

    const filename = `${body.assessment.title.replace(/[^\w\s-]/g, '').trim() || 'question-paper'}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF generation failed' },
      { status: 500 }
    );
  }
}
