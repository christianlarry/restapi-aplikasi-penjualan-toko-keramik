import userController from "@/controllers/user.controller"
import express from "express"

const router = express.Router()

router.post("/login",userController.login)

export default router