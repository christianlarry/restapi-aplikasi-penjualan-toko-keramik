import { db } from "@/application/database"
import { messages } from "@/constants/messages.strings"
import { ResponseError } from "@/errors/response.error"
import { User, UserJwtPayload } from "@/interfaces/user.interface"
import { LoginUserRequest, loginUserValidation, RegisterUserRequest, registerUserValidation } from "@/validations/user.validation"
import { validate } from "@/validations/validation"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET:string = process.env.JWT_SECRET || ""

const getUsersCollection = ()=>{
  return db.collection<User>("users")
}
export const checkUserExist = async (username:string):Promise<boolean>=>{
  const userExist = await getUsersCollection().findOne({username: username})

  return !!userExist
}

const register = async(body:RegisterUserRequest)=>{
  const creds = validate<RegisterUserRequest>(registerUserValidation,body)

  // Check apakah username sudah ada
  const isUserExist = await checkUserExist(creds.username)
  if(isUserExist) throw new ResponseError(400,messages.user.usernameExist)
  
  // Hash password menggunakan bcrypt
  const hashedPassword = await bcrypt.hash(creds.password,10)

  // Simpan user ke database
  const result = await getUsersCollection().insertOne({
    firstName: creds.firstName,
    lastName: creds.lastName,
    username: creds.username,
    password: hashedPassword,
    role: creds.role,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return{
    _id: result.insertedId,
    ...creds
  }
}

const login = async (body:LoginUserRequest)=>{
  const creds = validate<LoginUserRequest>(loginUserValidation,body)

  // Cek user exists dan get user data
  const user = await getUsersCollection().findOne({username: creds.username})
  if(!user) throw new ResponseError(400,messages.user.notFound)

  // Cek apakah pass valid
  const isValidPassword = await bcrypt.compare(creds.password,user.password)

  if(!isValidPassword) throw new ResponseError(400, messages.user.wrongPassword)
  
  // Payload jwt
  const payload:UserJwtPayload = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    role: user.role
  }

  // Generate JWT Token
  const secret:string = JWT_SECRET;
  const expiresIn = 60 * 60 * 1; // Satu jam

  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn
  });

  return {
    token
  }
}

export default {
  register,
  login
}