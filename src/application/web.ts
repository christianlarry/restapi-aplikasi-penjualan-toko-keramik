import express,{Express} from "express"
import cors from "cors"

export const web:Express = express()

// Top Middleware
web.use(express.json())
web.use(express.urlencoded({extended: true}))
web.use(express.static("public"))
web.use(cors())

// Routes
// ------ Some routes here -------

// Bottom Middleware
// web.use(errorMiddleware)