/* Register default purple color */

import { VueConstructor } from 'vue/types/vue';
import Vue from 'vue';
import { VueMaterial } from './types';

const PURPLE: string = '#7249f7';
const DEFAULT_COLOR: number = 500;

export default function registerPurpleTheme(vue: VueConstructor<Vue>) {
  (vue as VueMaterial).material.registerPalette('app-color-pallete', { // tslint:disable
    [DEFAULT_COLOR]: PURPLE,
    darkText: [DEFAULT_COLOR],
  });
  (vue as VueMaterial).material.registerTheme('default', { primary: 'app-color-pallete' });
}