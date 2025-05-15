import express,{Express} from "express"
import cors from "cors"

// IMPORT ROUTES
import publicRoutes from "@routes/public.routes"
import privateRoutes from "@routes/private.routes"
import { errorMiddleware } from "@/middlewares/error.middleware"
import { authenticateToken } from "@/middlewares/auth.middleware"

export const web:Express = express()

// Top Middleware
web.use(express.json())
web.use(express.urlencoded({extended: true}))
web.use(express.static("public"))
web.use(cors())

// Routes
// ------ Some routes here -------
web.use("/api",publicRoutes)
web.use("/api",authenticateToken,privateRoutes) 

// Bottom Middleware
web.use(errorMiddleware)