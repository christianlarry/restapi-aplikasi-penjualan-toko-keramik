import { ResponseError } from "@/errors/response.error"
import { UserJwtPayload } from "@/interfaces/user.interface"
import { checkUserExist } from "@/services/user.service"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || ""

export const authenticateToken = async (req:Request, _res:Response, next:NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (!token) throw new ResponseError(401,"Unauthorized")
  
    // MENGATASI TOKEN YANG SUDAH DIANGGAP KADALUARSA (SEPERTI TOKEN UNTUK USER YANG SUDAH LOGOUT)
    // const [invalidToken] = await getInvalidAccessTokenByToken(token)
    // if (invalidToken.length != 0 || invalidToken.length === 1) return res.sendStatus(403)
  
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload

    const isUserExist = checkUserExist(decoded.username)
    if (!isUserExist) throw new ResponseError(403, "Forbidden")

    req.user = decoded

    next()

  } catch (err) {
    next(err)
  }
}