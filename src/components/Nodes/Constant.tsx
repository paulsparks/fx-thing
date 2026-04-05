import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { BooleanInput } from "../BooleanInput";
import { NumberInput } from "../NumberInput";
import { TYPE_COLOR_MAP } from "./BaseNode";

export interface ConstantProps {
	id: string;
	data: {
		value?: number | boolean;
	};
}

type InputType = "number" | "boolean";

// TODO: Clean up the outputs/inputs logic.
export function Constant({ id, data }: ConstantProps) {
	const { updateNodeData, setEdges, getNodeConnections } = useReactFlow();
	const [inputType, setInputType] = useState<InputType>(
		data.value ? (typeof data.value as InputType) : "number",
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to set an initial value.
	useEffect(() => {
		if (data.value) {
			updateNodeData(id, {
				value: data.value,
				io: { outputs: [{ name: "output", type: typeof data }] },
			});

			return;
		}
		updateNodeData(id, {
			value: 0,
			io: { outputs: [{ name: "output", type: "number" }] },
		});
	}, []);

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value as InputType;

		setInputType(newType);

		if (newType === "number") {
			updateNodeData(id, {
				value: 0,
				io: { outputs: [{ name: "output", type: "number" }] },
			});
		}
		if (newType === "boolean") {
			updateNodeData(id, {
				value: false,
				io: { outputs: [{ name: "output", type: "boolean" }] },
			});
		}

		const connectedEdges = getNodeConnections({ nodeId: id });
		setEdges((eds) =>
			eds.filter((e) => connectedEdges.find((edge) => e.id !== edge.edgeId)),
		);
	};

	return (
		<div className="react-flow__node-default nopan selectable draggable flex flex-col gap-2 px-0!">
			<div>Constant</div>
			<div className="flex">
				<div className="flex flex-col gap-2 w-full items-center">
					<div className="w-full flex flex-row px-1 gap-1 justify-center items-center">
						<select
							value={inputType}
							onChange={handleTypeChange}
							className="nodrag text-xs border border-overlay-20 p-1 py-0"
						>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
						</select>
						{inputType === "number" ? (
							<NumberInput
								onChange={(value) => {
									updateNodeData(id, { value });
								}}
								initialValue={
									data.value && typeof data.value === "number"
										? data.value
										: undefined
								}
							/>
						) : (
							<BooleanInput
								onChange={(value) => updateNodeData(id, { value })}
								initialValue={
									data.value && typeof data.value === "boolean"
										? data.value
										: undefined
								}
							/>
						)}
					</div>
					<div className="flex gap-1 justify-end self-end">
						<div className="tooltip" data-tip={inputType}>
							<label className={TYPE_COLOR_MAP[inputType]} htmlFor="output">
								{"Output"}
							</label>
						</div>
						<Handle
							type="source"
							className="relative! w-2! h-2!"
							position={Position.Right}
							id="output"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
