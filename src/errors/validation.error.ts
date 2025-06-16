import { ResponseError } from "./response.error";

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ValidationError extends ResponseError {

  public errors: ValidationErrorItem[];

  constructor(errors: ValidationErrorItem[]) {
    super(400, "Validation Error");

    this.errors = errors

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}