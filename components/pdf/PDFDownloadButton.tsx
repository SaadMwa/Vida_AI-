'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { QuestionPaperPDFProps } from './QuestionPaperPDF';

export type PDFDownloadButtonProps = QuestionPaperPDFProps & {
  disabled?: boolean;
};

export function PDFDownloadButton({
  assessment,
  schoolName,
  subject,
  grade,
  disabled = false,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!assessment.sections.length) {
      toast.error('No questions to export');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment, schoolName, subject, grade }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'PDF generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assessment.title.replace(/[^\w\s-]/g, '').trim() || 'question-paper'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded!', { id: toastId });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
    >
      {isGenerating ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
      {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
    </button>
  );
}
