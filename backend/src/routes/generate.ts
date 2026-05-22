import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../queue/generationQueue';
import { getJobStatus, setJobStatus } from '../utils/jobCache';
import { emitToAssignment } from '../socket/io';

const router = Router();

router.post('/generate/:assignmentId', async (req: Request, res: Response) => {
  try {
    const assignmentId = String(req.params.assignmentId);
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const jobId = randomUUID();

    assignment.status = 'generating';
    await assignment.save();

    await setJobStatus(jobId, {
      status: 'queued',
      progress: 0,
      stage: 'Queued for generation',
      assignmentId,
    });

    const bypassCache = req.query.regenerate === 'true';

    await generationQueue.add(
      'generate-paper',
      { assignmentId, jobId, bypassCache },
      { jobId }
    );

    emitToAssignment(assignmentId, 'generation:started', {
      jobId,
      assignmentId,
      llmAttempting: 'openai',
    });

    res.json({ success: true, jobId, assignmentId });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start generation',
    });
  }
});

router.get('/generation/status/:jobId', async (req: Request, res: Response) => {
  try {
    const status = await getJobStatus(String(req.params.jobId));
    if (!status) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to get job status',
    });
  }
});

export default router;
