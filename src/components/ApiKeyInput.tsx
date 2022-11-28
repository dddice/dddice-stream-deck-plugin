/** @format */

import { useState, useCallback } from 'react';

import API, { IUser } from '../api';

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
          className="sdpi-item-value mr-6"
          id="dddice-apiKey"
          name="apiKey"
        />
      </div>
    </form>
  );
};

export default ApiKeyInput;
