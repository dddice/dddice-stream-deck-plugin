/** @format */
import { AbstractAction } from '~src/actions/AbstractAction';
import { ISettings } from '~src/types';

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
