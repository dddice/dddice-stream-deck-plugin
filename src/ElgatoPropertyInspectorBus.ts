/** @format */

import ElgatoBus from './elgatoBus';

export default class ElgatoPropertyInspectorBus extends ElgatoBus {
  private actionInfo: Record<string, string>;
  constructor(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
    super(inPort, inPluginUUID, inRegisterEvent, inInfo);
    this.actionInfo = JSON.parse(inActionInfo);
  }
  sendToPlugin(context, dataUrl) {
    const json = {
      action: 'com.dddice.app.macro',
      event: 'sendToPlugin',
      context: this.pluginUUID,
      payload: {
        event: 'setImage',
        context: context,
        payload: {
          image: dataUrl,
        },
      },
    };

    this.websocket.send(JSON.stringify(json));
  }
}
