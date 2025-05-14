import express from "express"
import uploadController from "@/controllers/upload.controller"
import uploadProductImage from "@/middlewares/uploadProductImage.middleware"

const router = express.Router()

router.post(
  "/product-image",
  uploadProductImage.single("image"),
  uploadController.uploadProductImage)

export default router