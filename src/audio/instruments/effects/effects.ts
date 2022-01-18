import { Destination } from "tone";

import * as types from "types";
import {
  effectsLocalStorage,
  effectsSettingsLocalStorage,
} from "utils/localStorageUtils";
import { NAME_TO_EFFECT_MAP } from "./constants";

// reconnect
interface IEffectsEventsMap {
  reconnect?: (effectChain: types.AvailableEffects[]) => void;
  disconnect?: () => void;
  effectChainChanged: (effectChain: types.AvailableEffectsNames[]) => void;
}

export default class Effects {
  effectChain: types.AvailableEffects[];
  _effectChainNames: types.AvailableEffectsNames[];
  _eventListeners: IEffectsEventsMap;
  activated: boolean;

  constructor() {
    this.activated = false;
    this._effectChainNames = effectsLocalStorage.getEffectChainNames() || [];
    this.effectChain = [];
    this._eventListeners = {
      effectChainChanged: (effectChainNames: types.AvailableEffectsNames[]) => {
        effectsLocalStorage.setEffectChainNames(effectChainNames);
      },
    };
  }

  async addFx() {
    this.effectChain[this.effectChain.length - 1].disconnect(Destination);
    // all new effects start at gain
    const gain = types.AvailableEffectsNames.gain;
    this._effectChainNames.push(gain);
    const gainNode = new NAME_TO_EFFECT_MAP[gain]();
    this.effectChain.push(gainNode);
    this._eventListeners.reconnect?.(this.effectChain);
    effectsLocalStorage.setEffectChainNames(this._effectChainNames);
  }

  async removeFx(fxIndex: number) {
    this.effectChain[fxIndex].disconnect().dispose();
    this._effectChainNames.splice(fxIndex, 1);
    this.effectChain.splice(fxIndex, 1);
    this._eventListeners.reconnect?.(this.effectChain);
    effectsLocalStorage.setEffectChainNames(this._effectChainNames);
    effectsSettingsLocalStorage.deleteFxSettings(fxIndex);
  }

  async changeFx(fxIndex: number, type: types.AvailableEffectsNames) {
    this.effectChain[fxIndex].disconnect().dispose();
    this._effectChainNames[fxIndex] = type;
    //@ts-ignore
    const node = new NAME_TO_EFFECT_MAP[type]();
    this.effectChain[fxIndex] = node;
    effectsLocalStorage.setEffectChainNames(this._effectChainNames);
    this._eventListeners.reconnect?.(this.effectChain);
  }

  _publishFxChange() {
    this.effectChain = this._buildEffectsChain();
    this._eventListeners?.reconnect?.(this.effectChain);
  }

  /**
   * source -> gain -> eq -> chorus -> delay -> reverb -> eq
   *                            ----------------->
   */
  _buildEffectsChain() {
    const effectChain = this._effectChainNames.map(
      //@ts-ignore
      (effectName) => new NAME_TO_EFFECT_MAP[effectName]()
    );
    //@ts-ignore
    return effectChain;
  }

  on<K extends keyof IEffectsEventsMap>(
    event: K,
    callback: IEffectsEventsMap[K]
  ) {
    this._eventListeners[event] = callback;
  }

  activate() {
    this._eventListeners.reconnect?.(this.effectChain);
  }

  deactivate() {
    this._eventListeners.disconnect?.();
  }

  changeFxSettings(fxIndex: number, param: string, value: any) {
    param = param === "value" ? "gain" : param;
    this.effectChain[fxIndex].set({ [param]: value });
    effectsSettingsLocalStorage.setFxSettings(fxIndex, param, value);
  }
}
