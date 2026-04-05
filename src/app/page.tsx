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
	type XYPosition,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { ContextMenu, type ContextMenuProps } from "@/components/ContextMenu";
import "@xyflow/react/dist/style.css";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { serializeGraph } from "@/utils/processGraph";
import { graphSchema, ioSchema } from "@/utils/schema";
import "@/utils/nodes";
import { title } from "radashi";
import { BaseNode } from "@/components/Nodes/BaseNode";
import { NODE_MENU, NODES } from "@/utils/nodes";
import type { MenuFolder, NodeName } from "@/utils/nodes/types";

type MouseEvent = React.MouseEvent;

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
		data: {},
	},
	{
		id: "Output",
		position: { x: 800, y: 200 },
		type: "Output",
		data: {},
	},
];

const nodeTypes = Object.fromEntries(
	Object.entries(NODES).map(([key, value]) =>
		typeof value === "function"
			? [key, value]
			: [
					key,
					({ id }: { id: string }) => (
						<BaseNode id={id} data={{ name: key as NodeName, io: value.io }} />
					),
				],
	),
);

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
		(position: XYPosition, nodeName: NodeName) => {
			setNodes((nds) => [
				...nds,
				{
					id: `${nodeName}-${uuidv4()}`,
					type: nodeName,
					position,
					data: {},
				},
			]);
		},
		[setNodes],
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
		setEdges([]);
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
	}, [setNodes, reactFlow.fitView, rfInstance, setEdges]);

	const menuFolderToContextMenu: (
		folder: MenuFolder,
	) => ContextMenuProps["options"] = useCallback(
		(folder) =>
			Object.entries(folder).map(([key, value]) => {
				if (typeof value === "string") {
					return {
						name: title(key),
						onClick: (e: MouseEvent) => {
							addNode(
								reactFlow.screenToFlowPosition({
									x: e.clientX,
									y: e.clientY,
								}),
								key as NodeName,
							);
						},
					};
				}
				return {
					name: title(key),
					submenus: menuFolderToContextMenu(folder[key] as MenuFolder),
				};
			}),
		[addNode, reactFlow.screenToFlowPosition],
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
			<ContextMenu
				options={menuFolderToContextMenu(NODE_MENU)}
				className="w-full h-full"
			>
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
