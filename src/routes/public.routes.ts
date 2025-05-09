import express from "express"
import productRoutes from "@routes/public/product.routes"

const router = express.Router()

router.use("/product",productRoutes)

export default router