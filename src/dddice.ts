/** @format */

import { ThreeDDiceAPI } from 'dddice-js';

import ElgatoPluginBus from './ElgatoPluginBus';
import ElgatoBus from './elgatoBus';

import { BackgroundChange } from '~src/actions/BackgroundChange';
import { QuickRoll } from '~src/actions/QuickRoll';
import { IGlobalSettings } from '~src/types';

let globalSettings: IGlobalSettings;

let elgatoBus: ElgatoBus;

const setImage = (context, payload, action) => {
  if (!globalSettings) {
    //async busy wait until global settings are ready
    setTimeout(() => setImage(context, payload, action), 0);
  } else {
    action.setImage(context, payload, globalSettings);
  }
};

(window as any).connectElgatoStreamDeckSocket = (inPort, inPluginUUID, inRegisterEvent, inInfo) => {
  elgatoBus = new ElgatoPluginBus(inPort, inPluginUUID, inRegisterEvent, inInfo);

  // action class map to later map actions
  // coming across the websocket to the class to call
  const actions = {
    'com.dddice.app.macro': new QuickRoll(elgatoBus),
    'com.dddice.app.change_room_background': new BackgroundChange(elgatoBus),
  };

  elgatoBus.on('didReceiveGlobalSettings', (context, { settings }) => {
    globalSettings = settings;
    const api = new ThreeDDiceAPI(settings.apiKey, 'Stream Deck');
    Object.values(actions).forEach(action => action.setApi(api));
  });

  elgatoBus.on('keyUp', (context, payload, action) => actions[action].onKeyUp(context, payload));
  elgatoBus.on('willAppear', (context, payload, action) =>
    setImage(context, payload, actions[action]),
  );
  elgatoBus.on('didReceiveSettings', (context, payload, action) => {
    setImage(context, payload, actions[action]);
  });

  elgatoBus.connect();
};
