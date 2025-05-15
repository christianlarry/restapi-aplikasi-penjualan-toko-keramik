import express from "express"
import productPublicRoutes from "@routes/public/product.routes"
import userPublicRoutes from "@routes/public/user.routes"

const router = express.Router()

router.use("/product",productPublicRoutes)
router.use("/user",userPublicRoutes)

export default router