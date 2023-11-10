/** @format */

import React from 'react';

interface FileInputProps {
  label: string;
  onChange(event);
  value;
}
const FileInput = ({ label, onChange, value }: FileInputProps) => {
  const id = `dddice-file-picker${label.replace(' ', '-')}`;
  return (
    <div className="sdpi-item">
      <div className="sdpi-item-label">{label}</div>
      <div className="sdpi-item-group file" id="filepickergroup">
        <input
          className="sdpi-item-value"
          type="file"
          id={id}
          accept=".jpg, .jpeg, .png, .gif, .svg, .webp"
          onChange={onChange}
        />
        <label className="sdpi-file-info sdpi-file-label" htmlFor={id}>
          {value?.split(/[\\/]/).at(-1) ?? ''}
        </label>
        <button
          className="sdpi-file-label flex flex-row items-center justify-center ml-2 w-[23px]"
          htmlFor={id}
        >
          <div className="flex border-0">...</div>
        </button>
      </div>
    </div>
  );
};

export default FileInput;
