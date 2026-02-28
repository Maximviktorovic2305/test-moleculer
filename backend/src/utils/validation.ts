import { Errors } from "moleculer";
import type { ZodError } from "zod";

const { MoleculerClientError } = Errors;

export const createValidationError = (error: ZodError) => {
	const message = error.issues
		.map((issue) => `${issue.path.join(".") || "field"}: ${issue.message}`)
		.join("; ");
	return new MoleculerClientError(
		message || "Validation error",
		422,
		"VALIDATION_ERROR",
		{
			issues: error.issues,
		},
	);
};

export const assertNumberId = (value: unknown, fieldName = "id") => {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new MoleculerClientError(
			`${fieldName} must be a positive integer`,
			422,
			"VALIDATION_ERROR",
		);
	}
	return parsed;
};
