import { db } from "@/application/database"
import { User } from "@/interfaces/user.interface"

export const userModel = ()=>{
  return db.collection<User>("users")
}