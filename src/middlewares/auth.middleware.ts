import { ResponseError } from "@/errors/response.error"
import { UserJwtPayload } from "@/interfaces/user.interface"
import { checkUserExist } from "@/services/user.service"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || ""

export interface WithUserRequest extends Request{
  user?:UserJwtPayload
}

export const authenticateToken = async (req:Request, _res:Response, next:NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (!token) throw new ResponseError(401,"Unauthorized")
  
    // MENGATASI TOKEN YANG SUDAH DIANGGAP KADALUARSA (SEPERTI TOKEN UNTUK USER YANG SUDAH LOGOUT)
    // const [invalidToken] = await getInvalidAccessTokenByToken(token)
    // if (invalidToken.length != 0 || invalidToken.length === 1) return res.sendStatus(403)
  
    jwt.verify(token, JWT_SECRET, async (err,decoded)=>{
      if (err) throw new ResponseError(403,"Forbidden")

      const isUserExist = await checkUserExist((decoded as UserJwtPayload).username)
      if (!isUserExist) {
        throw new ResponseError(403, "Forbidden")
      }
    
      (req as WithUserRequest).user = decoded as UserJwtPayload
    
      next()
    })

  } catch (err) {
    next(err)
  }
}