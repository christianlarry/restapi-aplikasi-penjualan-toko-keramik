import { NextFunction, Request, Response } from "express"

const register = async (req:Request,res:Response,next:NextFunction)=>{
  try {
    
  } catch (err) {
    next(err)
  }
}

export default{
  register
}