import express from "express"
import privateProductRoutes from "@routes/private/product.routes"

const router = express.Router()

router.use("/product",privateProductRoutes)

export default router