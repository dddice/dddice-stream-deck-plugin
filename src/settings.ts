/** @format */

// this is our global websocket, used to communicate from/to Stream Deck software
// and some info about our plugin, as sent by Stream Deck software
import ElgatoBus from './elgatoBus';

let websocket = null,
  uuid = null,
  actionInfo = {};
let settings: Record<string, string> = {};
let globalSettings: Record<string, string> = {};

let elgatoBus: ElgatoBus;
(window as any).connectElgatoStreamDeckSocket = (
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo,
) => {
  elgatoBus = new ElgatoBus(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo);
  actionInfo = JSON.parse(inActionInfo); // cache the info
  console.log(inActionInfo);
  settings = actionInfo?.payload?.settings;

  Object.entries(settings).forEach(([key, value]) => {
    const element = document.getElementById(`dddice-${key}`) as HTMLElement;
    if (element) {
      element.setAttribute('value', value);
    }
  });

  elgatoBus.on('didReceiveGlobalSettings', (context, settings) => {
    globalSettings = settings;
    Object.entries(globalSettings).forEach(([key, value]) => {
      const element = document.getElementById(`dddice-${key}`) as HTMLElement;
      if (element) {
        element.setAttribute('value', value);
      }
    });
  });
  elgatoBus.connect();
};

// our method to pass values to the plugin
(window as any).setSetting = (key, value) => {
  console.log(`setSetting ${key}:${value}`);
  settings = { ...settings, [key]: value };
  elgatoBus.setSetting(settings);
};

(window as any).setGlobalSetting = (key, value) => {
  console.log(`setGlobalSetting ${key}:${value}`);
  globalSettings = { ...globalSettings, [key]: value };
  elgatoBus.setSetting(settings);
};
