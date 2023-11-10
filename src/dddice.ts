/** @format */

import { parseRollEquation, ThreeDDiceAPI } from 'dddice-js';

import ElgatoPluginBus from './ElgatoPluginBus';
import ElgatoBus from './elgatoBus';
import toDataURL from './toDataURL';
import { IGlobalSettings, ISettings } from './types';

let API_KEY;
let globalSettings: IGlobalSettings;

let elgatoBus: ElgatoBus;

function isValuesString(values): values is string {
  return typeof values === 'string';
}

const quickRoll = {
  type: 'com.dddice.app.macro',

  onKeyUp: async (context, { settings }: { settings: ISettings }) => {
    try {
      const api = new ThreeDDiceAPI(API_KEY, 'Stream Deck');
      const values =
        settings.values && isValuesString(settings.values) ? settings.values.split(',') : undefined;
      const { dice, operator } = parseRollEquation(
        settings.rollEquation,
        settings.diceTheme,
        values,
      );

      const response = await api.roll.create(dice, {
        room: settings.room,
        operator,
        // turn any falsy into undefined. Other falsy will cause 400 in backend
        label: settings.label ? settings.label : undefined,
      });

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

const setImage = async (context, { settings }: { settings: ISettings }) => {
  if (!globalSettings) {
    //async busy wait until global settings are ready
    setTimeout(() => setImage(context, { settings }), 0);
  }
  const fullTheme = globalSettings.themes.find(theme => theme.id === settings.diceTheme);
  try {
    const output = parseRollEquation(`${settings.rollEquation}`, fullTheme);
    if (fullTheme && output?.dice?.length > 0) {
      // find the preview that matches the first dice in the equation
      const firstDiceId = output.dice.reduce((prev, cur) => (prev ?? cur?.type) as any, undefined);
      const diceId: any = fullTheme.available_dice.find(
        (ad: any) =>
          ad.notation === firstDiceId ||
          ad.id === firstDiceId ||
          ad.type === firstDiceId ||
          ad === firstDiceId,
      );
      elgatoBus.setImage(context, await toDataURL(fullTheme.preview[diceId.id ?? diceId] ?? ''));
    }
  } catch (e) {
    console.error(e);
    elgatoBus.setImage(context, '');
  }
};

(window as any).connectElgatoStreamDeckSocket = (inPort, inPluginUUID, inRegisterEvent, inInfo) => {
  elgatoBus = new ElgatoPluginBus(inPort, inPluginUUID, inRegisterEvent, inInfo);
  elgatoBus.on('keyUp', quickRoll.onKeyUp.bind(quickRoll));
  elgatoBus.on('didReceiveGlobalSettings', (context, { settings }) => {
    API_KEY = settings.apiKey;
    globalSettings = settings;
  });
  elgatoBus.on('willAppear', setImage);
  elgatoBus.on('didReceiveSettings', setImage);
  elgatoBus.connect();
};
