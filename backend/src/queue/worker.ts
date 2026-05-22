import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import { connectDB } from '../config/db';
import { GENERATION_QUEUE, GenerationJobData } from './generationQueue';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { buildGenerationPrompt } from '../services/promptBuilder';
import { llmService } from '../services/llmService';
import { validateAndNormalizePaper } from '../utils/validatePaper';
import { setJobStatus, updateJobProgress } from '../utils/jobCache';
import { emitToAssignment } from '../socket/emitter';

async function processGeneration(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId, jobId } = job.data;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  await updateJobProgress(jobId, 5, 'Loading assignment', {
    status: 'active',
    assignmentId,
  });
  emitToAssignment(assignmentId, 'generation:progress', {
    jobId,
    progress: 5,
    stage: 'Loading assignment',
  });

  const prompt = buildGenerationPrompt(assignment);

  await updateJobProgress(jobId, 15, 'Building prompt');
  emitToAssignment(assignmentId, 'generation:progress', {
    jobId,
    progress: 15,
    stage: 'Building prompt',
  });

  emitToAssignment(assignmentId, 'generation:started', {
    jobId,
    assignmentId,
    llmAttempting: 'openai',
  });

  await updateJobProgress(jobId, 25, 'Calling AI (OpenAI first)');
  emitToAssignment(assignmentId, 'generation:progress', {
    jobId,
    progress: 25,
    stage: 'Calling AI (OpenAI first)',
  });

  const { data, provider } = await llmService.generateQuestions(
    prompt,
    (from, to, reason) => {
    emitToAssignment(assignmentId, 'generation:fallback', {
      from,
      to,
      reason,
      jobId,
    });
    emitToAssignment(assignmentId, 'generation:progress', {
      jobId,
      progress: 40,
      stage: `Falling back to ${to}`,
    });
  },
    job.data.bypassCache
  );

  await updateJobProgress(jobId, 60, `Parsing response (${provider})`, { llmUsed: provider });
  emitToAssignment(assignmentId, 'generation:progress', {
    jobId,
    progress: 60,
    stage: `Parsing response (${provider})`,
  });

  const { sections, metadata } = validateAndNormalizePaper(data);

  await updateJobProgress(jobId, 80, 'Saving question paper');
  emitToAssignment(assignmentId, 'generation:progress', {
    jobId,
    progress: 80,
    stage: 'Saving question paper',
  });

  await GeneratedPaper.deleteMany({ assignmentId, status: { $in: ['generating', 'failed'] } });

  const paper = await GeneratedPaper.create({
    assignmentId,
    sections,
    metadata,
    status: 'completed',
  });

  assignment.status = 'completed';
  assignment.llmUsed = provider;
  await assignment.save();

  await setJobStatus(jobId, {
    status: 'completed',
    progress: 100,
    stage: 'Generation complete',
    assignmentId,
    paperId: paper._id.toString(),
    llmUsed: provider,
  });

  emitToAssignment(assignmentId, 'generation:completed', {
    jobId,
    assignmentId,
    paperId: paper._id.toString(),
    llmUsed: provider,
  });

  console.log(`Generation complete for ${assignmentId} via ${provider}`);
}

async function startWorker() {
  await connectDB();

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      console.log(`Processing job ${job.id} for assignment ${job.data.assignmentId}`);
      await processGeneration(job);
    },
    {
      connection: createRedisConnection(),
      concurrency: 2,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId, jobId } = job.data;
    console.error(`Job ${jobId} failed:`, err.message);

    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
    await GeneratedPaper.findOneAndUpdate(
      { assignmentId, status: 'generating' },
      { status: 'failed' }
    );

    await setJobStatus(jobId, {
      status: 'failed',
      progress: 0,
      stage: 'Generation failed',
      assignmentId,
      error: err.message,
    });

    emitToAssignment(assignmentId, 'generation:failed', {
      jobId,
      error: err.message,
    });
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  console.log('BullMQ generation worker started');
}

startWorker().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
