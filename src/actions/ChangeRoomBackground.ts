/** @format */

import { AbstractAction } from '~src/actions/AbstractAction';
import { ISettings } from '~src/types';
async function urlToFile(url, filename) {
  const mimeType = (url.match(/^data:([^;]+);/) || '')[1];

  const res = await fetch(url);
  const buf = await res.arrayBuffer();

  return new File([buf], filename, { type: mimeType });
}

export class ChangeRoomBackground extends AbstractAction {
  public type = 'com.dddice.app.change_room_background';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      const file = await urlToFile(settings.background.fileName, settings.background.fileName);

      await this.api.room.updateBackground(settings.room, file);
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
