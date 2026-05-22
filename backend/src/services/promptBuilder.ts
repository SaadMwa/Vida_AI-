import { IAssignment } from '../models/Assignment';

export function buildGenerationPrompt(assignment: IAssignment): string {
  const questionTypesText = assignment.questionTypes
    .map((qt) => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
    .join('\n');

  return `Generate a question paper with the following specifications:
Subject: ${assignment.subject}
Grade: ${assignment.gradeLevel}
Total Marks: ${assignment.totalMarks}
Duration: ${assignment.duration} minutes

Question Types requested:
${questionTypesText || '- Mixed question types as appropriate'}

Instructions: ${assignment.instructions || 'None'}
Additional instructions: ${assignment.additionalInfo || 'None'}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instructions": "Answer all questions",
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "type": "mcq",
          "marks": 2,
          "difficulty": "easy"
        }
      ]
    }
  ],
  "metadata": {
    "totalMarks": ${assignment.totalMarks},
    "totalQuestions": 0,
    "difficultyDistribution": { "easy": 0, "medium": 0, "hard": 0 }
  }
}

Requirements:
- Create exactly 3 sections: Section A, Section B, Section C
- Each question must have: id, text, type (mcq|short_answer|long_answer), marks, difficulty (easy|medium|hard)
- Match the requested question types and counts where possible
- Total marks across all questions should equal ${assignment.totalMarks}
- Update metadata.totalQuestions and difficultyDistribution accurately`;
}
