import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PaperSection } from '../../lib/api';

export interface QuestionPaperAssessment {
  title: string;
  sections: PaperSection[];
  totalMarks?: number;
  duration?: number;
}

export interface QuestionPaperPDFProps {
  assessment: QuestionPaperAssessment;
  schoolName: string;
  subject: string;
  grade: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  schoolName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
    color: '#374151',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    marginVertical: 10,
  },
  studentInfo: {
    fontSize: 11,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 6,
  },
  sectionInstructions: {
    fontSize: 10,
    marginBottom: 10,
    color: '#4b5563',
  },
  questionItem: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionNumber: {
    width: 22,
    fontSize: 11,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  marks: {
    fontSize: 10,
    color: '#4b5563',
  },
  difficultyBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyEasy: { backgroundColor: '#dcfce7', color: '#15803d' },
  difficultyMedium: { backgroundColor: '#fef9c3', color: '#854d0e' },
  difficultyHard: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 10,
    color: '#6b7280',
  },
  summary: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    color: '#6b7280',
  },
});

function getDifficultyStyle(difficulty: string) {
  if (difficulty === 'easy') return styles.difficultyEasy;
  if (difficulty === 'medium') return styles.difficultyMedium;
  return styles.difficultyHard;
}

export function QuestionPaperPDF({
  assessment,
  schoolName,
  subject,
  grade,
}: QuestionPaperPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.schoolName}>{schoolName}</Text>
        <Text style={styles.title}>{assessment.title}</Text>
        <Text style={styles.meta}>Subject: {subject}</Text>
        <Text style={styles.meta}>Class: {grade}</Text>
        {assessment.totalMarks != null && (
          <Text style={styles.meta}>
            Total Marks: {assessment.totalMarks}
            {assessment.duration != null ? ` · Duration: ${assessment.duration} min` : ''}
          </Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.studentInfo}>Name: _______________________________</Text>
        <Text style={styles.studentInfo}>Roll Number: _________________________</Text>
        <Text style={styles.studentInfo}>Date: _______________________________</Text>

        <View style={styles.divider} />

        {assessment.sections.map((section, idx) => (
          <View key={section.id || idx}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.instructions ? (
              <Text style={styles.sectionInstructions}>{section.instructions}</Text>
            ) : null}

            {section.questions.map((q, qIdx) => (
              <View key={q.id} style={styles.questionItem} wrap={false}>
                <Text style={styles.questionNumber}>{qIdx + 1}.</Text>
                <View style={styles.questionContent}>
                  <Text style={styles.questionText}>{q.text}</Text>
                  <View style={styles.questionMeta}>
                    <Text style={[styles.difficultyBadge, getDifficultyStyle(q.difficulty)]}>
                      {q.difficulty}
                    </Text>
                    <Text style={styles.marks}>({q.marks} marks)</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={styles.footer}>*** End of Question Paper ***</Text>
      </Page>
    </Document>
  );
}
