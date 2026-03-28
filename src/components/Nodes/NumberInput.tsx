import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";

export interface NumberInputProps {
	id: string;
	data: {
		name: string;
	};
}

export function NumberInput({ id, data }: NumberInputProps) {
	const { updateNodeData } = useReactFlow();

	// Store as string so empty is allowed
	const [inputValue, setInputValue] = useState("0");

	const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(evt.target.value);
	}, []);

	const onBlur = useCallback(() => {
		// Convert when user leaves the field
		let parsed = parseFloat(inputValue);

		if (Number.isNaN(parsed)) {
			parsed = 0;
		}

		setInputValue(String(parsed));
		updateNodeData(id, { value: parsed });
	}, [inputValue, id, updateNodeData]);

	return (
		<div className="react-flow__node-default nopan selectable draggable flex flex-col gap-4 px-0!">
			<div>{data.name}</div>
			<div className="flex justify-end">
				<div className="flex flex-col gap-1">
					<div className="flex gap-1 w-20">
						<input
							id={`number-${id}`}
							name="number"
							type="number"
							min="0"
							max="255"
							className="nodrag outline-1 outline-overlay-20 p-1 w-full"
							value={inputValue}
							onChange={onChange}
							onBlur={onBlur}
						/>
						<Handle
							type="source"
							className="relative!"
							position={Position.Right}
							id="out"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
