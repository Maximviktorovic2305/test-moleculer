export type ValidationResult = true | string;

export type FieldValidator<T = unknown> = (value: T) => ValidationResult;
