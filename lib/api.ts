const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  duration: number;
  instructions?: string;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  duration: number;
  instructions?: string;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  llmUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'short_answer' | 'long_answer';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PaperSection {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  sections: PaperSection[];
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    difficultyDistribution: { easy: number; medium: number; hard: number };
  };
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
}

export interface JobStatus {
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress: number;
  stage: string;
  assignmentId?: string;
  paperId?: string;
  llmUsed?: string;
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json;
}

export const api = {
  createAssignment: (data: CreateAssignmentInput) =>
    request<{ success: boolean; data: Assignment }>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAssignments: () =>
    request<{ success: boolean; data: Assignment[] }>('/api/assignments'),

  getAssignment: (id: string) =>
    request<{
      success: boolean;
      data: { assignment: Assignment; paper: GeneratedPaper | null };
    }>(`/api/assignments/${id}`),

  deleteAssignment: (id: string) =>
    request<{ success: boolean }>(`/api/assignments/${id}`, { method: 'DELETE' }),

  startGeneration: (assignmentId: string, regenerate = false) =>
    request<{ success: boolean; jobId: string; assignmentId: string }>(
      `/api/generate/${assignmentId}${regenerate ? '?regenerate=true' : ''}`,
      { method: 'POST' }
    ),

  getJobStatus: (jobId: string) =>
    request<{ success: boolean; data: JobStatus }>(`/api/generation/status/${jobId}`),
};
