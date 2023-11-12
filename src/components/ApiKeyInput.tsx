/** @format */

import React, { useCallback } from 'react';

import { CheckIcon } from '~src/IconLibrary';

interface ApiKeyInputProps {
  onSuccess(string): void;
}

const ApiKeyInput = ({ onSuccess }: ApiKeyInputProps) => {
  /**
   * Submit API Key Form
   */
  const onSubmit = useCallback(e => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const apiKey = formData.get('apiKey');
    onSuccess(apiKey);
  }, []);

  return (
    <form onSubmit={onSubmit}>
      <div type="select" className="sdpi-item">
        <div className="sdpi-item-label flex items-center justify-end">API Key</div>
        <input
          disabled={false}
          type="password"
          className="sdpi-item-value mr-2 min-w-6"
          name="apiKey"
        />
        <button formAction="submit" className="flex flex-row items-center justify-center mr-6">
          <CheckIcon className="flex h-4 w-4 border-0" data-tip="Submit" />
        </button>
      </div>
    </form>
  );
};

export default ApiKeyInput;
