/** @format */

import { parseRollEquation } from '~node_modules/dddice-js';
import { AbstractAction } from '~src/actions/AbstractAction';
import { dataUrl } from '~src/dataUrl';
import { ISettings } from '~src/types';

function isValuesString(values): values is string {
  return typeof values === 'string';
}

export class Macro extends AbstractAction {
  public type = 'com.dddice.app.macro';

  async onKeyUp(context, { settings }: { settings: ISettings }) {
    try {
      const values =
        settings.values && isValuesString(settings.values) ? settings.values.split(',') : undefined;
      const { dice, operator } = parseRollEquation(
        settings.rollEquation,
        settings.diceTheme,
        values,
      );

      await this.api.roll.create(dice, {
        room: settings.room,
        operator,
        // turn any falsy into undefined. Other falsy will cause 400 in backend
        label: settings.label ? settings.label : undefined,
      });
      this.elgatoBus.showOk(context);
    } catch (e) {
      console.error(e);
      this.elgatoBus.showAlert(context);
    }
  }

  async setImage(context, { settings }: { settings: ISettings }, globalSettings) {
    if (globalSettings) {
      const fullTheme = globalSettings.themes.find(theme => theme.id === settings.diceTheme);
      try {
        const output = parseRollEquation(`${settings.rollEquation}`, fullTheme);
        if (fullTheme && output?.dice?.length > 0) {
          // find the preview that matches the first dice in the equation
          const firstDiceId = output.dice.reduce(
            (prev, cur) => (prev ?? cur?.type) as any,
            undefined,
          );
          const diceId: any =
            fullTheme.available_dice.find((ad: any) => ad.notation === firstDiceId) ||
            fullTheme.available_dice.find((ad: any) => ad.id === firstDiceId) ||
            fullTheme.available_dice.find((ad: any) => ad.type === firstDiceId) ||
            fullTheme.available_dice.find((ad: any) => ad === firstDiceId);
          this.elgatoBus.setImage(
            context,
            await dataUrl(fullTheme.preview[diceId.id ?? diceId] ?? ''),
          );
        }
      } catch (e) {
        console.error(e);
        this.elgatoBus.setImage(context, '');
      }
    }
  }
}
