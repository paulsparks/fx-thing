import { promises } from "node:fs";
import type { NextRequest } from "next/server";
import z, { ZodError } from "zod";
import { graphSchema } from "@/utils/schema";

export async function POST(request: NextRequest) {
	try {
		const requestData = await request.json();
		// Throws an error if it doesn't match the graph schema
		graphSchema.parse(requestData);

		await promises.writeFile(
			"effects.json",
			JSON.stringify(requestData, null, 2),
			"utf-8",
		);

		return new Response(null, { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			const treeError = z.treeifyError(error);

			return Response.json(
				{
					message: "Invalid request data.",
					details: JSON.stringify(treeError),
				},
				{ status: 400 },
			);
		}

		return new Response(null, { status: 500 });
	}
}
