import { z } from "zod"

export const createReviewValidation = z.object({
  reviewText: z
    .string()
    .min(10, "Review must be at least 10 characters"),
  rating: z
    .number()
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5")
})

export const queryReviewValidation = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional()
})