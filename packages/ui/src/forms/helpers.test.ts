import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { describe, expect, it } from "vitest";
import { buildFormData } from "./helpers";

describe("buildFormData", () => {
	it("serializes values and skips missing ones", () => {
		const file = new File(["a,b"], "upload.csv");

		const formData = buildFormData({
			count: 3,
			file,
			isValidationOnly: true,
			missing: dangerouslyCoerceType<string>(undefined),
			name: "Checking",
		});

		expect([...formData.keys()]).toEqual([
			"count",
			"file",
			"isValidationOnly",
			"name",
		]);
		expect(formData.get("count")).toBe("3");
		expect(formData.get("file")).toBeInstanceOf(File);
		expect(formData.get("isValidationOnly")).toBe("true");
		expect(formData.get("name")).toBe("Checking");
	});
});
