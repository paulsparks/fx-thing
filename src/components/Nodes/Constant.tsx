import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { BooleanInput } from "../BooleanInput";
import { NumberInput } from "../NumberInput";

export interface ConstantProps {
	id: string;
	data: {
		name: string;
	};
}

type InputType = "number" | "boolean";

export function Constant({ id, data }: ConstantProps) {
	const { updateNodeData } = useReactFlow();
	const [inputType, setInputType] = useState<InputType>("number");

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to set an initial value.
	useEffect(() => {
		updateNodeData(id, { value: 0 });
	}, []);

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newType = e.target.value as InputType;

		setInputType(newType);

		if (newType === "number") {
			updateNodeData(id, { value: 0 });
		}
		if (newType === "boolean") {
			updateNodeData(id, { value: false });
		}
	};

	return (
		<div className="react-flow__node-default nopan selectable draggable flex flex-col gap-2 px-0!">
			<div>{data.name}</div>
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
								onChange={(value) => updateNodeData(id, { value })}
							/>
						) : (
							<BooleanInput
								onChange={(value) => updateNodeData(id, { value })}
							/>
						)}
					</div>
					<div className="flex gap-1 justify-end self-end">
						<label htmlFor="output">{"Output"}</label>
						<Handle
							type="source"
							className="relative!"
							position={Position.Right}
							id="output"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
