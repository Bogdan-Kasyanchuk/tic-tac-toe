import type { FC } from 'react';

type RadioInputProps = {
    id: string,
    name: string,
    value: string,
    label: string,
    checked: boolean,
    onChange: () => void
};

// Іконка лежить усередині label, тобто не є сусідом input, тому `peer-checked:` не підходить
const RadioInput: FC<RadioInputProps> = ({ id, name, value, label, checked, onChange }) => (
    <div className="group relative leading-6">
        <input
            id={ id }
            type="radio"
            name={ name }
            value={ value }
            checked={ checked }
            className="absolute h-0 w-0 p-0 opacity-0"
            onChange={ onChange }
        />
        <label
            htmlFor={ id }
            className="inline-flex cursor-pointer pl-8 text-lg leading-snug font-semibold uppercase"
        >
            <span className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black after:block after:h-3 after:w-3 after:rounded-full after:bg-black after:opacity-0 after:transition group-has-checked:after:opacity-100" />
            { label }
        </label>
    </div>
);

export default RadioInput;
