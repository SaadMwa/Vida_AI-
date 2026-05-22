import { getRedis } from '../config/redis';

export interface JobStatus {
  status: 'queued' | 'active' | 'completed' | 'failed';
  progress: number;
  stage: string;
  assignmentId?: string;
  paperId?: string;
  llmUsed?: string;
  error?: string;
}

const JOB_TTL_SECONDS = 3600;

export async function setJobStatus(jobId: string, status: JobStatus): Promise<void> {
  const redis = getRedis();
  await redis.setex(`job:${jobId}`, JOB_TTL_SECONDS, JSON.stringify(status));
}

export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  const redis = getRedis();
  const data = await redis.get(`job:${jobId}`);
  if (!data) return null;
  return JSON.parse(data) as JobStatus;
}

export async function updateJobProgress(
  jobId: string,
  progress: number,
  stage: string,
  extra?: Partial<JobStatus>
): Promise<void> {
  const existing = (await getJobStatus(jobId)) || {
    status: 'active' as const,
    progress: 0,
    stage: '',
  };
  await setJobStatus(jobId, {
    ...existing,
    ...extra,
    progress,
    stage,
    status: extra?.status || existing.status,
  });
}
