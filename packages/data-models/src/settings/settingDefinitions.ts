import z from "zod";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";

export type SettingScope = "database" | "local";

export type SettingsSectionId = "data" | "general" | "providers";

const themeSchema = z.enum(["system", "light", "dark"]);

export const settingKeySchema = z.enum(["displayTheme", "providersHidden"]);

/** Only these keys are accepted by the settings API; internal keys such as the session secret never are. */
export const databaseSettingKeySchema = z.enum(["providersHidden"]);

export type SettingKey = z.infer<typeof settingKeySchema>;

export type DatabaseSettingKey = z.infer<typeof databaseSettingKeySchema>;

interface SettingValues {
	displayTheme: z.infer<typeof themeSchema>;
	providersHidden: z.infer<typeof accountProviderTypeSchema>[];
}

export type SettingValue<K extends SettingKey> = SettingValues[K];

interface SettingDefinition<T> {
	defaultValue: T;
	schema: z.ZodType<T>;
	scope: SettingScope;
	section: SettingsSectionId;
}

type SettingDefinitions = {
	[K in SettingKey]: SettingDefinition<SettingValues[K]>;
};

export const settingDefinitions = {
	displayTheme: {
		defaultValue: "system",
		schema: themeSchema,
		scope: "local",
		section: "general",
	},
	providersHidden: {
		defaultValue: [],
		schema: z.array(accountProviderTypeSchema),
		scope: "database",
		section: "providers",
	},
} satisfies SettingDefinitions;

/** The same definitions, widened so generic code can index them by any `SettingKey`. */
export const getSettingDefinition = <K extends SettingKey>(
	key: K,
): SettingDefinitions[K] => {
	const definitions: SettingDefinitions = settingDefinitions;

	return definitions[key];
};

export const isDatabaseSettingKey = (key: string): key is DatabaseSettingKey =>
	databaseSettingKeySchema.safeParse(key).success;
