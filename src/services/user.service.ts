import { db } from "@/application/database"
import { messages } from "@/constants/messages.strings"
import { ResponseError } from "@/errors/response.error"
import { User } from "@/interfaces/user.interface"
import { RegisterUserRequest, registerUserValidation } from "@/validations/user.validation"
import { validate } from "@/validations/validation"
import bcrypt from "bcrypt"

const getUsersCollection = ()=>{
  return db.collection<User>("users")
}

const register = async(body:RegisterUserRequest)=>{
  const user = validate<RegisterUserRequest>(registerUserValidation,body)

  // Check apakah username sudah ada
  const userExist = await getUsersCollection().findOne({username: user.username})
  
  if(userExist) throw new ResponseError(400,messages.user.usernameExist)
  
  // Hash password menggunakan bcrypt
  const hashedPassword = await bcrypt.hash(user.password,10)

  // Simpan user ke database
  const result = await getUsersCollection().insertOne({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    password: hashedPassword,
    role: user.role,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return{
    _id: result.insertedId,
    ...user
  }
}

export default {
  register
}