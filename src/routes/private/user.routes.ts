import userController from "@/controllers/user.controller"
import express from "express"

const router = express.Router()

router.post("/register",userController.register)

export default router