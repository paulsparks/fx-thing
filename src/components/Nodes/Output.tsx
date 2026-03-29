import { useMemo } from "react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function Output(props: BaseNodeProps) {
	const data: BaseNodeProps["data"] = useMemo(
		() => ({
			name: props.data.name,
			io: {
				inputs: [{ name: "input", type: "audio" }],
			},
			color: "purple",
		}),
		[props.data.name],
	);

	return <BaseNode data={data} />;
}
