import { FC } from 'react';

import { IRadioInputProps } from 'interfaces';

const RadioInput: FC<IRadioInputProps> = ({ id, checked, name, value, handlerInput, label }) => {
  return (
    <div className='c-radio'>
      <input
        id={id}
        className='c-radio__input'
        type='radio'
        checked={checked}
        name={name}
        value={value}
        onChange={handlerInput}
      />
      <label htmlFor={id} className='c-radio__label'>
        <span className='c-radio__icon' />
        {label}
      </label>
    </div>
  );
};

export default RadioInput;
