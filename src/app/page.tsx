"use client";
import {
	addEdge,
	Background,
	type Connection,
	Controls,
	type Edge,
	type Node,
	ReactFlow,
	type ReactFlowInstance,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { ContextMenu, type ContextMenuProps } from "@/components/ContextMenu";
import "@xyflow/react/dist/style.css";
import { title } from "radashi";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { BaseNode, type BaseNodeProps } from "@/components/Nodes/BaseNode";
import { Constant } from "@/components/Nodes/Constant";
import { Input } from "@/components/Nodes/Input";
import { Output } from "@/components/Nodes/Output";
import { serializeGraph } from "@/utils/processGraph";
import { graphSchema, ioSchema } from "@/utils/schema";

type MouseEvent = React.MouseEvent;

type NodeComponent = (props: {
	id: string;
	// biome-ignore lint/suspicious/noExplicitAny: Data can be anything.
	data: any;
}) => JSX.Element;

type NodeComponentSchema = BaseNodeProps["data"]["io"];

type ChartNode<ComponentType> = {
	name: string;
	component: ComponentType;
};

type Folder<ComponentType> = {
	name: string;
	contents: (ChartNode<ComponentType> | Folder<ComponentType>)[];
};

// This is where we define the nodes a user can place. Names should be in pascal case.
const nodeOptionsSchema = {
	name: "Base",
	contents: [
		{
			name: "Constant",
			component: Constant,
		},
		{
			name: "TransformAudio",
			contents: [
				{
					name: "AudioToRms",
					component: {
						inputs: [{ name: "input", type: "audio" }],
						outputs: [{ name: "output", type: "number" }],
					},
				},
				{
					name: "AudioToPeak",
					component: {
						inputs: [{ name: "input", type: "audio" }],
						outputs: [{ name: "output", type: "number" }],
					},
				},
			],
		},
		{
			name: "Effects",
			contents: [
				{
					name: "Gain",
					component: {
						inputs: [
							{ name: "input", type: "audio" },
							{ name: "db", type: "number" },
						],
						outputs: [{ name: "output", type: "audio" }],
					},
				},
				{
					name: "Reverb",
					component: {
						inputs: [
							{ name: "input", type: "audio" },
							{ name: "roomSize", type: "number" },
							{ name: "damping", type: "number" },
							{ name: "wetLevel", type: "number" },
							{ name: "dryLevel", type: "number" },
							{ name: "width", type: "number" },
						],
						outputs: [{ name: "output", type: "audio" }],
					},
				},
				{
					name: "Compressor",
					component: {
						inputs: [
							{ name: "input", type: "audio" },
							{ name: "threshold (db)", type: "number" },
							{ name: "ratio (x:1)", type: "number" },
							{ name: "attack (ms)", type: "number" },
							{ name: "release (ms)", type: "number" },
						],
						outputs: [{ name: "output", type: "audio" }],
					},
				},
				{
					name: "HighPass",
					component: {
						inputs: [
							{ name: "input", type: "audio" },
							{ name: "cutoff (hz)", type: "number" },
						],
						outputs: [{ name: "output", type: "audio" }],
					},
				},
				{
					name: "LowPass",
					component: {
						inputs: [
							{ name: "input", type: "audio" },
							{ name: "cutoff (hz)", type: "number" },
						],
						outputs: [{ name: "output", type: "audio" }],
					},
				},
			],
		},
		{
			name: "Math",
			contents: [
				{
					name: "Basic",
					contents: [
						{
							name: "Add",
							component: {
								inputs: [
									{ name: "number 1", type: "number" },
									{ name: "number 2", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Multiply",
							component: {
								inputs: [
									{ name: "number 1", type: "number" },
									{ name: "number 2", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Subtract",
							component: {
								inputs: [
									{ name: "number 1", type: "number" },
									{ name: "number 2", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Divide",
							component: {
								inputs: [
									{ name: "number 1", type: "number" },
									{ name: "number 2", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Exponent",
							component: {
								inputs: [
									{ name: "input", type: "number" },
									{ name: "exponent", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
					],
				},
				{
					name: "Comparison",
					contents: [
						{
							name: "GreaterThan",
							component: {
								inputs: [
									{ name: "this", type: "number" },
									{ name: "isGreaterThan", type: "number" },
								],
								outputs: [{ name: "output", type: "boolean" }],
							},
						},
						{
							name: "LessThan",
							component: {
								inputs: [
									{ name: "this", type: "number" },
									{ name: "isLessThan", type: "number" },
								],
								outputs: [{ name: "output", type: "boolean" }],
							},
						},
					],
				},
				{
					name: "Logic",
					contents: [
						{
							name: "And",
							component: {
								inputs: [
									{ name: "condition 1", type: "boolean" },
									{ name: "condition 2", type: "boolean" },
								],
								outputs: [{ name: "output", type: "boolean" }],
							},
						},
						{
							name: "Or",
							component: {
								inputs: [
									{ name: "condition 1", type: "boolean" },
									{ name: "condition 2", type: "boolean" },
								],
								outputs: [{ name: "output", type: "boolean" }],
							},
						},
						{
							name: "Not",
							component: {
								inputs: [{ name: "condition", type: "boolean" }],
								outputs: [{ name: "output", type: "boolean" }],
							},
						},
					],
				},
				{
					name: "Scaling",
					contents: [
						{
							name: "Normalize",
							component: {
								inputs: [
									{ name: "input", type: "number" },
									{ name: "minimum", type: "number" },
									{ name: "maximum", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Floor",
							component: {
								inputs: [
									{ name: "input", type: "number" },
									{ name: "floor", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
						{
							name: "Ceiling",
							component: {
								inputs: [
									{ name: "input", type: "number" },
									{ name: "ceiling", type: "number" },
								],
								outputs: [{ name: "output", type: "number" }],
							},
						},
					],
				},
			],
		},
	],
} as const satisfies Folder<NodeComponent | NodeComponentSchema>;

function transformFolder(
	folder: Folder<NodeComponent | NodeComponentSchema>,
): Folder<NodeComponent> {
	return {
		name: folder.name,
		contents: folder.contents.map((item) => {
			if ("contents" in item) {
				return transformFolder(item);
			}
			if (
				"component" in item &&
				("inputs" in item.component || "outputs" in item.component)
			) {
				const component = ({ data }: BaseNodeProps) => <BaseNode data={data} />;
				return { name: item.name, component };
			}
			return item as ChartNode<NodeComponent>;
		}),
	};
}

// The same as nodeOptionsSchema, but with the component schemas transformed into components.
const nodeOptions: Folder<NodeComponent> = transformFolder(nodeOptionsSchema);

function extractNodeTypes(
	contents: (Folder<NodeComponent> | ChartNode<NodeComponent>)[],
): Record<string, NodeComponent> {
	return Object.fromEntries(
		contents.flatMap((item) => {
			if ("component" in item) {
				return [[item.name, item.component]];
			}
			if ("contents" in item) {
				return Object.entries(extractNodeTypes(item.contents));
			}
			return [];
		}),
	);
}

const nodeTypes: Record<string, NodeComponent> = {
	...extractNodeTypes(nodeOptions.contents),
	Input,
	Output,
};

type ActionContextMenu = {
	id: string;
	x: number;
	y: number;
} | null;

export const initialNodes = [
	{
		id: "Input",
		position: { x: 300, y: 200 },
		type: "Input",
		data: {
			name: "Input",
			// TODO: Make this have one source of truth.
			io: {
				outputs: [{ name: "output", type: "audio" }],
			},
		},
	},
	{
		id: "Output",
		position: { x: 800, y: 200 },
		type: "Output",
		data: {
			name: "Output",
			// TODO: Make this have one source of truth.
			io: {
				inputs: [{ name: "input", type: "audio" }],
			},
		},
	},
];

const graphKey = "fx-graph";

export default function HomePage() {
	const reactFlow = useReactFlow();
	const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [nodeMenu, setNodeMenu] = useState<ActionContextMenu>(null);
	const [edgeMenu, setEdgeMenu] = useState<ActionContextMenu>(null);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
		Node,
		Edge
	> | null>(null);
	const { setViewport } = useReactFlow();

	const save = useCallback(() => {
		if (rfInstance) {
			const graph = rfInstance.toObject();
			localStorage.setItem(graphKey, JSON.stringify(graph));
		}
	}, [rfInstance]);

	const restore = useCallback(() => {
		const restoreGraph = async () => {
			const graph = localStorage.getItem(graphKey);

			if (!graph) return;

			const graphJson = JSON.parse(graph);

			if (graphJson) {
				const { x = 0, y = 0, zoom = 1 } = graphJson.viewport;
				setNodes(graphJson.nodes || []);
				setEdges(graphJson.edges || []);
				setViewport({ x, y, zoom });
			}
		};

		restoreGraph();
	}, [setNodes, setViewport, setEdges]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want this only on load.
	useEffect(() => {
		restore();
	}, []);

	const onConnect = useCallback(
		(params: Edge | Connection) => {
			setEdges((edges) => {
				const edgeIsOccupied = !!edges.find(
					(edge) =>
						edge.target === params.target &&
						edge.targetHandle === params.targetHandle,
				);

				const targetNodeData = reactFlow.getNode(params.target)?.data;
				const nodeData = reactFlow.getNode(params.source)?.data;

				const targetNodeIo = ioSchema.safeParse(targetNodeData);
				const nodeIo = ioSchema.safeParse(nodeData);

				if (!targetNodeIo.success || !nodeIo.success) {
					return edges;
				}

				const targetNodeType = targetNodeIo.data.io?.inputs?.find((input) => {
					return input.name === params.targetHandle;
				})?.type;
				const nodeType = nodeIo.data.io?.outputs?.find(
					(input) => input.name === params.sourceHandle,
				)?.type;

				const typeMismatch =
					!targetNodeType || !nodeType || targetNodeType !== nodeType;

				if (edgeIsOccupied || typeMismatch) return edges;

				return addEdge(params, edges);
			});
		},
		[setEdges, reactFlow.getNode],
	);

	const addNode = useCallback(
		(e: MouseEvent, node: ChartNode<NodeComponent | NodeComponentSchema>) => {
			const mousePos = reactFlow.screenToFlowPosition({
				x: e.clientX,
				y: e.clientY,
			});
			setNodes((nds) => [
				...nds,
				{
					id: `${node.name}-${uuidv4()}`,
					type: node.name,
					position: mousePos,
					data:
						"inputs" in node.component || "outputs" in node.component
							? { name: node.name, io: node.component }
							: { name: node.name },
				},
			]);
		},
		[reactFlow, setNodes],
	);

	const handleNodeContextMenu = useCallback(
		(e: React.MouseEvent, node: Node) => {
			e.preventDefault();
			e.stopPropagation();

			if (node.id === "Input" || node.id === "Output") return;

			setNodeMenu({ id: node.id, x: e.clientX, y: e.clientY });
		},
		[],
	);
	const handleEdgeContextMenu = useCallback(
		(e: React.MouseEvent, edge: Edge) => {
			e.preventDefault();
			e.stopPropagation();
			setEdgeMenu({ id: edge.id, x: e.clientX, y: e.clientY });
		},
		[],
	);

	const closeNodeMenu = useCallback(() => setNodeMenu(null), []);
	const closeEdgeMenu = useCallback(() => setEdgeMenu(null), []);

	const closeAllMenus = useCallback(() => {
		closeNodeMenu();
		closeEdgeMenu();
	}, [closeNodeMenu, closeEdgeMenu]);

	const breakConnection = useCallback(
		(edgeId: string) => {
			setEdges((eds) => eds.filter((e) => e.id !== edgeId));
			closeEdgeMenu();
		},
		[setEdges, closeEdgeMenu],
	);
	const deleteNode = useCallback(
		(nodeId: string) => {
			setNodes((nds) => nds.filter((n) => n.id !== nodeId));
			setEdges((eds) =>
				eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
			);
			closeNodeMenu();
		},
		[setNodes, setEdges, closeNodeMenu],
	);

	const reset = useCallback(() => {
		setNodes(initialNodes);
		reactFlow.fitView({ padding: 2 });

		if (rfInstance) {
			localStorage.setItem(
				graphKey,
				JSON.stringify({
					nodes: initialNodes,
					edges: [],
					viewport: { x: 0, y: 0, zoom: 1 },
				}),
			);
		}

		toast("Graph has been reset!", { type: "success" });
	}, [setNodes, reactFlow.fitView, rfInstance]);

	const transformNodeOptionsToContextMenu: (
		folder: Folder<NodeComponent | NodeComponentSchema>,
	) => ContextMenuProps["options"] = useCallback(
		(folder) =>
			folder.contents.map((item) => {
				if ("contents" in item) {
					return {
						name: title(item.name),
						submenus: transformNodeOptionsToContextMenu(item),
					};
				}
				return {
					name: title(item.name),
					onClick: (e: MouseEvent) => addNode(e, item),
				};
			}),
		[addNode],
	);

	const options: ContextMenuProps["options"] = useMemo(
		() => transformNodeOptionsToContextMenu(nodeOptionsSchema),
		[transformNodeOptionsToContextMenu],
	);

	const onClickSave = useCallback(async () => {
		save();

		const edges = reactFlow.getEdges();
		const nodes = reactFlow.getNodes();

		const graph = graphSchema.safeParse({ edges, nodes });

		if (graph.error) {
			toast("Error: Invalid graph.", { type: "error" });
			return;
		}

		const serializedGraph = serializeGraph(graph.data);

		const response = await fetch("/api/graph", {
			method: "POST",
			body: JSON.stringify(serializedGraph),
		});

		if (response.ok) {
			toast("Success!", { type: "success" });

			return;
		}

		try {
			const json = await response.json();
			const responseData = z.object({ message: z.string() }).parse(json);

			toast(`Error: ${responseData.message}`, { type: "error" });
		} catch (_) {
			toast("Error: Could not save graph.", { type: "error" });
		}
	}, [reactFlow.getEdges, reactFlow.getNodes, save]);

	return (
		<div className="w-screen h-screen" onClick={closeAllMenus}>
			<ContextMenu options={options} className="w-full h-full">
				<ReactFlow
					nodeTypes={nodeTypes}
					nodes={nodes}
					onNodesChange={onNodesChange}
					edges={edges}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					colorMode="dark"
					onNodeContextMenu={handleNodeContextMenu}
					onEdgeContextMenu={handleEdgeContextMenu}
					onInit={setRfInstance}
					fitView
					fitViewOptions={{ padding: 2 }}
				>
					<Background />
					<Controls />
				</ReactFlow>
			</ContextMenu>

			{nodeMenu && (
				<div
					className="fixed z-50 bg-neutral-800 border border-neutral-600 rounded shadow-lg py-1 min-w-35"
					style={{ left: nodeMenu.x, top: nodeMenu.y }}
					onClick={(e) => e.stopPropagation()}
				>
					<button
						className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-neutral-700"
						onClick={() => deleteNode(nodeMenu.id)}
					>
						Delete
					</button>
				</div>
			)}

			{edgeMenu && (
				<div
					className="fixed z-50 bg-neutral-800 border border-neutral-600 rounded shadow-lg py-1 min-w-35"
					style={{ left: edgeMenu.x, top: edgeMenu.y }}
					onClick={(e) => e.stopPropagation()}
				>
					<button
						className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-neutral-700"
						onClick={() => breakConnection(edgeMenu.id)}
					>
						Break Connection
					</button>
				</div>
			)}

			<div className="absolute bottom-10 right-10 flex gap-4">
				<button onClick={reset} className="btn btn-error">
					Reset
				</button>
				<button onClick={onClickSave} className="btn btn-success">
					Save and Upload
				</button>
			</div>
		</div>
	);
}
