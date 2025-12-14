import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RESUME_KEY = "resume:text";

export async function saveResumeText(text: string) {
  await redis.set(RESUME_KEY, text);
}

export async function getResumeText(): Promise<string | null> {
  return await redis.get<string>(RESUME_KEY);
}
