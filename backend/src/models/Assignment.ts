import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export type AssignmentStatus = 'draft' | 'generating' | 'completed' | 'failed';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  duration: number;
  instructions?: string;
  questionTypes: IQuestionType[];
  additionalInfo?: string;
  status: AssignmentStatus;
  llmUsed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeSchema = new Schema<IQuestionType>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marks: { type: Number, required: true },
  },
  { _id: false }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, default: '' },
    gradeLevel: { type: String, default: '' },
    totalMarks: { type: Number, default: 100 },
    duration: { type: Number, default: 60 },
    instructions: { type: String, default: '' },
    questionTypes: { type: [questionTypeSchema], default: [] },
    additionalInfo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    llmUsed: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
