/** @format */

const DestinationEnum = Object.freeze({
  HARDWARE_AND_SOFTWARE: 0,
  HARDWARE_ONLY: 1,
  SOFTWARE_ONLY: 2,
});

export type ElgatoEventHandler = (context, settings, coordinates, userDesiredState) => void;

export default class ElgatoBus {
  private pluginUUID: string;
  private websocket: WebSocket;
  private registerEvent: string;
  private info: Record<string, string>;
  private actionInfo: Record<string, string>;
  private listeners: Record<string, ElgatoEventHandler> = {};
  private port: string;

  constructor(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
    this.pluginUUID = inPluginUUID;
    this.registerEvent = inRegisterEvent;
    this.info = inInfo;
    this.actionInfo = inActionInfo;
    this.port = inPort;
  }

  connect() {
    // Open the web socket
    this.websocket = new WebSocket('ws://127.0.0.1:' + this.port);

    this.websocket.onopen = () => {
      // WebSocket is connected, send message
      this.registerPlugin(this.pluginUUID);
      this.getGlobalSettings();
    };

    this.websocket.onmessage = evt => {
      const data = JSON.parse(evt.data);
      if (this.listeners[data.event]) {
        this.listeners[data.event](
          data.context,
          data.payload?.settings,
          data.payload?.coordinates,
          data.payload?.userDesiredState,
        );
      }
    };
  }

  on(event, handler: ElgatoEventHandler) {
    this.listeners[event] = handler;
  }

  registerPlugin(inPluginUUID) {
    const json = {
      event: this.registerEvent,
      uuid: inPluginUUID,
    };

    this.websocket.send(JSON.stringify(json));
  }

  getGlobalSettings() {
    const json = {
      event: 'getGlobalSettings',
      context: this.pluginUUID,
    };

    this.websocket.send(JSON.stringify(json));
  }

  setTitle(context, keyPressCounter) {
    const json = {
      event: 'setTitle',
      context: context,
      payload: {
        title: '' + keyPressCounter,
        target: DestinationEnum.HARDWARE_AND_SOFTWARE,
      },
    };

    this.websocket.send(JSON.stringify(json));
  }

  setSettings = settings => {
    const json = {
      event: 'setSettings',
      context: this.pluginUUID,
      payload: settings,
    };
    this.websocket.send(JSON.stringify(json));
  };

  setGlobalSettings = settings => {
    const json = {
      event: 'setGlobalSetting',
      context: this.pluginUUID,
      payload: settings,
    };
    this.websocket.send(JSON.stringify(json));
  };
}
