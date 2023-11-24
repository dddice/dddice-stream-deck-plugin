/** @format */

import React from 'react';

import classNames from '~node_modules/classnames';
import { RefreshIcon } from '~src/IconLibrary';

interface RefreshingSelectBoxProps {
  onChange(event);
  items: { id: string; name: string; disabled: boolean }[];
  current: string;
  isRefreshing: boolean;
  onRefresh;
  label: string;
}
const RefreshingSelectBox = ({
  label,
  onChange,
  items,
  current,
  isRefreshing,
  onRefresh,
}: RefreshingSelectBoxProps) => {
  if (current === undefined) {
    onChange({ target: { value: items.find(i => !i.disabled)?.id } });
  }
  return (
    <div className="sdpi-item">
      <div className="sdpi-item-label flex items-center justify-end">{label}</div>
      <select className="sdpi-item-value select" onChange={onChange} value={current} required>
        {items.map(item => (
          <option value={item.id} key={item.id} disabled={item.disabled}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        className="flex flex-row items-center justify-center ml-2 w-[23px]"
        data-tooltip-html="Reload Theme List"
        data-tooltip-id="dddice-tooltip"
        data-tooltip-place="top"
      >
        <RefreshIcon
          className={classNames('flex h-4 w-4 border-0', isRefreshing && 'animate-spin-slow')}
          onClick={onRefresh}
        />
      </button>
    </div>
  );
};

export default RefreshingSelectBox;
