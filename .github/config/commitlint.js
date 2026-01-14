export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"scope-empty": [2, "never"],
		"subject-case": [
			2,
			"always",
			["lower-case", "sentence-case", "start-case"],
		],
	},
};
