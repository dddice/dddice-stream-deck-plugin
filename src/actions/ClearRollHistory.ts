/** @format */

import { AbstractAction } from '~src/actions/AbstractAction';
import { ISettings } from '~src/types';
export class ClearRollHistory extends AbstractAction {
  public type = 'com.dddice.app.clear_chat';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      await this.api.room.deleteRolls(settings.room);
    } catch (e) {
      console.error(e);
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    return true;
  }
}
