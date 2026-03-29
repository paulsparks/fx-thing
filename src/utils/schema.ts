import z from "zod";

export const graphSchema = z.object({
	nodes: z.array(
		z.object({
			id: z.string(),
			type: z.string(),
			data: z.record(z.string(), z.unknown()).optional(),
		}),
	),
	edges: z.array(
		z.object({
			source: z.string(),
			sourceHandle: z.string(),
			target: z.string(),
			targetHandle: z.string(),
		}),
	),
	processingOrder: z.array(z.string()).optional(),
});

export type Graph = z.infer<typeof graphSchema>;
