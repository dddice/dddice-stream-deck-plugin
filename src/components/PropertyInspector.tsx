/** @format */

import React, { useEffect, useRef, Ref, useState } from 'react';

import ElgatoBus from '../elgatoBus';
import API from '../api';

import Loading from '../assets/loading.svg';
import ApiKeyInput from './ApiKeyInput';

const PropertyInspector = () => {
  const elgatoBus: Ref<ElgatoBus> = useRef(ElgatoBus);

  const [settings, setSettings] = useState({});

  const [globalSettings, setGlobalSettings] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [loadingMessage, setLoadingMessage] = useState();

  const [error, setError] = useState();

  const api = useRef();

  useEffect(() => {
    (window as any).connectElgatoStreamDeckSocket = (
      inPort,
      inUUID,
      inRegisterEvent,
      inInfo,
      inActionInfo,
    ) => {
      elgatoBus.current = new ElgatoBus(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo);

      const actionInfo = JSON.parse(inActionInfo);
      if (actionInfo?.payload?.settings) {
        setSettings(actionInfo?.payload?.settings);
      }

      elgatoBus.current.on('didReceiveGlobalSettings', (context, globalSettings) => {
        setGlobalSettings(globalSettings);
      });

      elgatoBus.current.connect();
    };
  }, []);

  const setSetting = (key, value) => {
    setSettings(settings => {
      settings = { ...settings, [key]: value };
      elgatoBus.current.setSettings(settings);
      return settings;
    });
  };

  const setGlobalSetting = (key, value) => {
    setGlobalSettings(globalSettings => {
      globalSettings = { ...globalSettings, [key]: value };
      elgatoBus.current.setGlobalSettings(globalSettings);
      return globalSettings;
    });
  };

  useEffect(() => {
    if (globalSettings.apiKey) {
      api.current = new API(globalSettings.apiKey);

      const load = async () => {
        setIsLoading(true);

        try {
          setLoadingMessage('Logging in');
          await api.current.user().get();
        } catch (error) {
          setError('Problem connecting with dddice');
          return;
        }

        let themes = [];
        setLoadingMessage('Loading rooms list');
        let rooms = await api.current.room().list();
        rooms = rooms.sort((a, b) => a.name.localeCompare(b.name));

        setLoadingMessage('Loading themes (1)');
        let _themes = await api.current.diceBox().list();

        const page = 2;
        while (_themes) {
          setLoadingMessage(`Loading themes (${page})`);
          themes = [...themes, ..._themes].sort((a, b) => a.name.localeCompare(b.name));
          _themes = await api.current.diceBox().next();
        }

        //setRooms(rooms);
        //setThemes(themes);
        setIsLoading(false);
      };

      load();
    }
  }, [globalSettings.apiKey]);

  return (
    <div className="sdpi-wrapper">
      {isLoading ? (
        <div className="flex flex-col justify-center text-gray-300 mt-4">
          <Loading className="flex h-10 w-10 animate-spin-slow m-auto" />
          <div className="flex m-auto">{loadingMessage}</div>
        </div>
      ) : (
        <>
          {!globalSettings.apiKey ? (
            <ApiKeyInput />
          ) : (
            <>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Roll Equation</div>
                <input
                  type="text"
                  className="sdpi-item-value"
                  id="dddice-rollEquation"
                  onInput={event => setSetting('rollEquation', event.target.value)}
                  value={settings.rollEquation}
                />
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Dice Theme</div>
                <input
                  type="text"
                  className="sdpi-item-value"
                  id="dddice-diceTheme"
                  onInput={event => setSetting('diceTheme', event.target.value)}
                  value={settings.diceTheme}
                />
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Room ID</div>
                <input
                  type="text"
                  className="sdpi-item-value"
                  id="dddice-room"
                  onInput={event => setSetting('room', event.target.value)}
                  value={settings.room}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyInspector;
