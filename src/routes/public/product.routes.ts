import express from "express"
import productController from "@/controllers/product.controller"

const router = express.Router()

router.get("/",productController.getMany)
router.get("/filter-options",productController.getProductFilterOptions)
router.get("/:id",productController.get)

export default router