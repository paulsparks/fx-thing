/** biome-ignore-all lint/style/noNonNullAssertion: There's multiple known assertions in the algorithms used. */

import type { Edge, Node } from "@xyflow/react";
import { pick } from "radashi";

export type NodeType = string;

type FxNode = Pick<Node, "id" | "type" | "data">;
type FxEdge = Pick<Edge, "source" | "sourceHandle" | "target" | "targetHandle">;

export interface FxGraph {
	nodes: FxNode[];
	edges: FxEdge[];
	/** Optional precomputed topological order. Computed at runtime if omitted. */
	processingOrder?: string[];
}

// -------- Topological sort (Kahn's algorithm) --------

/**
 * Returns node IDs in dependency order: every node appears only after
 * all nodes that feed into it have been processed.
 *
 * Throws if a cycle is detected.
 */
export function topoSort(nodes: FxNode[], edges: FxEdge[]): string[] {
	const inDegree: Record<string, number> = {};
	const adj: Record<string, string[]> = {};

	for (const n of nodes) {
		inDegree[n.id] = 0;
		adj[n.id] = [];
	}

	for (const e of edges) {
		adj[e.source].push(e.target);
		inDegree[e.target]++;
	}

	const queue: string[] = nodes
		.filter((n) => inDegree[n.id] === 0)
		.map((n) => n.id);

	const order: string[] = [];

	while (queue.length > 0) {
		const current = queue.shift()!;
		order.push(current);

		for (const neighbor of adj[current]) {
			inDegree[neighbor]--;
			if (inDegree[neighbor] === 0) queue.push(neighbor);
		}
	}

	if (order.length !== nodes.length) {
		throw new Error(
			`Cycle detected in FX graph. Processed ${order.length} of ${nodes.length} nodes.`,
		);
	}

	return order;
}

// -------- Graph serialization --------

/**
 * Resolves the processing order (if not precomputed) and returns the graph
 * as a JSON string ready for the Python processor to consume.
 */
export function serializeGraph(graph: FxGraph): string {
	const processingOrder =
		graph.processingOrder ?? topoSort(graph.nodes, graph.edges);

	graph.nodes = graph.nodes.map((node) => pick(node, ["id", "type", "data"]));
	graph.edges = graph.edges.map((edge) =>
		pick(edge, ["source", "sourceHandle", "target", "targetHandle"]),
	);

	return JSON.stringify({ ...graph, processingOrder }, null, 2);
}
