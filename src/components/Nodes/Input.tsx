import { useMemo } from "react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function Input(props: BaseNodeProps) {
	const data: BaseNodeProps["data"] = useMemo(
		() => ({
			name: props.data.name,
			io: {
				outputs: [{ name: "output", type: "audio" }],
			},
			color: "green",
		}),
		[props.data.name],
	);

	return <BaseNode data={data} />;
}
