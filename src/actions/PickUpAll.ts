/** @format */

import { AbstractAction } from '~src/actions/AbstractAction';
import { ISettings } from '~src/types';

export class PickUpAll extends AbstractAction {
  public type = 'com.dddice.app.pick_up_all';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      await this.api.room.updateRolls(settings.room, { is_cleared: true }, '*');
      this.elgatoBus.showOk(context);
    } catch (e) {
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    return true;
  }
}
