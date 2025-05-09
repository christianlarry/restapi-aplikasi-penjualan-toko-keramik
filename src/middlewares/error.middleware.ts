import { ResponseError } from "@/errors/response.error"
import { responseErr } from "@/utils/response"
import { NextFunction, Request, Response } from "express"

export const errorMiddleware = (err:Error, req:Request, res:Response, next:NextFunction) => {
  if (!err) {
    next()
    return
  }

  if (err instanceof ResponseError) {
    responseErr(res,err.status,err.message)
  } else {
    responseErr(res,500,err.message)
  }
}