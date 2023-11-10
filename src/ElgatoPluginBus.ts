/** @format */
import ElgatoBus from './elgatoBus';

const DestinationEnum = Object.freeze({
  HARDWARE_AND_SOFTWARE: 0,
  HARDWARE_ONLY: 1,
  SOFTWARE_ONLY: 2,
});

export type ElgatoEventHandler = (context, payload) => void;

export default class ElgatoPluginBus extends ElgatoBus {
  constructor(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    super(inPort, inPluginUUID, inRegisterEvent, inInfo);
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

  setImage(context, dataUrl) {
    const json = {
      event: 'setImage',
      context: context,
      payload: {
        image: dataUrl,
      },
    };

    this.websocket.send(JSON.stringify(json));
  }

  showOk = context => {
    const json = {
      event: 'showOk',
      context: context,
    };
    this.websocket.send(JSON.stringify(json));
  };

  showAlert = context => {
    const json = {
      event: 'showAlert',
      context: context,
    };
    this.websocket.send(JSON.stringify(json));
  };
}
