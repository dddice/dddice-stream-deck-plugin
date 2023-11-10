/** @format */

import { ThreeDDiceAPI } from 'dddice-js';

import ElgatoBus from '~src/ElgatoBus';
import { ISettings } from '~src/types';

export abstract class AbstractAction {
  protected api: ThreeDDiceAPI;
  protected elgatoBus: ElgatoBus;
  public static type;

  constructor(elgatoBus) {
    this.elgatoBus = elgatoBus;
  }
  setApi(api) {
    this.api = api;
  }

  abstract onKeyUp(context, { settings }: { settings: ISettings }): Promise<any>;
  abstract setImage(context, { settings }: { settings: ISettings }, globalSettings): Promise<any>;
}
