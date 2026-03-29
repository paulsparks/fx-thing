import {
	Handle,
	Position,
	useNodeConnections,
	useNodesData,
} from "@xyflow/react";

export function ColorPreview() {
	const redConnections = useNodeConnections({
		handleType: "target",
		handleId: "red",
	});
	const redNodeData = useNodesData(redConnections?.[0]?.source);

	const greenConnections = useNodeConnections({
		handleType: "target",
		handleId: "green",
	});
	const greenNodeData = useNodesData(greenConnections?.[0]?.source);

	const blueConnections = useNodeConnections({
		handleType: "target",
		handleId: "blue",
	});
	const blueNodeData = useNodesData(blueConnections?.[0]?.source);

	const color = {
		r: redNodeData?.data ? redNodeData.data.value : 0,
		g: greenNodeData?.data ? greenNodeData.data.value : 0,
		b: blueNodeData?.data ? blueNodeData.data.value : 0,
	};

	return (
		<div
			className="react-flow__node-default nopan selectable draggable flex flex-col gap-4 px-0!"
			style={{
				background: `rgb(${color.r}, ${color.g}, ${color.b})`,
			}}
		>
			<div className="text-left ml-2">
				<Handle
					type="target"
					position={Position.Left}
					id="red"
					className="top-1/6! w-2! h-2!"
				/>
				<label htmlFor="red" className="mix-blend-difference">
					R
				</label>
			</div>
			<div className="text-left ml-2">
				<Handle
					type="target"
					position={Position.Left}
					id="green"
					className="top-1/2! w-2! h-2!"
				/>
				<label htmlFor="green" className="mix-blend-difference">
					G
				</label>
			</div>
			<div className="text-left ml-2">
				<Handle
					type="target"
					position={Position.Left}
					id="blue"
					className="top-5/6! w-2! h-2!"
				/>
				<label htmlFor="red" className="mix-blend-difference">
					B
				</label>
			</div>
		</div>
	);
}
