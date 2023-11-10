/** @format */

import React from 'react';

import ApiKeyInput from './ApiKeyInput';

import { HelpIcon, KeyIcon } from '~src/IconLibrary';

export function Login(props: {
  onSuccess: (apiKey: string) => void;
  onClick: () => void;
  onClick1: () => void;
}) {
  return (
    <>
      <ApiKeyInput onSuccess={props.onSuccess} />
      <div type="select" className="sdpi-item">
        <button
          className="sdpi-item-value flex flex-row items-center justify-center"
          onClick={props.onClick}
        >
          <KeyIcon className="flex h-4 w-4 mr-1" />
          <div className="flex">Get An API Key</div>
        </button>
        <button
          className="sdpi-item-value flex flex-row items-center justify-center"
          onClick={props.onClick1}
        >
          <HelpIcon className="flex h-4 w-4 mr-1" />
          <div className="flex">Help</div>
        </button>
      </div>
    </>
  );
}
