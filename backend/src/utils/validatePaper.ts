import { ISection, IPaperMetadata } from '../models/GeneratedPaper';

interface RawQuestion {
  id?: string;
  text?: string;
  type?: string;
  marks?: number;
  difficulty?: string;
}

interface RawSection {
  id?: string;
  title?: string;
  instructions?: string;
  questions?: RawQuestion[];
}

interface RawPaper {
  sections?: RawSection[];
  metadata?: Partial<IPaperMetadata>;
}

const VALID_TYPES = ['mcq', 'short_answer', 'long_answer'] as const;
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

function normalizeType(type: string): (typeof VALID_TYPES)[number] {
  const t = type.toLowerCase().replace(/\s+/g, '_');
  if (VALID_TYPES.includes(t as (typeof VALID_TYPES)[number])) {
    return t as (typeof VALID_TYPES)[number];
  }
  if (t.includes('mcq') || t.includes('multiple')) return 'mcq';
  if (t.includes('long') || t.includes('essay')) return 'long_answer';
  return 'short_answer';
}

function normalizeDifficulty(d: string): (typeof VALID_DIFFICULTIES)[number] {
  const lower = d.toLowerCase();
  if (VALID_DIFFICULTIES.includes(lower as (typeof VALID_DIFFICULTIES)[number])) {
    return lower as (typeof VALID_DIFFICULTIES)[number];
  }
  return 'medium';
}

export function validateAndNormalizePaper(raw: Record<string, unknown>): {
  sections: ISection[];
  metadata: IPaperMetadata;
} {
  const data = raw as RawPaper;
  if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
    throw new Error('Invalid paper: missing sections array');
  }

  const sections: ISection[] = data.sections.map((section, sIdx) => {
    const questions = (section.questions || []).map((q, qIdx) => ({
      id: q.id || `q-${sIdx + 1}-${qIdx + 1}`,
      text: q.text || 'Question text missing',
      type: normalizeType(q.type || 'short_answer'),
      marks: typeof q.marks === 'number' ? q.marks : 1,
      difficulty: normalizeDifficulty(q.difficulty || 'medium'),
    }));

    return {
      id: section.id || `section-${sIdx + 1}`,
      title: section.title || `Section ${String.fromCharCode(65 + sIdx)}`,
      instructions: section.instructions || 'Answer all questions',
      questions,
    };
  });

  let easy = 0;
  let medium = 0;
  let hard = 0;
  let totalMarks = 0;
  let totalQuestions = 0;

  for (const section of sections) {
    for (const q of section.questions) {
      totalQuestions++;
      totalMarks += q.marks;
      if (q.difficulty === 'easy') easy++;
      else if (q.difficulty === 'hard') hard++;
      else medium++;
    }
  }

  const metadata: IPaperMetadata = {
    totalMarks: data.metadata?.totalMarks ?? totalMarks,
    totalQuestions: data.metadata?.totalQuestions ?? totalQuestions,
    difficultyDistribution: data.metadata?.difficultyDistribution ?? {
      easy,
      medium,
      hard,
    },
  };

  return { sections, metadata };
}
