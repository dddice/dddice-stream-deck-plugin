/** @format */

import { parseRollEquation, ThreeDDiceAPI } from 'dddice-js';

import ElgatoBus from './elgatoBus';

let API_KEY;

interface ISettings {
  label?: string;
  rollEquation: string;
  diceTheme: string;
  room: string;
  values?: string;
}

let elgatoBus: ElgatoBus;

function isValuesString(values): values is string {
  return typeof values === 'string';
}

const quickRoll = {
  type: 'com.dddice.app.macro',

  onKeyUp: async (context, settings: ISettings) => {
    try {
      const api = new ThreeDDiceAPI(API_KEY, 'Stream Deck');
      const values =
        settings.values && isValuesString(settings.values) ? settings.values.split(',') : undefined;
      const { dice, operator } = parseRollEquation(
        settings.rollEquation,
        settings.diceTheme,
        values,
      );
      ;
      const response = await api.roll.create(dice, {
        room: settings.room,
        operator,
        label: settings.label !== '' ? settings.label : undefined,
      });
      ;
      if (response.data.type === 'error') {
        console.error(response.data.data);
        elgatoBus.showAlert(context);
      }
      elgatoBus.showOk(context);
    } catch (e) {
      console.error(e);
      elgatoBus.showAlert(context);
    }
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
