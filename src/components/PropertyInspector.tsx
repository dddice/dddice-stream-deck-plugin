/** @format */

import classNames from 'classnames';
import { IRoom, ITheme, ThreeDDiceAPI, MissingDieError } from 'dddice-js';
import { parseRollEquation } from 'dddice-js';
import { debounce } from 'lodash-es';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tooltip } from 'react-tooltip';

import RefreshIcon from '../assets/arrows-diagrams-arrow-rotate-1.svg';
import LogoutIcon from '../assets/interface-essential-exit-door-log-out-1.svg';
import KeyIcon from '../assets/interface-essential-key-4.svg';
import LoadingIcon from '../assets/loading.svg';
import HelpIcon from '../assets/support-help-question-question-square.svg';
import ElgatoBus from '../elgatoBus';

import ApiKeyInput from './ApiKeyInput';

interface Settings {
  rollEquation: string;
  diceTheme: string;
  label: string;
  room: string;
  values: string;
}

interface GlobalSettings {
  apiKey: string;
  themes: ITheme[];
  rooms: IRoom[];
}

const availableDiceToString = (available_dice): string =>
  available_dice.map(dice => dice.notation ?? dice.id ?? dice.type ?? dice).join(', ');

const PropertyInspector = () => {
  const elgatoBus = useRef<ElgatoBus>(null);

  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState();
  const [error, setError] = useState();
  const [equationErrors, setEquationErrors] = useState();
  const [isThemesLoading, setIsThemesLoading] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const api = useRef<ThreeDDiceAPI>();
  const equationRef = useRef();

  /**
   * Rooms
   */
  const [rooms, setRooms] = useState([]);

  /**
   * Themes
   */
  const [themes, setThemes] = useState([]);

  /**
   * Mount / Unmount
   */
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
      const settings: Settings = actionInfo?.payload?.settings;
      if (actionInfo?.payload?.settings) {
        setSettings(settings);
      }

      elgatoBus.current.on(
        'didReceiveGlobalSettings',
        (_context, globalSettings: GlobalSettings) => {
          setGlobalSettings(globalSettings);
          // check the equation for errors on mount
          if (settings?.rollEquation && settings?.diceTheme && globalSettings.themes) {
            validateEquation(settings.rollEquation, settings?.diceTheme, globalSettings.themes);
          }
        },
      );

      elgatoBus.current.connect();
    };
  }, []);

  /*
   * set validity of the equation field
   */
  useEffect(() => {
    equationRef.current?.setCustomValidity(equationErrors);
  }, [equationErrors]);

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

  const openHelp = () => {
    elgatoBus.current.openLink('https://docs.dddice.com/guides/streamdeck-plugin.html');
  };

  const getApiKey = () => {
    elgatoBus.current.openLink('https://dddice.com/account/developer');
  };

  const onKeySuccess = useCallback((apiKey: string) => {
    setGlobalSetting('apiKey', apiKey);
  }, []);

  const refreshThemes = async () => {
    let themes = [];
    setIsThemesLoading(true);
    setLoadingMessage('Loading themes (1)');
    let _themes = (await api.current.diceBox.list()).data;

    let page = 2;
    while (_themes) {
      setLoadingMessage(`Loading themes (${page})`);
      themes = [...themes, ..._themes].sort((a, b) => a.name.localeCompare(b.name));
      _themes = (await api.current.diceBox.next())?.data;
      page++;
    }
    setGlobalSetting('themes', themes);
    setThemes(themes);
    setIsThemesLoading(false);
  };

  const refreshRooms = async () => {
    setIsRoomsLoading(true);
    let rooms = (await api.current.room.list()).data;
    rooms = rooms.sort((a, b) => a.name.localeCompare(b.name));
    setGlobalSetting('rooms', rooms);
    setRooms(rooms);
    setIsRoomsLoading(false);
  };

  useEffect(() => {
    if (globalSettings.apiKey) {
      api.current = new ThreeDDiceAPI(globalSettings.apiKey, 'Stream Deck');

      const load = async () => {
        setIsLoading(true);

        try {
          setLoadingMessage('Logging in');
          await api.current.user.get().data;
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

  const validateEquation = (equation, diceTheme, allThemes) => {
    const fullTheme = allThemes.find(theme => theme.id === diceTheme);
    try {
      parseRollEquation(`${equation}`, fullTheme);
    } catch (e: unknown) {
      setEquationErrors(
        <div className="flex flex-col">
          <div>{(e as MissingDieError).message}</div>
          {(e as MissingDieError).available_dice && (
            <div>{(e as MissingDieError).available_dice}</div>
          )}
        </div>,
      );
    }
  };
  const debouncedValidateEquation = useCallback(debounce(validateEquation, 500), []);

  const setEquation = useCallback(
    event => {
      equationRef.current.setCustomValidity('');
      setEquationErrors(null);
      setSetting('rollEquation', event.target.value);
      debouncedValidateEquation(event.target.value, settings.diceTheme, themes, event.target);
    },
    [themes, settings],
  );

  const onChangeTheme = useCallback(
    event => {
      setSetting('diceTheme', event.target.value);
      equationRef.current.setCustomValidity('');
      setEquationErrors(null);
      debouncedValidateEquation(settings.rollEquation, event.target.value, themes, event.target);
    },
    [themes, settings],
  );

  return (
    <>
      <Tooltip noArrow={false} id="dddice-tooltip" />
      <Tooltip noArrow={false} id="dddice-values-help-tooltip" clickable className="!bg-gray-900">
        <div>A comma seperated list of the values to force the dice to roll</div>
        <div>Ex: "6,1" to roll a 7 on 2d6</div>
        <button className="text-neon-blue bg-transparent border-0 underline" onClick={openHelp}>
          Read more in our docs
        </button>
      </Tooltip>
      <Tooltip noArrow={false} id="dddice-label-help-tooltip" clickable className="!bg-gray-900">
        <div>A description of the roll to show in the roll log</div>
        <div>Ex: Hand Ax: Attack</div>
        <button className="text-neon-blue bg-transparent border-0 underline" onClick={openHelp}>
          Read more in our docs
        </button>
      </Tooltip>
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
          <LoadingIcon className="flex h-10 w-10 animate-spin-slow m-auto" />
          <div className="flex m-auto">{loadingMessage}</div>
        </div>
      ) : (
        <div className="sdpi-wrapper">
          {!globalSettings.apiKey ? (
            <>
              <ApiKeyInput onSuccess={onKeySuccess} />
              <div type="select" className="sdpi-item">
                <button
                  className="sdpi-item-value flex flex-row items-center justify-center"
                  onClick={getApiKey}
                >
                  <KeyIcon className="flex h-4 w-4 mr-1" />
                  <div className="flex">Get An API Key</div>
                </button>
                <button
                  className="sdpi-item-value flex flex-row items-center justify-center"
                  onClick={openHelp}
                >
                  <HelpIcon className="flex h-4 w-4 mr-1" />
                  <div className="flex">Help</div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Roll Equation</div>
                <input
                  type="text"
                  className="sdpi-item-value"
                  id="dddice-rollEquation"
                  ref={equationRef}
                  onChange={setEquation}
                  value={settings.rollEquation}
                  required
                />
              </div>
              {equationErrors && (
                <div className="text-error justify-center sdpi-item">{equationErrors}</div>
              )}
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Room</div>
                <select
                  className="sdpi-item-value select"
                  id="dddice-room"
                  onChange={event => setSetting('room', event.target.value)}
                  value={settings.room}
                  required
                >
                  <option>--- Select Room ---</option>
                  {rooms.map(room => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <button
                  className="flex flex-row items-center justify-center ml-2 w-[23px]"
                  data-tooltip-html="Reload Room List"
                  data-tooltip-id="dddice-tooltip"
                  data-tooltip-place="top"
                >
                  <RefreshIcon
                    className={classNames(
                      'flex h-4 w-4 border-0',
                      isRoomsLoading && 'animate-spin-slow',
                    )}
                    onClick={refreshRooms}
                  />
                </button>
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Dice Theme</div>
                <select
                  className="sdpi-item-value select"
                  id="dddice-diceTheme"
                  onChange={onChangeTheme}
                  value={settings.diceTheme}
                  required
                >
                  {themes.map(theme => (
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
                    className={classNames(
                      'flex h-4 w-4 border-0',
                      isThemesLoading && 'animate-spin-slow',
                    )}
                    onClick={refreshThemes}
                  />
                </button>
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Label</div>
                <input
                  type="text"
                  className="sdpi-item-value select"
                  id="dddice-label"
                  onInput={event => setSetting('label', event.target.value)}
                  value={settings.label}
                />
                <button
                  className="flex flex-row items-center justify-center ml-2 w-[23px]"
                  data-tooltip-id="dddice-label-help-tooltip"
                  data-tooltip-place="top"
                >
                  <div className="flex border-0">?</div>
                </button>
              </div>
              <div type="select" className="sdpi-item">
                <div className="sdpi-item-label">Forced Roll</div>
                <input
                  type="text"
                  className="sdpi-item-value select"
                  id="dddice-values"
                  onInput={event => setSetting('values', event.target.value)}
                  value={settings.values}
                />
                <button
                  className="flex flex-row items-center justify-center ml-2 w-[23px]"
                  data-tooltip-id="dddice-values-help-tooltip"
                  data-tooltip-place="top"
                >
                  <div className="flex border-0">?</div>
                </button>
              </div>
              <hr />
              <div className="sdpi-item">
                <button
                  className="sdpi-item-value flex flex-row items-center justify-center"
                  onClick={onSignOut}
                >
                  <LogoutIcon className="flex h-4 w-4 mr-1" />
                  <div className="flex">Sign Out</div>
                </button>
                <button
                  className="sdpi-item-value flex flex-row items-center justify-center"
                  onClick={openHelp}
                >
                  <HelpIcon className="flex h-4 w-4 mr-1" />
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
