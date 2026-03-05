import { unauthorizedError } from "../../utils";

export const resolveRequestUserId = async (
	explicitUserId?: number,
): Promise<number> => {
	if (
		typeof explicitUserId === "number" &&
		Number.isInteger(explicitUserId) &&
		explicitUserId > 0
	) {
		return explicitUserId;
	}

	throw unauthorizedError("Authentication required");
};
