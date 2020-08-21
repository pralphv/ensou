export interface LchRange {
  min: number;
  max: number;
}

export interface Lch {
  l: number;
  c: number;
  h: number;
  [key: string]: Lch[keyof Lch];
}

export interface GeneralObject {
  [key: string]: any;
}

export interface Window {
  width: number;
  height: number;
}
