import { useCallback, useState } from "react";

export interface BooleanInputProps {
	onChange?: (value: boolean) => void;
}

export function BooleanInput({ onChange }: BooleanInputProps) {
	const [checked, setChecked] = useState(false);

	const onCheckboxChange = useCallback(() => {
		const newValue = !checked;
		setChecked(newValue);
		onChange?.(newValue);
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
