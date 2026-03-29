import z from "zod";

export const nodeHandleTypeSchema = z.union([
	z.literal("number"),
	z.literal("boolean"),
	z.literal("audio"),
]);

export const nodeHandleSchema = z.array(
	z.object({
		name: z.string(),
		type: nodeHandleTypeSchema,
	}),
);

export const ioSchema = z.object({
	io: z
		.object({
			inputs: nodeHandleSchema.optional(),
			outputs: nodeHandleSchema.optional(),
		})
		.optional(),
});

export type NodeHandleType = z.infer<typeof nodeHandleTypeSchema>;
export type NodeHandle = z.infer<typeof nodeHandleSchema>;

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
