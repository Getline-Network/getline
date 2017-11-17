import { VueConstructor } from 'vue/types/vue';
import Vue from 'vue';

type Color = 'red'
  | 'pink'
  | 'purple'
  | 'deep-purple'
  | 'indigo'
  | 'blue'
  | 'light-blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'light-green'
  | 'lime'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'deep-orange'
  | 'brown'
  | 'grey'
  | 'blue-grey'
  | 'white'
  | 'black'
  | 'app-color-pallete';

type ThemeOption = Color | {
  color?: Color;
  hue?: string | number;
  textColor?: Color;
};

interface ThemeType {
  primary?: ThemeOption;
  accent?: ThemeOption;
  warn?: ThemeOption;
  background?: ThemeOption;
}

export interface VueMaterial extends VueConstructor<Vue> {
  material: {
    registerPalette(color: Color, settings: { darkText: number[] }),
    registerTheme(name: string | { [key: string]: ThemeType }, spec?: ThemeType): void,
  };
}