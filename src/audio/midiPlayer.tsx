import MidiPlayer from "midi-player-js";
import { SamplerOptions } from "tone";

import * as processing from "./processing";
import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { convertArrayBufferToAudioContext } from "utils/helper";
import { Instruments } from "./loadInstrument";
import { storageRef } from "firebaseApi/firebase";
import myCanvas from "canvas";
import myMidiPlayer from "audio";
import game from "game";
import * as constants from "./constants";

const BEAT_BUFFER = 0.02;

// needs to be in global types
interface ISynthOptions {
  synthName: types.AvailableSynthsEnum;
}
interface ISamplerOptions {
  instrument: types.Instrument;
  sample: string;
  sampleMap?: SamplerOptions["urls"];
}

interface IMyMidiPlayerEvents {
  [key: string]: Function;
}

export default class MyMidiPlayer {
  midiPlayer: MidiPlayer.Player & MidiPlayer.Event & MidiPlayer.Track;
  myTonejs?: Instruments; // not actually optional. will be set in init
  instrument: types.Instrument;
  isMetronome: boolean;
  _isBlockMetronome: boolean;
  totalTicks: number;
  isPlaying: boolean;
  isLoop: boolean;
  groupedNotes: types.IGroupedNotes[];
  songTempo: number;
  tempoPercent: number;
  localSampler?: SamplerOptions["urls"];
  samplerSource?: types.SamplerSource;
  playRange: types.PlayRange;
  ticksPerBeat: number;
  // _setPlayerStatus: (status: string) => void;
  _synthOptions?: ISynthOptions;
  _samplerOptions?: ISamplerOptions;
  // _setInstrumentLoading: (loading: boolean) => void;
  // _forceCanvasRerender: () => void;
  sampleName?: string; //etc piano-in-162
  eventListeners: IMyMidiPlayerEvents;
  playingNotes!: Set<number>;
  practiceMode: boolean;
  pressedKeys: Set<string>;

  constructor() {
    // _forceCanvasRerender: () => void // ) => void, //   groupedNotes: types.IGroupedNotes[] //   ticksPerBeat: number, //   currentTick: number, // onPlaying: ( // setInstrumentLoading: (loading: boolean) => void, // setPlayerStatus: (status: string) => void,
    console.log("Constructing new midi player");
    // for getLocalSampler because of async
    // this._setPlayerStatus = setPlayerStatus;
    // this._setInstrumentLoading = setInstrumentLoading;
    // this._forceCanvasRerender = _forceCanvasRerender;

    this.instrument = "piano";
    this.isMetronome = false;
    this.isPlaying = false;
    this.isLoop = localStorageUtils.getIsLoop() || false;
    this.totalTicks = 0;
    this._isBlockMetronome = false;
    this.groupedNotes = [];
    this.songTempo = 100;
    this.ticksPerBeat = 0;
    this.tempoPercent = 1;
    this.practiceMode = false;
    this.playRange = { startTick: 0, endTick: 0 };
    this.localSampler = undefined;
    const cachedSampler =
      localStorageUtils.getSamplerSource() || types.SamplerSourceEnum.synth;
    this.samplerSource =
      cachedSampler === types.SamplerSourceEnum.cachedLocal
        ? types.SamplerSourceEnum.local
        : cachedSampler; // force rerender in useInstrument and getLocalSampler;
    this.sampleName = localStorageUtils.getSampleName() as string;
    this.eventListeners = {};
    this.resetPlayingNotes();
    this.pressedKeys = new Set();

    // init should be here but its await so it cant
    // should be safe to say string because when useSample is chosen it would save to local storage

    this._handleOnPlaying = this._handleOnPlaying.bind(this);
    this._handleFileLoaded = this._handleFileLoaded.bind(this);
    this._handleOnMidiEvent = this._handleOnMidiEvent.bind(this);
    this.resetPlayingNotes = this.resetPlayingNotes.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.restart = this.restart.bind(this);
    this.stop = this.stop.bind(this);
    this.setTempo = this.setTempo.bind(this);
    this.getIsPlaying = this.getIsPlaying.bind(this);
    this.downloadMidiFromFirebase = this.downloadMidiFromFirebase.bind(this);
    this.loadArrayBuffer = this.loadArrayBuffer.bind(this);
    this.skipToTick = this.skipToTick.bind(this);
    this.setTempoPercent = this.setTempoPercent.bind(this);
    this.checkIfSampler = this.checkIfSampler.bind(this);
    this.setSamplerSource = this.setSamplerSource.bind(this);
    this._initToneJs = this._initToneJs.bind(this);
    this.getCurrentTick = this.getCurrentTick.bind(this);
    this.handleOnDownloaded = this.handleOnDownloaded.bind(this);
    this.on = this.on.bind(this);
    this.enablePracticeMode = this.enablePracticeMode.bind(this);
    this.disablePracticeMode = this.disablePracticeMode.bind(this);

    const midiPlayer = new MidiPlayer.Player() as MidiPlayer.Player &
      MidiPlayer.Event &
      MidiPlayer.Track;

    // midiPlayer.on("playing", (currentTick: types.Tick) => {
    //   this._handleOnPlaying(currentTick, onPlaying);
    // });
    midiPlayer.on("fileLoaded", this._handleFileLoaded);
    midiPlayer.on("midiEvent", this._handleOnMidiEvent);
    this.midiPlayer = midiPlayer;
  }

  on(event: string, callback: Function) {
    if (event === "playing") {
      this.midiPlayer.on("playing", (currentTick: types.Tick) => {
        this._handleOnPlaying(currentTick, callback);
      });
    }
    this.eventListeners[event] = callback;
    // playing, willMount, mounted, willDownloadMidi, downloadedMidi, willImport, imported
  }

  _handleOnPlaying(
    currentTick: types.Tick,
    callback: Function
    // callback: (
    //   currentTick: number,
    //   ticksPerBeat: number,
    //   types: types.IGroupedNotes[]
    // ) => void
  ) {
    // this._forceCanvasRerender();
    // @ts-ignore
    const ticksPerBeat_ = this.midiPlayer.getDivision().division;

    /**
     const remainder = currentTick.tick % ticksPerBeat_;
     const progressToOneBeat = currentTick.tick % ticksPerBeat_ / (ticksPerBeat_ * 4); // 1 is on the beat
     const fourthBeat = progressToOneBeat <= 0.0 + BEAT_BUFFER;
     if (this.isMetronome && fourthBeat) {
    */
    if (
      this.isMetronome &&
      (currentTick.tick % ticksPerBeat_) / (ticksPerBeat_ * 4) <=
        0.0 + BEAT_BUFFER
    ) {
      // dont play if played once already
      if (!this._isBlockMetronome) {
        this.myTonejs?.playMetronome();
      }
      this._isBlockMetronome = true;
    } else {
      this._isBlockMetronome = false;
    }

    // handle song loop
    // if isPlaying && (songEnded || (hasPlayRange && playRangeReached))
    if (
      this.isPlaying &&
      (currentTick.tick >= this.totalTicks ||
        (this.playRange.startTick !== this.playRange.endTick &&
          currentTick.tick >= this.playRange.endTick))
    ) {
      this.myTonejs?.clearPlayingNotes();
      if (this.isLoop) {
        this.midiPlayer.skipToTick(this.playRange.startTick);
        this.play();
      } else {
        this.isPlaying = false;
        if (this.playRange.startTick) {
          this.midiPlayer.skipToTick(this.playRange.startTick);
        } else {
          this.restart();
        }
      }
    }
    if (!this.practiceMode) {
      const playingNotes: Set<number> = new Set();
      for (const note of this.groupedNotes) {
        if (currentTick.tick >= note.on && currentTick.tick <= note.off) {
          playingNotes.add(note.x);
        }
      }
      this.playingNotes = playingNotes;
    }

    callback();
  }

  _handleFileLoaded() {
    const allEvents: MidiPlayer.Event[] = this.midiPlayer.getEvents();
    this.isPlaying = false;

    const groupedNotes: types.IGroupedNotes[] = processing.groupNotes(
      allEvents
    );
    this.totalTicks = groupedNotes[groupedNotes.length - 1].off;
    this.groupedNotes = groupedNotes;
    // @ts-ignore
    this.ticksPerBeat = this.midiPlayer.getDivision().division;
  }

  _handleOnMidiEvent(midiEvent: any) {
    if (midiEvent.name === "Set Tempo") {
      this.songTempo = this.midiPlayer.tempo; //this.midiPlayer.tempo?
      // const customizedTempo = this.midiPlayer.tempo * this.tempoPercent;
      this.setTempo(this.midiPlayer.tempo * this.tempoPercent);
    } else if (
      midiEvent.velocity !== 0 &&
      midiEvent.name === "Note on" &&
      !myMidiPlayer.practiceMode
    ) {
      // some stupid midi can have note on but 0 velocity to represent note off
      this.myTonejs?.triggerAttack(
        midiEvent.noteName,
        midiEvent.velocity / 100
      );
    } else if (midiEvent.velocity === 0 || midiEvent.name === "Note off") {
      if (!myMidiPlayer.practiceMode) {
        this.myTonejs?.triggerRelease(midiEvent.noteName);
      }
    }
  }

  setLocalSampler(sampler: SamplerOptions["urls"]) {
    this.localSampler = sampler;
  }

  setPlayRange(startTick: number, endTick: number) {
    this.playRange = { startTick, endTick };
  }

  play(noSkip = false, skipDispatch = false) {
    this.myTonejs?.clearPlayingNotes();
    if (!noSkip && this.playRange.startTick !== 0) {
      this.midiPlayer.skipToTick(this.playRange.startTick);
    }
    if (!skipDispatch) {
      this.isPlaying = true;
    }
    this.midiPlayer.play();
    this._isBlockMetronome = false;
    this.eventListeners.actioned();
    game.resetGame();
  }

  stop() {
    this.myTonejs?.clearPlayingNotes();
    this.isPlaying = false;
    this.midiPlayer.stop();
    this.eventListeners.actioned();
  }

  pause() {
    this.myTonejs?.clearPlayingNotes();
    this.isPlaying = false;
    this.midiPlayer.pause();
    this.eventListeners.actioned();
  }

  restart() {
    this.myTonejs?.clearPlayingNotes();
    this.skipToPercent(0);
    this.setPlayRange(0, 0);
    this.eventListeners.actioned();
  }

  skipToPercent(percent: number) {
    this.myTonejs?.clearPlayingNotes();
    this.midiPlayer.skipToPercent(percent);
    if (this.isPlaying) {
      // actioned included in play
      this.play(true, true);
    } else {
      this.eventListeners.actioned();
    }
  }

  skipToTick(tick: number) {
    this.myTonejs?.clearPlayingNotes();
    this.midiPlayer.skipToTick(tick);
    if (this.isPlaying) {
      this.play(true, true);
    } else {
      this.eventListeners.actioned();
    }
  }

  setTempo(tempo: number) {
    // it is there stupid
    // @ts-ignore
    this.midiPlayer.setTempo(tempo);
    this.eventListeners.actioned();
  }

  async setSamplerSource(source: types.SamplerSource) {
    this.samplerSource = source;
    localStorageUtils.setSamplerSource(source);
    await this._initToneJs();
    // after sample set
    this.eventListeners.actioned();
  }

  getTotalTicks(): number {
    return this.totalTicks;
  }

  getTicksPerBeat(): number {
    return this.ticksPerBeat;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setTempoPercent(percent: number) {
    this.tempoPercent = percent / 100;
    const newValue = (this.songTempo * percent) / 100;
    // @ts-ignore
    this.midiPlayer.setTempo(newValue);
    this.eventListeners.actioned();
  }

  getIsLoop() {
    return this.isLoop;
  }

  setIsLoop(isLoop: boolean) {
    this.isLoop = isLoop;
    localStorageUtils.setIsLoop(isLoop);
    this.eventListeners.actioned();
  }

  getIsMetronome() {
    return this.isMetronome;
  }

  setIsMetronome(isMetronome: boolean) {
    this.isMetronome = isMetronome;
    this.eventListeners.actioned();
  }

  checkIfSampler(): boolean {
    if (this.samplerSource) {
      return [
        types.SamplerSourceEnum.cachedLocal,
        types.SamplerSourceEnum.local,
        types.SamplerSourceEnum.server,
      ].includes(this.samplerSource);
    } else {
      return false;
    }
  }

  getSampleName() {
    return this.sampleName;
  }

  setSampleName(sampleName: string) {
    this.sampleName = sampleName;
  }

  getCurrentTick(): number {
    return this.midiPlayer.getCurrentTick();
  }

  async downloadMidiFromFirebase(songId: string) {
    this.eventListeners?.willDownloadMidi();
    const midiRef = storageRef.child("midi").child(`${songId}.mid`);
    const url = await midiRef.getDownloadURL();
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onload = () => this.handleOnDownloaded(xhr);
    xhr.onerror = () => {
      // probably cors
    };
    xhr.open("GET", url);
    xhr.send();
  }

  handleOnDownloaded(xhr: XMLHttpRequest) {
    const blob = xhr.response;
    this.loadArrayBuffer(blob);
    console.log("Finished downloading");
    this.tempoPercent = 1;
    myCanvas.buildNotes();
    game.buildPlayMap();
    this.eventListeners?.downloadedMidi();
  }

  async _initToneJs() {
    this.eventListeners.willSetTone();
    const pastEventListeners = this.myTonejs?.eventListeners;
    this.myTonejs?.destroy();
    if (this.samplerSource === types.SamplerSourceEnum.server) {
      // if its useSample, then it must have this.sampleName
      this.myTonejs = new Instruments(true, undefined, {
        instrument: this.instrument,
        sample: this.sampleName as string,
      });
    } else if (
      this.samplerSource === types.SamplerSourceEnum.local ||
      this.samplerSource === types.SamplerSourceEnum.cachedLocal
    ) {
      const sampleMap = this.localSampler;
      this.myTonejs = new Instruments(true, undefined, {
        instrument: this.instrument,
        sample: this.sampleName as string,
        sampleMap,
      });
    } else {
      this.myTonejs = new Instruments(false);
    }
    this.myTonejs.on(
      "downloadingSamples",
      this.eventListeners?.downloadingSamples
    );
    await this.myTonejs.init(); // must be here because construct cannot be async
    if (pastEventListeners) {
      Object.entries(pastEventListeners).forEach(([event, func]) => {
        this.myTonejs?.on(event, func);
      });
    }
    this.eventListeners.toneSet();
  }

  async init() {
    if (!this.myTonejs) {
      await this.fetchLocalSampler();
      console.log("Constructing My MidiPlayer");
      this.eventListeners?.willMount();
      await this._initToneJs();
      this.eventListeners?.mounted();
    }
  }

  async fetchLocalSampler() {
    const localSampler: types.ArrayBufferMap = await indexedDbUtils.getLocalSamplerArrayBuffer();
    const userLastSampler = localStorageUtils.getSamplerSource();
    const wasUsingLocal =
      userLastSampler === types.SamplerSourceEnum.local ||
      userLastSampler === types.SamplerSourceEnum.cachedLocal;
    if (wasUsingLocal && localSampler) {
      this.localSampler = await convertArrayBufferToAudioContext(localSampler);
      this.setSamplerSource(types.SamplerSourceEnum.cachedLocal);
    }
  }

  async loadArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.eventListeners?.import();
    await this.midiPlayer.loadArrayBuffer(arrayBuffer);
    myCanvas.buildNotes();
    game.buildPlayMap();
    //@ts-ignore
    this.eventListeners?.imported();
    this.eventListeners.actioned();
  }

  enablePracticeMode() {
    this.practiceMode = true;
    myCanvas.background.bottomTiles.showText();
    myCanvas.flashingColumns.unFlashAll();
    myCanvas.flashingBottomTiles.unFlashAll();
    this.resetPlayingNotes();
    game.enable();
    this.eventListeners.actioned();
  }

  disablePracticeMode() {
    this.practiceMode = false;
    myCanvas.background.bottomTiles.hideText();
    game.disable();
    this.eventListeners.actioned();
  }

  resetPlayingNotes() {
    this.playingNotes = new Set();
  }

  cleanup() {
    this.stop();
    this.midiPlayer.on("playing", () => {});
    this.myTonejs?.cleanUp();
    console.log("Cleaned Midi Player");
  }
}
