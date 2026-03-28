import { Handle, Position } from "@xyflow/react";
import { title } from "radashi";

export type BaseNodeColor = "default" | "green" | "purple";

export interface BaseNodeProps {
	data: {
		name: string;
		io: {
			inputs?: string[];
			outputs?: string[];
		};
		color?: BaseNodeColor;
	};
}

const COLOR_MAP: Record<BaseNodeColor, string> = {
	default: "",
	green: "bg-node-green!",
	purple: "bg-node-purple!",
};

export function BaseNode({
	data: { name, io, color = "default" },
}: BaseNodeProps) {
	return (
		<div
			className={`react-flow__node-default nopan selectable draggable flex flex-col gap-4 px-0! ${COLOR_MAP[color]}`}
		>
			<h1>{title(name)}</h1>
			<div className="flex justify-between">
				{/* Inputs */}
				<div className="flex flex-col gap-1">
					{io.inputs?.map((input) => (
						<div key={input} className="flex gap-1">
							<Handle
								type="target"
								className="relative!"
								position={Position.Left}
								id={input}
							/>
							<label htmlFor={input}>{title(input)}</label>
						</div>
					))}
				</div>
				{/* Outputs */}
				<div className="flex flex-col gap-1">
					{io.outputs?.map((output) => (
						<div key={output} className="flex gap-1">
							<label htmlFor={output}>{title(output)}</label>
							<Handle
								type="source"
								className="relative!"
								position={Position.Right}
								id={output}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
