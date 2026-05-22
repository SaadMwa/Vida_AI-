import { Router, Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      gradeLevel,
      totalMarks,
      duration,
      instructions,
      questionTypes,
      additionalInfo,
    } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }

    const assignment = await Assignment.create({
      title,
      subject: subject || '',
      gradeLevel: gradeLevel || '',
      totalMarks: totalMarks ?? 100,
      duration: duration ?? 60,
      instructions: instructions || '',
      questionTypes: questionTypes || [],
      additionalInfo: additionalInfo || '',
      status: 'draft',
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create assignment',
    });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch assignments',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const paper = await GeneratedPaper.findOne({
      assignmentId: req.params.id,
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { assignment, paper: paper || null },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch assignment',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    await GeneratedPaper.deleteMany({ assignmentId: req.params.id });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete assignment',
    });
  }
});

export default router;
