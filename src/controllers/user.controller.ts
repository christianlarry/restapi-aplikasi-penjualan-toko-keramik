import userService from "@/services/user.service"
import { responseOk } from "@/utils/response"
import { RegisterUserRequest } from "@/validations/user.validation"
import { NextFunction, Request, Response } from "express"

const register = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    // Ambil request body
    const body:RegisterUserRequest = req.body

    const result = await userService.register(body)

    responseOk(res,201,result)

  } catch (err) {
    next(err)
  }
}

export default{
  register
}