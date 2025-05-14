import express from "express"
import productController from "@/controllers/product.controller"

const router = express.Router()

router.post("/",productController.add)
router.put("/:id",productController.update)
router.delete("/:id",productController.remove)

export default router