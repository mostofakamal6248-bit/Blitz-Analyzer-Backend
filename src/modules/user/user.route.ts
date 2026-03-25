import { Router } from "express"
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares"
import { userControllers } from "./user.contrller"
import { UserRole } from "../../generated/prisma/enums"

const router = Router()

router.get("/dashboard/kpis",authMiddleware,roleMiddleware([UserRole.USER]), userControllers.getUserKPIReports)


export const userRouter = router