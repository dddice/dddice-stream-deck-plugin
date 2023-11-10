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

export class BackgroundChange extends AbstractAction {
  public static type = 'com.dddice.app.change_room_background';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      const file = await urlToFile(settings.background.fileName, settings.background.fileName);

      const response = await this.api.room.updateBackground(settings.room, file);

      if (response.data.type === 'error') {
        this.elgatoBus.showAlert(context);
      }
      this.elgatoBus.showOk(context);
    } catch (e) {
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    if (globalSettings) {
      try {
        this.elgatoBus.setImage(context, settings.background?.fileName);
      } catch (e) {
        this.elgatoBus.setImage(context, '');
      }
    }
  }
}
