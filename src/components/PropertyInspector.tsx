/** @format */

import { ThreeDDiceAPI, MissingDieError } from 'dddice-js';
import { parseRollEquation } from 'dddice-js';
import { debounce } from 'lodash-es';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tooltip } from 'react-tooltip';

import ElgatoBus from '~src/ElgatoBus';
import ElgatoPropertyInspectorBus from '~src/ElgatoPropertyInspectorBus';
import LogoutIcon from '~src/assets/interface-essential-exit-door-log-out-1.svg';
import LoadingIcon from '~src/assets/loading.svg';
import HelpIcon from '~src/assets/support-help-question-question-square.svg';
import FileInput from '~src/components/FileInput';
import { Login } from '~src/components/Login';
import RefreshingSelectBox from '~src/components/RefreshingSelectBox';
import TextInputWithErrors from '~src/components/TextInputWithErrors';
import TextInputWithHelp from '~src/components/TextInputWithHelp';
import { IGlobalSettings, ISettings } from '~src/types';

const PropertyInspector = () => {
  const elgatoBus = useRef<ElgatoBus>(null);

  const [settings, setSettings] = useState<Partial<ISettings>>({});
  const [globalSettings, setGlobalSettings] = useState<IGlobalSettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState();
  const [error, setError] = useState();
  const [equationErrors, setEquationErrors] = useState();
  const [isThemesLoading, setIsThemesLoading] = useState(false);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const api = useRef<ThreeDDiceAPI>();
  const [action, setAction] = useState();
  const [rooms, setRooms] = useState([]);
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
      elgatoBus.current = new ElgatoPropertyInspectorBus(
        inPort,
        inUUID,
        inRegisterEvent,
        inInfo,
        inActionInfo,
      );

      const actionInfo = JSON.parse(inActionInfo);
      const settings: ISettings = actionInfo?.payload?.settings;
      if (actionInfo?.payload?.settings) {
        setSettings(settings);
      }
      setAction(actionInfo.action);
      setIsLoading(true);

      elgatoBus.current.on('didReceiveGlobalSettings', (_context, { settings: globalSettings }) => {
        setGlobalSettings(globalSettings);
        // check the equation for errors on mount
        if (settings?.rollEquation && settings?.diceTheme && globalSettings.themes) {
          validateEquation(settings.rollEquation, settings?.diceTheme, globalSettings.themes);
        }
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
          setLoadingMessage('Connecting to dddice');
          api.current.userUuid = (await api.current.user.get()).data.uuid;
        } catch (error) {
          setError('Problem connecting with dddice');
          return;
        }

        setLoadingMessage('Loading rooms list');

        if (globalSettings.rooms) {
          setRooms(globalSettings.rooms);
        } else {
          await refreshRooms();
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

  const validateEquation = async (equation, diceTheme, allThemes) => {
    if (equation) {
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
    }
  };
  const debouncedValidateEquation = useCallback(debounce(validateEquation, 500), []);

  const setEquation = useCallback(
    event => {
      setEquationErrors(null);
      setSetting('rollEquation', event.target.value);
      debouncedValidateEquation(event.target.value, settings.diceTheme, themes);
    },
    [themes, settings],
  );

  const onChangeTheme = useCallback(
    async event => {
      setSetting('diceTheme', event.target.value);
      //equationRef.current.setCustomValidity('');
      setEquationErrors(null);
      await validateEquation(settings.rollEquation, event.target.value, themes);
    },
    [themes, settings],
  );

  let actionComponents;
  switch (action) {
    case 'com.dddice.app.macro':
      actionComponents = (
        <>
          <TextInputWithErrors
            onChange={setEquation}
            value={settings.rollEquation}
            errors={equationErrors}
          />
          <RefreshingSelectBox
            label={'Room'}
            onChange={event => setSetting('room', event.target.value)}
            items={rooms.map(r => ({ id: r.slug, name: r.name }))}
            current={settings.room}
            isRefreshing={isRoomsLoading}
            onRefresh={refreshRooms}
          />
          <RefreshingSelectBox
            label={'Dice Theme'}
            onChange={onChangeTheme}
            items={themes}
            current={settings.diceTheme}
            isRefreshing={isThemesLoading}
            onRefresh={refreshThemes}
          />
          <TextInputWithHelp
            onChange={event => setSetting('label', event.target.value)}
            value={settings.label}
            label={'Roll Label'}
            tooltipContent={
              <>
                <div>A description of the roll to show in the roll log</div>
                <div>Ex: Hand Ax: Attack</div>
                <button
                  className="text-neon-blue bg-transparent border-0 underline"
                  onClick={openHelp}
                >
                  Read more in our docs
                </button>
              </>
            }
          />
          <TextInputWithHelp
            onChange={event => setSetting('values', event.target.value)}
            value={settings.values}
            label={'Fudge the roll'}
            tooltipContent={
              <>
                <div>A comma seperated list of the values you want the dice to land on</div>
                <div>Ex: 6,3,5</div>
                <button
                  className="text-neon-blue bg-transparent border-0 underline"
                  onClick={openHelp}
                >
                  Read more in our docs
                </button>
              </>
            }
          />
        </>
      );
      break;
    case 'com.dddice.app.change_room_background':
      actionComponents = (
        <>
          <FileInput
            value={settings.background?.fileName}
            label={'Background'}
            onChange={async event => {
              setSetting('background', {
                fileName: decodeURIComponent(event.target.files[0].name),
              });
            }}
          />
          <RefreshingSelectBox
            label={'Room'}
            onChange={event => setSetting('room', event.target.value)}
            items={rooms.map(r => ({
              id: r.slug,
              name: r.name,
              disabled: r.user.uuid !== api.current?.userUuid,
            }))}
            current={settings.room}
            isRefreshing={isRoomsLoading}
            onRefresh={refreshRooms}
          />
        </>
      );
      break;
    case 'com.dddice.app.pick_up':
      actionComponents = (
        <RefreshingSelectBox
          label={'Room'}
          onChange={event => setSetting('room', event.target.value)}
          items={rooms.map(r => ({ id: r.slug, name: r.name }))}
          current={settings.room}
          isRefreshing={isRoomsLoading}
          onRefresh={refreshRooms}
        />
      );
      break;
    case 'com.dddice.app.pick_up_all':
      actionComponents = (
        <RefreshingSelectBox
          label={'Room'}
          onChange={event => setSetting('room', event.target.value)}
          items={rooms.map(r => ({
            id: r.slug,
            name: r.name,
            disabled: r.user.uuid !== api.current?.userUuid,
          }))}
          current={settings.room}
          isRefreshing={isRoomsLoading}
          onRefresh={refreshRooms}
        />
      );
      break;
    case 'com.dddice.app.clear_roll_history':
      actionComponents = (
        <RefreshingSelectBox
          label={'Room'}
          onChange={event => setSetting('room', event.target.value)}
          items={rooms.map(r => ({
            id: r.slug,
            name: r.name,
            disabled: r.user.uuid !== api.current?.userUuid,
          }))}
          current={settings.room}
          isRefreshing={isRoomsLoading}
          onRefresh={refreshRooms}
        />
      );
      break;
  }

  return (
    <>
      <Tooltip noArrow={false} id="dddice-tooltip" />
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
            <Login onClick={getApiKey} onClick1={openHelp} onSuccess={onKeySuccess} />
          ) : (
            <>
              {actionComponents}
              {
                <>
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
              }
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PropertyInspector;
