import express from "express"
import productPublicRoutes from "@routes/public/product.routes"

const router = express.Router()

router.use("/product",productPublicRoutes)

export default router