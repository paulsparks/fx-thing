"use client";
import {
	FloatingNode,
	FloatingPortal,
	FloatingTree,
	flip,
	offset,
	safePolygon,
	shift,
	useDismiss,
	useFloating,
	useFloatingNodeId,
	useHover,
	useInteractions,
	useRole,
} from "@floating-ui/react";
import {
	type MouseEventHandler,
	type PropsWithChildren,
	type Ref,
	useCallback,
	useState,
} from "react";

export type Option = {
	name: string;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	submenus?: (Option | { gap: true })[];
};

// Recursive submenu
interface SubmenuProps {
	options: (Option | { gap: true })[];
	label: string;
	onClose?: () => void;
}

function Submenu({ options, label, onClose }: SubmenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const nodeId = useFloatingNodeId();

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "right-start",
		middleware: [offset({ mainAxis: 4, alignmentAxis: -4 }), flip(), shift()],
		nodeId,
	});

	const hover = useHover(context, {
		delay: { open: 75, close: 100 },
		handleClose: safePolygon({ blockPointerEvents: true }),
	});
	const role = useRole(context, { role: "menu" });
	const dismiss = useDismiss(context, { bubbles: true });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		role,
		dismiss,
	]);

	return (
		<FloatingNode id={nodeId}>
			<button
				ref={refs.setReference}
				className="hover:bg-overlay-10 px-4 py-0.5 rounded-sm cursor-pointer w-full text-left flex items-center justify-between gap-4"
				role="menuitem"
				{...getReferenceProps()}
			>
				{label}
				<span className="opacity-60">›</span>
			</button>

			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className="bg-tooltip-background text-white flex flex-col rounded-sm p-1 text-sm outline-1 outline-overlay-20 z-50"
					>
						<MenuItems options={options} onClose={onClose} />
					</div>
				</FloatingPortal>
			)}
		</FloatingNode>
	);
}

// Shared menu item renderer
interface MenuItemsProps {
	options: (Option | { gap: true })[];
	onClose?: () => void;
}

function MenuItems({ options, onClose }: MenuItemsProps) {
	return (
		<>
			{options.map((option, i) => {
				if ("gap" in option) {
					return (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: Good enough
							key={`gap-${i}`}
							className="w-full h-px bg-overlay-10 my-1"
						/>
					);
				}

				if (option.submenus) {
					return (
						<Submenu
							key={option.name}
							label={option.name}
							options={option.submenus}
							onClose={onClose}
						/>
					);
				}

				return (
					<button
						key={option.name}
						className="hover:bg-overlay-10 px-4 py-0.5 rounded-sm cursor-pointer w-full text-left"
						role="menuitem"
						onClick={(e) => {
							option.onClick?.(e);
							onClose?.();
						}}
					>
						{option.name}
					</button>
				);
			})}
		</>
	);
}

// Root context menu
export interface ContextMenuProps extends PropsWithChildren {
	className?: string;
	options?: (Option | { gap: true })[];
	ref?: Ref<HTMLDivElement>;
}

function ContextMenuInner({
	children,
	className,
	options,
	ref,
}: ContextMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const nodeId = useFloatingNodeId();

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "bottom-start",
		nodeId,
		middleware: [flip(), shift()],
	});

	const role = useRole(context, { role: "menu" });
	const dismiss = useDismiss(context, { bubbles: false });
	const { getFloatingProps } = useInteractions([role, dismiss]);

	const handleContextMenu: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			e.preventDefault();
			refs.setPositionReference({
				getBoundingClientRect() {
					return {
						width: 0,
						height: 0,
						x: e.clientX,
						y: e.clientY,
						top: e.clientY,
						right: e.clientX,
						bottom: e.clientY,
						left: e.clientX,
					};
				},
			});
			setIsOpen(true);
		},
		[refs],
	);

	return (
		<FloatingNode id={nodeId}>
			<div onContextMenu={handleContextMenu} className={className} ref={ref}>
				{children}
			</div>

			{isOpen && options && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className="bg-tooltip-background text-white flex flex-col rounded-sm p-1 text-sm outline-1 outline-overlay-20 z-50"
					>
						<MenuItems options={options} onClose={() => setIsOpen(false)} />
					</div>
				</FloatingPortal>
			)}
		</FloatingNode>
	);
}

export function ContextMenu(props: ContextMenuProps) {
	return (
		<FloatingTree>
			<ContextMenuInner {...props} />
		</FloatingTree>
	);
}
