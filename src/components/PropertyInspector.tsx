/** @format */

import React, { useEffect, useRef, Ref, useState, useCallback } from 'react';
import classNames from 'classnames';

import ElgatoBus from '../elgatoBus';
import API from '../api';

import Loading from '../assets/loading.svg';
import Help from '../assets/support-help-question-question-square.svg';
import LogOut from '../assets/interface-essential-exit-door-log-out-1.svg';
import Refresh from '../assets/arrows-diagrams-arrow-rotate-1.svg';

import ApiKeyInput from './ApiKeyInput';

const PropertyInspector = () => {
  const elgatoBus: Ref<ElgatoBus> = useRef(ElgatoBus);

  const [settings, setSettings] = useState({});

  const [globalSettings, setGlobalSettings] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState();

  const [error, setError] = useState();

  const [isThemesLoading, setIsThemesLoading] = useState(false);

  const [isRoomsLoading, setIsRoomsLoading] = useState(false);

  const api = useRef();

  /**
   * Rooms
   */
  const [rooms, setRooms] = useState([]);

  /**
   * Themes
   */
  const [themes, setThemes] = useState([]);

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
        console.log(globalSettings);
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

  const onSignOut = useCallback(() => {
    setGlobalSetting('apiKey', undefined);
    setGlobalSetting('rooms', undefined);
    setGlobalSetting('themes', undefined);
    setThemes([]);
    setRooms([]);
    setError(undefined);
    setIsLoading(false);
  }, []);

  const onKeySuccess = useCallback((apiKey: string) => {
    setGlobalSetting('apiKey', apiKey);
  }, []);

  const refreshThemes = async () => {
    let themes = [];
    setIsThemesLoading(true);
    setLoadingMessage('Loading themes (1)');
    let _themes = await api.current.diceBox().list();

    const page = 2;
    while (_themes) {
      setLoadingMessage(`Loading themes (${page})`);
      themes = [...themes, ..._themes].sort((a, b) => a.name.localeCompare(b.name));
      _themes = await api.current.diceBox().next();
    }
    setGlobalSetting('themes', themes);
    setThemes(themes);
    setIsThemesLoading(false);
  };

  const refreshRooms = async () => {
    setIsRoomsLoading(true);
    let rooms = await api.current.room().list();
    rooms = rooms.sort((a, b) => a.name.localeCompare(b.name));
    setGlobalSetting('rooms', rooms);
    setRooms(rooms);
    setIsRoomsLoading(false);
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

        setLoadingMessage('Loading rooms list');

        if (globalSettings.rooms) {
          setRooms(globalSettings.rooms);
        } else {
          refreshRooms();
        }

        if (globalSettings.themes) {
          setThemes(globalSettings.themes);
        } else {
          await refreshThemes();
        }

        setIsLoading(false);
      };

      load();
    }
  }, [globalSettings.apiKey]);

  return (
    <>
      {error ? (
        <div className="sdpi-wrapper">
          <p className="text-center text-neon-red">{error}</p>
          <div className="sdpi-item">
            <button className="sdpi-item-value" onClick={onSignOut}>
              sign out and try again.
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center text-gray-300 mt-4">
          <Loading className="flex h-10 w-10 animate-spin-slow m-auto" />
          <div className="flex m-auto">{loadingMessage}</div>
        </div>
      ) : (
        <div className="sdpi-wrapper">
          {!globalSettings.apiKey ? (
            <ApiKeyInput onSuccess={onKeySuccess} />
          ) : (
            <>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Roll Equation</div>
                <input
                  type="text"
                  className="sdpi-item-value mr-6"
                  id="dddice-rollEquation"
                  onInput={event => setSetting('rollEquation', event.target.value)}
                  value={settings.rollEquation}
                />
              </div>
              <div className="sdpi-item">
                <div className="sdpi-item-label">Room</div>
                <select
                  className="sdpi-item-value select mr-2"
                  id="dddice-room"
                  onChange={event => setSetting('room', event.target.value)}
                  value={settings.room}
                >
                  <option>--- Select Room ---</option>
                  {rooms.map(room => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <button className="flex flex-row items-center justify-center mr-6">
                  <Refresh
                    className={classNames(
                      'flex h-4 w-4 border-0',
                      isRoomsLoading && 'animate-spin-slow',
                    )}
                    onClick={refreshRooms}
                    data-tip="Reload Room List"
                  />
                </button>
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Dice Theme</div>
                <select
                  className="sdpi-item-value select mr-2"
                  id="dddice-diceTheme"
                  onChange={event => setSetting('diceTheme', event.target.value)}
                  value={settings.diceTheme}
                >
                  {themes.map(theme => (
                    <option value={theme.id} key={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                <button className="flex flex-row items-center justify-center mr-6">
                  <Refresh
                    className={classNames(
                      'flex h-4 w-4 border-0',
                      isThemesLoading && 'animate-spin-slow',
                    )}
                    onClick={refreshThemes}
                    data-tip="Reload Theme List"
                  />
                </button>
              </div>
              <hr />
              <div className="sdpi-item">
                <button
                  className="sdpi-item-value flex flex-row items-center justify-center"
                  onClick={onSignOut}
                >
                  <LogOut className="flex h-4 w-4 mr-1" />
                  <div className="flex">Sign Out</div>
                </button>
                <button className="sdpi-item-value flex flex-row items-center justify-center">
                  <Help className="flex h-4 w-4 mr-1" />
                  <div className="flex">Help</div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PropertyInspector;
