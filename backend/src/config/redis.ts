import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = createRedisConnection();
  }
  return redisClient;
}

export function createRedisConnection(): Redis {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Check if using Upstash (requires TLS)
  const isUpstash = url.includes('upstash.io');
  
  const options: any = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.log(`Redis retry attempt ${times}, stopping`);
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  };
  
  // Add TLS for Upstash
  if (isUpstash) {
    options.tls = {
      rejectUnauthorized: false
    };
  }
  
  return new Redis(url, options);
}