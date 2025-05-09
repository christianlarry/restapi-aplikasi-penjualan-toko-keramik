import { ResponseError } from "@/errors/response.error"
import { NextFunction, Request, Response } from "express"

export const errorMiddleware = (err:Error, req:Request, res:Response, next:NextFunction) => {
  if (!err) {
    next()
    return
  }

  if (err instanceof ResponseError) {
    res.status(err.status).json({
      errors: err.message
    }).end()
  } else {
    res.status(500).json({
      errors: err.message
    }).end()
  }
}