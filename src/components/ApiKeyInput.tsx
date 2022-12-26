/** @format */

import { useState, useCallback } from 'react';

import API, { IUser } from '../api';

import Check from '../assets/interface-essential-done-check-3.svg';
import classNames from 'classnames';

const ApiKeyInput = props => {
  const { onSuccess } = props;
  /**
   * Loading
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if API Key is valid
   */
  const checkKeyValid = useCallback(async apiKey => {
    try {
      setIsLoading(true);
      const api = new API(apiKey);
      const user: IUser = await api.user().get();
      onSuccess(apiKey, user);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

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
        <div className="sdpi-item-label">API Key</div>
        <input
          disabled={isLoading}
          type="password"
          className="sdpi-item-value mr-2 min-w-6"
          id="dddice-apiKey"
          name="apiKey"
        />
        <button formaction="submit" className="flex flex-row items-center justify-center mr-6">
          <Check className="flex h-4 w-4 border-0" data-tip="Submit" />
        </button>
      </div>
    </form>
  );
};

export default ApiKeyInput;
