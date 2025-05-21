import { validationsStrings } from "@/constants/validations.strings"
import { capitalize } from "@/utils/stringFormatter"
import {z} from "zod"

export const postProductValidation = z.object({
  name: z.string().min(1, validationsStrings.product.nameRequired),
  description: z.string().optional(),
  type: z.enum(["Lantai", "Dinding"], {
    message: validationsStrings.product.typeRequired
  }).transform(val=>capitalize(val)),
  design: z.string().min(1, validationsStrings.product.designRequired).transform(val=>capitalize(val)),
  size_width: z.number().positive(validationsStrings.product.sizeWidthPositive),
  size_height: z.number().positive(validationsStrings.product.sizeHeightPositive),
  color: z.string().min(1, validationsStrings.product.colorRequired).transform(val=>capitalize(val)),
  finishing: z.string().min(1, validationsStrings.product.finishingRequired).transform(val=>capitalize(val)),
  texture: z.string().min(1, validationsStrings.product.textureRequired).transform(val=>capitalize(val)),
  brand: z.string().min(1, validationsStrings.product.brandRequired).transform(val=>capitalize(val)),
  price: z.number().nonnegative(validationsStrings.product.priceNonNegative),
  is_slip_resistant: z.boolean(),
  is_water_resistant: z.boolean(),
  recommended: z.array(z.string().transform(val=>capitalize(val))).optional()
})

export const putProductValidation = postProductValidation

export type PostProduct = z.infer<typeof postProductValidation>
export type PutProduct = z.infer<typeof putProductValidation>