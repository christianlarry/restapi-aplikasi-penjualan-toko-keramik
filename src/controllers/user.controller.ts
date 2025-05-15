import userService from "@/services/user.service"
import { responseOk } from "@/utils/response"
import { LoginUserRequest, RegisterUserRequest } from "@/validations/user.validation"
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

const login = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    const body:LoginUserRequest = req.body

    const result = await userService.login(body)

    responseOk(res,200,result)
  } catch (err) {
    next(err)
  }
}

export default{
  register,
  login
}