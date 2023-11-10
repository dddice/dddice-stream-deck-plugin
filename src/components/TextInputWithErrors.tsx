/** @format */

import React, { useRef } from 'react';

interface TexInputWithErrorsProps {
  onChange(event);
  value: string;
  errors: string;
}
const TextInputWithErrors = ({ onChange, value, errors }: TexInputWithErrorsProps) => {
  const ref = useRef();

  return (
    <>
      <div className="sdpi-item">
        <div className="sdpi-item-label">Roll Equation</div>
        <input
          type="text"
          className="sdpi-item-value"
          id="dddice-rollEquation"
          ref={ref}
          onChange={event => {
            ref.current.setCustomValidity('');
            onChange(event);
          }}
          value={value}
          required
        />
      </div>
      {errors && <div className="text-error justify-center sdpi-item">{errors}</div>}
    </>
  );
};
export default TextInputWithErrors;
