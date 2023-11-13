/** @format */

import { ThreeDDiceAPI } from 'dddice-js';

import ElgatoBus from './ElgatoBus';
import ElgatoPluginBus from './ElgatoPluginBus';

import { AbstractAction } from '~src/actions/AbstractAction';
import { ChangeRoomBackground } from '~src/actions/ChangeRoomBackground';
import { ClearRollHistory } from '~src/actions/ClearRollHistory';
import { Macro } from '~src/actions/Macro';
import { PickUp } from '~src/actions/PickUp';
import { PickUpAll } from '~src/actions/PickUpAll';
import { IGlobalSettings } from '~src/types';

let globalSettings: IGlobalSettings;

let elgatoBus: ElgatoBus;

const setImage = (context, payload, action: AbstractAction) => {
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
    'com.dddice.app.macro': new Macro(elgatoBus),
    'com.dddice.app.change_room_background': new ChangeRoomBackground(elgatoBus),
    'com.dddice.app.pick_up': new PickUp(elgatoBus),
    'com.dddice.app.pick_up_all': new PickUpAll(elgatoBus),
    'com.dddice.app.clear_roll_history': new ClearRollHistory(elgatoBus),
  };

  elgatoBus.on('didReceiveGlobalSettings', (context, { settings }) => {
    globalSettings = settings;
    const api = new ThreeDDiceAPI(settings.apiKey, 'Stream Deck');
    Object.values(actions).forEach(action => action.setApi(api));
  });

  elgatoBus.on('keyUp', (context, payload, action) => actions[action].onKeyUp(context, payload));
  elgatoBus.on('willAppear', (context, payload, action) => {
    setImage(context, payload, actions[action]);
  });
  elgatoBus.on('didReceiveSettings', (context, payload, action) => {
    setImage(context, payload, actions[action]);
  });

  elgatoBus.connect();
};
