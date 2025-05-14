import express from "express"
import privateProductRoutes from "@routes/private/product.routes"
import privateUploadRoutes from "@routes/private/upload.routes"

const router = express.Router()

router.use("/product",privateProductRoutes)
router.use("/upload", privateUploadRoutes)

export default router