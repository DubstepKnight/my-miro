import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_REALTIME_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1)
});

export type AppEnv = z.infer<typeof envSchema>;

export function readEnv(env: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(env);
}
