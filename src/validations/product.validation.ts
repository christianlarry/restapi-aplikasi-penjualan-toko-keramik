import { validationsStrings } from "@/constants/validations.strings"
import { capitalize } from "@/utils/stringFormatter"
import {z} from "zod"

export const postProductValidation = z.object({
  name: z.string().min(1, validationsStrings.product.nameRequired),
  description: z.string().optional(),
  application: z.array(z.string().transform(val=>capitalize(val))).min(1, validationsStrings.product.applicationRequired),
  design: z.string().min(1, validationsStrings.product.designRequired).transform(val=>capitalize(val)),
  sizeWidth: z.number().positive(validationsStrings.product.sizeWidthPositive),
  sizeHeight: z.number().positive(validationsStrings.product.sizeHeightPositive),
  color: z.array(z.string().transform(val=>capitalize(val))).min(1, validationsStrings.product.colorRequired),
  finishing: z.string().min(1, validationsStrings.product.finishingRequired).transform(val=>capitalize(val)),
  texture: z.string().min(1, validationsStrings.product.textureRequired).transform(val=>capitalize(val)),
  brand: z.string().min(1, validationsStrings.product.brandRequired).transform(val=>capitalize(val)),
  price: z.number().nonnegative(validationsStrings.product.priceNonNegative),
  isSlipResistant: z.boolean(),
  isWaterResistant: z.boolean(),
  recommended: z.array(z.string().transform(val=>capitalize(val))).optional()
})

export const putProductValidation = postProductValidation

export type PostProduct = z.infer<typeof postProductValidation>
export type PutProduct = z.infer<typeof putProductValidation>