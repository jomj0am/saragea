import { RateLimiterMemory } from "rate-limiter-flexible";

// Allow 10 requests per 60 seconds per IP
export const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});
