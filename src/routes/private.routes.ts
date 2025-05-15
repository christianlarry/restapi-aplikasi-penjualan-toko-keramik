import express from "express"
import privateProductRoutes from "@routes/private/product.routes"
import privateUploadRoutes from "@routes/private/upload.routes"
import privateUserRoutes from "@routes/private/user.routes"

const router = express.Router()

router.use("/product",privateProductRoutes)
router.use("/upload", privateUploadRoutes)
router.use("/user",privateUserRoutes)

export default router