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

export class PickUp extends AbstractAction {
  public type = 'com.dddice.app.pick_up';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      await this.api.room.updateRolls(settings.room, { is_cleared: true });
      this.elgatoBus.showOk(context);
    } catch (e) {
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    this.elgatoBus.setTitle(
      context,
      globalSettings.rooms.find(room => room.slug === settings.room).name.replace(/\s+/g, '\n'),
    );
  }
}
