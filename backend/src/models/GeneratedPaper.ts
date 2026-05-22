import mongoose, { Schema, Document, Types } from 'mongoose';

export type QuestionType = 'mcq' | 'short_answer' | 'long_answer';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PaperStatus = 'generating' | 'completed' | 'failed';

export interface IQuestion {
  id: string;
  text: string;
  type: QuestionType;
  marks: number;
  difficulty: Difficulty;
}

export interface ISection {
  id: string;
  title: string;
  instructions: string;
  questions: IQuestion[];
}

export interface IPaperMetadata {
  totalMarks: number;
  totalQuestions: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface IGeneratedPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: ISection[];
  metadata: IPaperMetadata;
  status: PaperStatus;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'long_answer'],
      required: true,
    },
    marks: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
  },
  { _id: false }
);

const sectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    instructions: { type: String, default: '' },
    questions: { type: [questionSchema], default: [] },
  },
  { _id: false }
);

const generatedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    sections: { type: [sectionSchema], default: [] },
    metadata: {
      totalMarks: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      difficultyDistribution: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
      },
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
  },
  { timestamps: true }
);

export const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  'GeneratedPaper',
  generatedPaperSchema
);
