import { RegisterUserRequest, registerUserValidation } from "@/validations/user.validation"
import { validate } from "@/validations/validation"

const register = async(body:RegisterUserRequest)=>{
  const user = validate<RegisterUserRequest>(registerUserValidation,body)

  // Check apakah username sudah ada
  const findUser = 
}

export default {
  register
}