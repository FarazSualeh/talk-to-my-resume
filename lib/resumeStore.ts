import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const RESUME_KEY = "resume:text";

export async function saveResumeText(text: string) {
  await redis.set(RESUME_KEY, text);
}

export async function getResumeText(): Promise<string | null> {
  return await redis.get<string>(RESUME_KEY);
}
