import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import {
	type NameType,
	type Payload,
	type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { describe, expect, it } from "vitest";
import z from "zod";
import { getTooltipText } from "./helpers";

type TooltipPayload = Payload<ValueType, NameType>;

const pointSchema = z.object({ label: z.string(), value: z.number() });

describe("getTooltipText", () => {
	it("reads the requested key from the first payload", () => {
		expect(
			getTooltipText(
				42,
				[
					mockIncompleteObject<TooltipPayload>({
						payload: { label: "Rent", value: 42 },
					}),
				],
				pointSchema,
				"label",
			),
		).toBe("Rent");
	});

	it("falls back to the raw value when there is no payload", () => {
		expect(getTooltipText(42, [], pointSchema, "label")).toBe("42");
	});
});
