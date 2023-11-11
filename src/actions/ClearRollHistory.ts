/** @format */

import { parseRollEquation, ThreeDDiceAPI } from '~node_modules/dddice-js';
import ElgatoBus from '~src/ElgatoBus';
import { AbstractAction } from '~src/actions/AbstractAction';
import { dataUrl, fileToDataUrl } from '~src/dataUrl';
import { ISettings } from '~src/types';

function isValuesString(values): values is string {
  return typeof values === 'string';
}

async function urlToFile(url, filename) {
  const mimeType = (url.match(/^data:([^;]+);/) || '')[1];

  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  return new File([buf], filename, { type: mimeType });
}

export class ClearRollHistory extends AbstractAction {
  public type = 'com.dddice.app.clear_chat';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      const response = await this.api.room.clearRollHistory(settings.room);
      if (response.data?.type === 'error') {
        console.error(response.data.error);
        this.elgatoBus.showAlert(context);
      }
      this.elgatoBus.showOk(context);
    } catch (e) {
      console.error(e);
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    return true;
  }
}
