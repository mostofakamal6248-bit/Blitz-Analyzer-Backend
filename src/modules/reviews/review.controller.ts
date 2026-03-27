import { Request, Response } from "express"
import { asyncHandler } from "../../utils/asyncHandler"
import { sendSuccess } from "../../utils/apiResponse"
import { reviewServices } from "./review.service"
import { AppError } from "../../utils/AppError"



const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.user

  if (!user) throw new AppError("Unauthorized", 401)

  const data = await reviewServices.createReview(user.id, req.body)

  return sendSuccess(res, {
    statusCode: 201,
    message: "Review created successfully",
    data
  })
})

const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewServices.getAllReviews(req.query)

  return sendSuccess(res, {
    statusCode: 200,
    message: "Reviews fetched successfully",
    ...result
  })
})

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const data = await reviewServices.deleteReview(id as string)

  return sendSuccess(res, {
    statusCode: 200,
    message: "Review deleted successfully",
    data
  })
})

export const reviewControllers = {
  createReview,
  getReviews,
  deleteReview
}