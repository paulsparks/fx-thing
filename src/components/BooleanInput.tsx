import { useCallback, useState } from "react";

export interface BooleanInputProps {
	onChange?: (value: boolean) => void;
	initialValue?: boolean;
}

export function BooleanInput({
	onChange,
	initialValue = false,
}: BooleanInputProps) {
	const [checked, setChecked] = useState(initialValue);

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
