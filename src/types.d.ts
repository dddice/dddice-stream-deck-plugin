/** @format */

import { IRoom, ITheme } from 'dddice-js';

interface ISettings {
  diceTheme: string;
  label?: string;
  rollEquation: string;
  room: string;
  values?: string;
}

interface IGlobalSettings {
  apiKey: string;
  rooms: IRoom[];
  themes: ITheme[];
}
