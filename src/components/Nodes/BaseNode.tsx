import { Handle, Position, useReactFlow } from "@xyflow/react";
import { title } from "radashi";
import { useEffect } from "react";
import { NODES } from "@/utils/nodes";
import type { NodeName } from "@/utils/nodes/types";
import type { NodeHandleType } from "@/utils/schema";

export type BaseNodeColor = "default" | "green" | "purple";

export interface BaseNodeProps {
	id: string;
	data: {
		name: NodeName;
		io: {
			inputs?: { name: string; type: NodeHandleType }[];
			outputs?: { name: string; type: NodeHandleType }[];
		};
		color?: BaseNodeColor;
	};
}

export const COLOR_MAP: Record<BaseNodeColor, string> = {
	default: "",
	green: "bg-node-green!",
	purple: "bg-node-purple!",
};

export const TYPE_COLOR_MAP: Record<NodeHandleType, string> = {
	audio: "text-orange-300",
	number: "text-blue-300",
	boolean: "text-green-300",
};

export function BaseNode({ id, data }: BaseNodeProps) {
	const { name, io, color = "default" } = data;
	const { updateNodeData } = useReactFlow();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Sync the data on first render.
	useEffect(() => {
		const node = NODES[name];

		updateNodeData(
			id,
			typeof node === "function" ? { name } : { name, io: node.io },
		);
	}, []);

	return (
		<div
			className={`react-flow__node-default nopan selectable draggable flex flex-col gap-4 px-0! ${COLOR_MAP[color]}`}
		>
			<h1>{title(name)}</h1>
			<div className="flex justify-between">
				{/* Inputs */}
				<div className="flex flex-col gap-1">
					{io.inputs?.map((input) => (
						<div key={input.name} className="flex gap-1">
							<Handle
								type="target"
								className="relative! w-2! h-2!"
								position={Position.Left}
								id={input.name}
							/>
							<div className="tooltip" data-tip={input.type}>
								<label
									className={TYPE_COLOR_MAP[input.type]}
									htmlFor={input.name}
								>
									{input.name}
								</label>
							</div>
						</div>
					))}
				</div>
				{/* Outputs */}
				<div className="flex flex-col gap-1 items-end">
					{io.outputs?.map((output) => (
						<div key={output.name} className="flex gap-1">
							<div className="tooltip" data-tip={output.type}>
								<label
									className={TYPE_COLOR_MAP[output.type]}
									htmlFor={output.name}
								>
									{output.name}
								</label>
							</div>
							<Handle
								type="source"
								className="relative! w-2! h-2!"
								position={Position.Right}
								id={output.name}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
