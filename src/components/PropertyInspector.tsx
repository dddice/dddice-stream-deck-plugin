/** @format */

import React, { useEffect, useRef, Ref, useState } from 'react';

import ElgatoBus from '../elgatoBus';
const PropertyInspector = () => {
  const elgatoBus: Ref<ElgatoBus> = useRef(ElgatoBus);

  const [settings, setSettings] = useState({});

  const [globalSettings, setGlobalSettings] = useState({});

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

  return (
    <div className="sdpi-wrapper">
      <div type="select" className="sdpi-item">
        <div className="sdpi-item-label">API Key</div>
        <input
          type="password"
          className="sdpi-item-value"
          id="dddice-apiKey"
          onInput={event => setGlobalSetting('apiKey', event.target.value)}
          value={globalSettings.apiKey}
        />
      </div>
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
    </div>
  );
};

export default PropertyInspector;
