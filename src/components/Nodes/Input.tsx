import { useMemo } from "react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function Input(props: BaseNodeProps) {
	const io: BaseNodeProps["data"]["io"] = useMemo(
		() => ({
			outputs: ["output"],
		}),
		[],
	);

	return <BaseNode data={{ name: props.data.name, io }} />;
}
