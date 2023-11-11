/** @format */

import React from 'react';

import classNames from '~node_modules/classnames';
import { RefreshIcon } from '~src/IconLibrary';

interface RefreshingSelectBoxProps {
  onChange(event);
  items: { id; name: string }[];
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
    onChange({ target: { value: items[0].id } });
  }
  return (
    <div className="sdpi-item">
      <div className="sdpi-item-label">{label}</div>
      <select
        className="sdpi-item-value select"
        id="dddice-diceTheme"
        onChange={onChange}
        value={current}
        required
      >
        {items.map(theme => (
          <option value={theme.id} key={theme.id}>
            {theme.name}
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
