import { validationsStrings } from "@/constants/validations.strings"
import {z} from "zod"

export const postProductValidation = z.object({
  name: z.string().min(1, validationsStrings.product.nameRequired),
  description: z.string().optional(),
  type: z.enum(["Lantai", "Dinding"], {
    message: validationsStrings.product.typeRequired
  }),
  design: z.string().min(1, validationsStrings.product.designRequired),
  size_width: z.number().positive(validationsStrings.product.sizeWidthPositive),
  size_height: z.number().positive(validationsStrings.product.sizeHeightPositive),
  color: z.string().min(1, validationsStrings.product.colorRequired),
  finishing: z.string().min(1, validationsStrings.product.finishingRequired),
  texture: z.string().min(1, validationsStrings.product.textureRequired),
  brand: z.string().min(1, validationsStrings.product.brandRequired),
  price: z.number().nonnegative(validationsStrings.product.priceNonNegative),
  is_slip_resistant: z.boolean(),
  is_water_resistant: z.boolean(),
  recommended: z.array(z.string()).optional()
})

export const putProductValidation = postProductValidation

export type PostProduct = z.infer<typeof postProductValidation>
export type PutProduct = z.infer<typeof putProductValidation>