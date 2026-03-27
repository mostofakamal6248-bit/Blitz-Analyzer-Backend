import { Router } from "express"
import { reviewControllers } from "./review.controller"
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares"
import { validateRequest } from "../../middleware/validateRequest"
import { createReviewValidation, queryReviewValidation } from "./review.validation"

const router = Router()

// USER: create review
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["USER"]),
  validateRequest(createReviewValidation),
  reviewControllers.createReview
)

// PUBLIC: get all reviews
router.get(
  "/",
  validateRequest(queryReviewValidation),
  reviewControllers.getReviews
)

// ADMIN: delete review
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  reviewControllers.deleteReview
)

export const reviewRoutes = router