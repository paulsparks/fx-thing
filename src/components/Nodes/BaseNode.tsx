import { Handle, Position } from "@xyflow/react";
import { title } from "radashi";

export interface BaseNodeProps {
	data: {
		name: string;
		io: {
			inputs?: string[];
			outputs?: string[];
		};
	};
}

export function BaseNode({ data }: BaseNodeProps) {
	return (
		<div className="react-flow__node-default nopan selectable draggable flex flex-col gap-4 px-0!">
			<h1>{data.name}</h1>
			<div className="flex justify-between">
				{/* Inputs */}
				<div className="flex flex-col gap-1">
					{data.io.inputs?.map((input) => (
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
					{data.io.outputs?.map((output) => (
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
