import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 100, // maksimal 100 request per windowMs per IP
  message: {
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});