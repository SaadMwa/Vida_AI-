'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Loader2,
  Mic,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api, QuestionTypeInput } from '../../../lib/api';
import { StepProgress } from '../../../components/assignments/create/StepProgress';
import { FileUploadZone } from '../../../components/assignments/create/FileUploadZone';
import {
  QuestionTypeRow,
  type QuestionRowData,
} from '../../../components/assignments/create/QuestionTypeRow';

const DEFAULT_ROWS: QuestionRowData[] = [
  { type: 'mcq', count: 4, marks: 1 },
  { type: 'short_answer', count: 3, marks: 2 },
  { type: 'diagram', count: 5, marks: 5 },
  { type: 'numerical', count: 5, marks: 5 },
];

function formatDueDate(date: string) {
  if (!date) return '';
  const [yyyy, mm, dd] = date.split('-');
  if (!yyyy || !mm || !dd) return date;
  return `${dd}-${mm}-${yyyy}`;
}

export default function CreateAssignment() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [questionTypes, setQuestionTypes] = useState<QuestionRowData[]>(DEFAULT_ROWS);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState(180);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totalQuestions = useMemo(
    () => questionTypes.reduce((sum, r) => sum + r.count, 0),
    [questionTypes]
  );

  const totalMarks = useMemo(
    () => questionTypes.reduce((sum, r) => sum + r.count * r.marks, 0),
    [questionTypes]
  );

  const updateQuestionType = (
    index: number,
    field: keyof QuestionRowData,
    value: string | number
  ) => {
    setQuestionTypes((prev) =>
      prev.map((qt, i) => (i === index ? { ...qt, [field]: value } : qt))
    );
  };

  const addQuestionType = () => {
    setQuestionTypes((prev) => [...prev, { type: 'mcq', count: 1, marks: 1 }]);
  };

  const removeQuestionType = (index: number) => {
    setQuestionTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMicClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Win = window as any;
    const SpeechRecognition = Win.SpeechRecognition || Win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setAdditionalInfo((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => toast.error('Could not capture voice');
    recognition.start();
    toast.success('Listening...', { duration: 2000 });
  };

  const validateStep1 = () => {
    if (!dueDate.trim()) {
      toast.error('Please select a due date');
      return false;
    }
    if (questionTypes.length === 0) {
      toast.error('Add at least one question type');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!title.trim()) {
      toast.error('Please enter an assignment title');
      return false;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return false;
    }
    if (!gradeLevel.trim()) {
      toast.error('Please enter a class / grade');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handlePrevious = () => {
    if (step === 1) router.push('/');
    else setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setSubmitting(true);
    const loadingToast = toast.loading('AI is generating questions...');

    const formattedDueDate = formatDueDate(dueDate);
    const fileNote = uploadedFile ? `\nReference file: ${uploadedFile.name}` : '';
    const dueNote = formattedDueDate ? `Due date: ${formattedDueDate}.` : '';
    const combinedAdditional = [dueNote, additionalInfo, fileNote]
      .filter(Boolean)
      .join('\n')
      .trim();

    const apiQuestionTypes: QuestionTypeInput[] = questionTypes.map((q) => ({
      type: q.type,
      count: q.count,
      marks: q.marks,
    }));

    try {
      const createRes = await api.createAssignment({
        title,
        subject,
        gradeLevel,
        totalMarks,
        duration,
        instructions: formattedDueDate ? `Due Date: ${formattedDueDate}` : '',
        questionTypes: apiQuestionTypes,
        additionalInfo: combinedAdditional,
      });

      toast.success('Assignment created successfully!', { id: loadingToast });
      const assignmentId = createRes.data._id;
      await api.startGeneration(assignmentId);
      router.push(`/assignments/${assignmentId}/output`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create assignment';
      toast.dismiss(loadingToast);
      toast.error('Generation failed. Please try again.');
      console.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col w-full min-w-0 min-h-0 bg-gradient-to-b from-[#ececec] via-[#e8e8e8] to-[#e0e0e0] rounded-2xl items-center py-8 md:py-10 px-2 sm:px-4">
      <StepProgress currentStep={step} totalSteps={2} />

      <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-sm border border-gray-100/80 px-6 sm:px-10 py-8 sm:py-10">
        {step === 1 ? (
          <>
            <header className="mb-8">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Assignment Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Basic information about your assignment
              </p>
            </header>

            <div className="space-y-8">
              <FileUploadZone file={uploadedFile} onFileChange={setUploadedFile} />

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <Calendar
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_140px_140px] gap-4 mb-3 pr-10">
                  <p className="text-xs font-semibold text-gray-500">Question Type</p>
                  <p className="text-xs font-semibold text-gray-500">No. of Questions</p>
                  <p className="text-xs font-semibold text-gray-500">Marks</p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {questionTypes.map((row, index) => (
                    <QuestionTypeRow
                      key={index}
                      row={row}
                      index={index}
                      onChange={updateQuestionType}
                      onRemove={removeQuestionType}
                      canRemove={questionTypes.length > 1}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestionType}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition"
                >
                  <Plus size={16} />
                  Add Question Type
                </button>

                <div className="flex flex-col items-end gap-1 mt-6 text-sm font-semibold text-gray-900">
                  <p>Total Questions : {totalQuestions}</p>
                  <p>Total Marks : {totalMarks}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Additional Information{' '}
                  <span className="font-normal text-gray-500">(For better output)</span>
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    rows={5}
                    className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 px-4 py-4 pr-12 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:border-gray-300 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    aria-label="Voice input"
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Assignment Info
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Title and subject for your question paper
              </p>
            </header>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Unit Test - Chapter 5"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Science"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Class</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="8th"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Exam Duration (minutes)
                </label>
                <input
                  type="number"
                  min={30}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-semibold text-gray-800">Summary:</span> {totalQuestions}{' '}
                  questions · {totalMarks} marks
                  {dueDate ? ` · Due ${formatDueDate(dueDate)}` : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8 w-full max-w-3xl">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
        >
          <ArrowLeft size={18} />
          Previous
        </button>

        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition shadow-sm"
          >
            Next
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-50 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Create & Generate
                <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
