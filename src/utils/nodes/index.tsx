import { Constant } from "@/components/Nodes/Constant";
import type { MenuFolder, NodeDefinition } from "./types";

export const NODES = {
	Constant,
	Input: {
		io: {
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Output: {
		io: {
			inputs: [{ name: "input", type: "audio" }],
		},
	},
	SineWave: {
		io: {
			inputs: [
				{ name: "amplitude", type: "number" },
				{ name: "frequency_hz", type: "number" },
			],
			outputs: [
				{ name: "output", type: "audio" },
				{ name: "raw", type: "number" },
			],
		},
	},
	Mixer: {
		io: {
			inputs: [
				{ name: "input_1", type: "audio" },
				{ name: "input_2", type: "audio" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Gain: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "db", type: "number" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Reverb: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "room_size", type: "number" },
				{ name: "damping", type: "number" },
				{ name: "wet_level", type: "number" },
				{ name: "dry_level", type: "number" },
				{ name: "width", type: "number" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Compressor: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "threshold_db", type: "number" },
				{ name: "ratio_x_to_1", type: "number" },
				{ name: "attack_ms", type: "number" },
				{ name: "release_ms", type: "number" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	HighPass: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "cutoff_hz", type: "number" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	LowPass: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "cutoff_hz", type: "number" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Mute: {
		io: {
			inputs: [
				{ name: "input", type: "audio" },
				{ name: "disabled", type: "boolean" },
			],
			outputs: [{ name: "output", type: "audio" }],
		},
	},
	Add: {
		io: {
			inputs: [
				{ name: "number_1", type: "number" },
				{ name: "number_2", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Multiply: {
		io: {
			inputs: [
				{ name: "number_1", type: "number" },
				{ name: "number_2", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Subtract: {
		io: {
			inputs: [
				{ name: "number_1", type: "number" },
				{ name: "number_2", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Divide: {
		io: {
			inputs: [
				{ name: "number_1", type: "number" },
				{ name: "number_2", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Exponent: {
		io: {
			inputs: [
				{ name: "input", type: "number" },
				{ name: "exponent", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	GreaterThan: {
		io: {
			inputs: [
				{ name: "this", type: "number" },
				{ name: "is_greater_than", type: "number" },
			],
			outputs: [{ name: "output", type: "boolean" }],
		},
	},
	LessThan: {
		io: {
			inputs: [
				{ name: "this", type: "number" },
				{ name: "is_less_than", type: "number" },
			],
			outputs: [{ name: "output", type: "boolean" }],
		},
	},
	And: {
		io: {
			inputs: [
				{ name: "condition_1", type: "boolean" },
				{ name: "condition_2", type: "boolean" },
			],
			outputs: [{ name: "output", type: "boolean" }],
		},
	},
	Or: {
		io: {
			inputs: [
				{ name: "condition_1", type: "boolean" },
				{ name: "condition_2", type: "boolean" },
			],
			outputs: [{ name: "output", type: "boolean" }],
		},
	},
	Not: {
		io: {
			inputs: [{ name: "condition", type: "boolean" }],
			outputs: [{ name: "output", type: "boolean" }],
		},
	},
	Normalize: {
		io: {
			inputs: [
				{ name: "input", type: "number" },
				{ name: "minimum", type: "number" },
				{ name: "maximum", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Floor: {
		io: {
			inputs: [
				{ name: "input", type: "number" },
				{ name: "floor", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	Ceiling: {
		io: {
			inputs: [
				{ name: "input", type: "number" },
				{ name: "ceiling", type: "number" },
			],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	AudioToRms: {
		io: {
			inputs: [{ name: "input", type: "audio" }],
			outputs: [{ name: "output", type: "number" }],
		},
	},
	AudioToPeak: {
		io: {
			inputs: [{ name: "input", type: "audio" }],
			outputs: [{ name: "output", type: "number" }],
		},
	},
} as const satisfies Record<string, NodeDefinition>;

export const NODE_MENU = {
	Constant: "Constant",
	SineWave: "SineWave",
	Mixer: "Mixer",
	Effects: {
		Gain: "Gain",
		Reverb: "Reverb",
		Compressor: "Compressor",
		HighPass: "HighPass",
		LowPass: "LowPass",
		Mute: "Mute",
	},
	Math: {
		Basic: {
			Add: "Add",
			Multiply: "Multiply",
			Subtract: "Subtract",
			Divide: "Divide",
			Exponent: "Exponent",
		},
		Comparison: {
			GreaterThan: "GreaterThan",
			LessThan: "LessThan",
		},
		Logic: {
			And: "And",
			Or: "Or",
			Not: "Not",
		},
		Scaling: {
			Normalize: "Normalize",
			Floor: "Floor",
			Ceiling: "Ceiling",
		},
	},
	TransformAudio: {
		AudioToRms: "AudioToRms",
		AudioToPeak: "AudioToPeak",
	},
} as const satisfies MenuFolder;
