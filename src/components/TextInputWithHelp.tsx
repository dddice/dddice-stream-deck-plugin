/** @format */

import React from 'react';

import { Tooltip } from '~node_modules/react-tooltip';

interface TextInputProps {
  onChange(event);
  value: string;
  label: string;
  tooltipContent: React.JSX.Element;
}

const TextInputWithHelp = ({ onChange, value, label, tooltipContent }: TextInputProps) => {
  const tooltipId = 'dddice-help-tooltip-' + label.replace(' ', '-');
  return (
    <>
      <Tooltip noArrow={false} id={tooltipId} clickable className="!bg-gray-900">
        {tooltipContent}
      </Tooltip>
      <div className="sdpi-item">
        <div className="sdpi-item-label flex items-center justify-end">{label}</div>
        <input type="text" className="sdpi-item-value select" onInput={onChange} value={value} />
        <button
          className="flex flex-row items-center justify-center ml-2 w-[23px]"
          data-tooltip-id={tooltipId}
          data-tooltip-place="top"
        >
          <div className="flex border-0">?</div>
        </button>
      </div>
    </>
  );
};

export default TextInputWithHelp;
