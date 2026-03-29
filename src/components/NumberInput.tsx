import { useCallback, useState } from "react";

export interface NumberInputProps {
	onChange?: (value: number) => void;
}

export function NumberInput({ onChange }: NumberInputProps) {
	const [inputValue, setInputValue] = useState("0");

	const onInputChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setInputValue(evt.target.value);
		},
		[],
	);

	const onBlur = useCallback(() => {
		let parsed = parseFloat(inputValue);

		if (Number.isNaN(parsed)) {
			parsed = 0;
		}

		setInputValue(String(parsed));
		onChange?.(parsed);
	}, [inputValue, onChange]);

	return (
		<input
			className="nodrag outline-1 outline-overlay-20 p-1 w-14 h-4"
			value={inputValue}
			onChange={onInputChange}
			onBlur={onBlur}
		/>
	);
}
