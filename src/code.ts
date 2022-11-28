/** @format */

import API from './api';
import { convertEquation, convertOperators } from './rollConverter';
import ElgatoBus from './elgatoBus';

let API_KEY;

interface ISettings {
  rollEquation: string;
  diceTheme: string;
  room: string;
}

let elgatoBus: ElgatoBus;

const quickRoll = {
  type: 'com.dddice.quick-roll.macro',

  onKeyUp: (context, settings: ISettings) => {
    const api = new API(API_KEY);
    api.roll().create({
      dice: convertEquation(settings.rollEquation, settings.diceTheme),
      room: settings.room,
      operator: convertOperators(settings.rollEquation),
    });
  },
};

(window as any).connectElgatoStreamDeckSocket = (
  inPort,
  inPluginUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo,
) => {
  elgatoBus = new ElgatoBus(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo);
  elgatoBus.on('keyUp', quickRoll.onKeyUp.bind(quickRoll));
  elgatoBus.on('didReceiveGlobalSettings', (context, settings) => {
    API_KEY = settings.apiKey;
  });
  elgatoBus.connect();
};
