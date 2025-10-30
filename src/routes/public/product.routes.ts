import express from "express"
import productController from "@/controllers/product.controller"
import { apiGenAIRateLimiter } from "@/middlewares/rateLimiter.middleware"

const router = express.Router()

router.get("/",productController.getMany)
router.get("/filter-options",productController.getProductFilterOptions)
router.get("/:id",productController.get)

router.post("/recommendations", apiGenAIRateLimiter ,productController.recommendProducts)

export default router