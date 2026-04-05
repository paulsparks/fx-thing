import type { JSX } from "react";
import type { BaseNodeProps } from "@/components/Nodes/BaseNode";
import type { NODES } from ".";

export type NodeComponent = (props: {
	id: string;
	// biome-ignore lint/suspicious/noExplicitAny: Data can be anything.
	data: any;
}) => JSX.Element;

export type NodeComponentSchema = BaseNodeProps["data"];

export type NodeDefinition =
	| NodeComponent
	| Pick<NodeComponentSchema, "io" | "color">;

export type NodeName = keyof typeof NODES;

export type MenuFolder = {
	[K in NodeName | (string & {})]?: K | MenuFolder;
};
