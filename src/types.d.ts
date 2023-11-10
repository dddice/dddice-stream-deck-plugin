/** @format */

import { IRoom, ITheme } from 'dddice-js';

interface ISettings {
  diceTheme: string;
  label?: string;
  rollEquation: string;
  room: string;
  values?: string;
  background?: { fileName: string; dataUrl: string };
}

interface IGlobalSettings {
  apiKey: string;
  rooms: IRoom[];
  themes: ITheme[];
}
