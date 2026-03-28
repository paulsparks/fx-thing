import { useCallback, useState } from "react";

export interface BooleanInputProps {
	onChange?: (value: boolean) => void;
}

export function BooleanInput({ onChange }: BooleanInputProps) {
	const [checked, setChecked] = useState(false);

	const onCheckboxChange = useCallback(() => {
		setChecked(!checked);
		onChange?.(checked);
	}, [onChange, checked]);

	return (
		<input
			type="checkbox"
			className="nodrag"
			checked={checked}
			onChange={onCheckboxChange}
		/>
	);
}
