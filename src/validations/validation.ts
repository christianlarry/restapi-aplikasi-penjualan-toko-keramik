import { ResponseError } from "@/errors/response.error"
import { ZodSchema } from "zod"

export const validate = <T>(schema:ZodSchema,data:unknown):T =>{
  
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new ResponseError(400, message);
  }

  return result.data as T
}