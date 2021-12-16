import { SamplerOptions, Transport, Draw } from "tone";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { convertArrayBufferToAudioContext } from "utils/helper";
import instruments from "./instruments";
import { storageRef } from "firebaseApi/firebase";
import myCanvas from "canvas";
import progressBar from "progressBar";
import myMidiPlayer from "audio";
import game from "game";
import { Midi, Track } from "@tonejs/midi";
import { PlaybackState } from "tone";
import { Note } from "@tonejs/midi/dist/Note";
import { TempoEvent } from "@tonejs/midi/dist/Header";
import { PIANO_TUNING } from "../audio/constants";
import metronome from "./metronome";

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
  instrument: types.Instrument;
  isReady: boolean;
  totalTicks: number;
  isPlaying: boolean;
  isLoop: boolean;
  groupedNotes: types.IGroupedNotes[];
  tempoPercent: number;
  localSampler?: SamplerOptions["urls"];
  samplerSource?: types.SamplerSource;
  loopPoints: types.loopPoints;
  ticksPerBeat: number;
  // _setPlayerStatus: (status: string) => void;
  _synthOptions?: ISynthOptions;
  _samplerOptions?: ISamplerOptions;
  // _setInstrumentLoading: (loading: boolean) => void;
  // _forceCanvasRerender: () => void;
  sampleName?: string; //etc piano-in-162
  eventListeners: IMyMidiPlayerEvents;
  playingNotes!: Set<number>; // might be worth to use list of bools instead
  practiceMode: boolean;
  pressedKeys: Set<string>;
  midi: Midi;
  ppq: number;
  notes: Note[];
  durationTicks: number;
  originalBpm: number;
  fps: number;
  scheduleId: number;

  constructor() {
    // _forceCanvasRerender: () => void // ) => void, //   groupedNotes: types.IGroupedNotes[] //   ticksPerBeat: number, //   currentTick: number, // onPlaying: ( // setInstrumentLoading: (loading: boolean) => void, // setPlayerStatus: (status: string) => void,
    console.log("Constructing new midi player");
    // for getLocalSampler because of async
    // this._setPlayerStatus = setPlayerStatus;
    // this._setInstrumentLoading = setInstrumentLoading;
    // this._forceCanvasRerender = _forceCanvasRerender;

    this.isReady = false; // for blocking play button. etc. no file loaded
    this.instrument = "piano";
    this.isPlaying = false;
    this.isLoop = localStorageUtils.getIsLoop() || false;
    this.totalTicks = 0;
    this.groupedNotes = [];
    this.ticksPerBeat = 0;
    this.tempoPercent = 1;
    this.practiceMode = false;
    this.loopPoints = { startTick: 0, endTick: 0 };
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
    this.midi = new Midi();
    this.notes = [];
    this.ppq = 0; // for cache
    this.durationTicks = 0; // for cache
    this.originalBpm = 0;
    this.fps = 30;
    this.scheduleId = 0;

    // init should be here but its await so it cant
    // should be safe to say string because when useSample is chosen it would save to local storage

    this._handleOnPlaying = this._handleOnPlaying.bind(this);
    this._handleFileLoaded = this._handleFileLoaded.bind(this);
    this.resetPlayingNotes = this.resetPlayingNotes.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.restart = this.restart.bind(this);
    this.stop = this.stop.bind(this);
    this.setTempo = this.setTempo.bind(this);
    this.getIsPlaying = this.getIsPlaying.bind(this);
    this.downloadMidiFromFirebase = this.downloadMidiFromFirebase.bind(this);
    this.readArrayBuffer = this.readArrayBuffer.bind(this);
    this.setTempoPercent = this.setTempoPercent.bind(this);
    this.checkIfSampler = this.checkIfSampler.bind(this);
    this.setSamplerSource = this.setSamplerSource.bind(this);
    // this._initToneJs = this._initToneJs.bind(this);
    this.handleOnDownloaded = this.handleOnDownloaded.bind(this);
    this.on = this.on.bind(this);
    this.enablePracticeMode = this.enablePracticeMode.bind(this);
    this.disablePracticeMode = this.disablePracticeMode.bind(this);
    this._scheduleNotesToPlay = this._scheduleNotesToPlay.bind(this);
    this._scheduleCanvasEvents = this._scheduleCanvasEvents.bind(this);
    this.getTotalTicks = this.getTotalTicks.bind(this);
    this.getPPQ = this.getPPQ.bind(this);
    this._setUpNewMidi = this._setUpNewMidi.bind(this);
    Transport.on("loopEnd", () => {
      this.restartStates();
      if (!this.isLoop) {
        this.stop();
      }
    });
  }

  restartStates() {
    instruments.releaseAll();
    myCanvas.onBeforePlay(); // unflash stuff
  }

  getState(): PlaybackState {
    return Transport.state;
  }

  getPPQ() {
    return this.ppq;
  }

  on(event: string, callback: Function) {
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
    // const ticksPerBeat_ = this.midiPlayer.getDivision().division;

    // /**
    //  const remainder = currentTick.tick % ticksPerBeat_;
    //  const progressToOneBeat = currentTick.tick % ticksPerBeat_ / (ticksPerBeat_ * 4); // 1 is on the beat
    //  const fourthBeat = progressToOneBeat <= 0.0 + BEAT_BUFFER;
    //  if (this.isMetronome && fourthBeat) {
    // */
    // if (
    //   this.isMetronome &&
    //   (currentTick.tick % ticksPerBeat_) / (ticksPerBeat_ * 4) <=
    //     0.0 + BEAT_BUFFER
    // ) {
    //   // dont play if played once already
    //   if (!this._isBlockMetronome) {
    //     this.myTonejs?.playMetronome();
    //   }
    //   this._isBlockMetronome = true;
    // } else {
    //   this._isBlockMetronome = false;
    // }

    // // handle song loop
    // // if isPlaying && (songEnded || (hasloopPoints && loopPointsReached))
    // if (
    //   this.isPlaying &&
    //   (currentTick.tick >= this.totalTicks ||
    //     (this.loopPoints.startTick !== this.loopPoints.endTick &&
    //       currentTick.tick >= this.loopPoints.endTick))
    // ) {
    //   this.myTonejs?.clearPlayingNotes();
    //   if (this.isLoop) {
    //     this.midiPlayer.skipToTick(this.loopPoints.startTick);
    //     this.play();
    //   } else {
    //     this.isPlaying = false;
    //     if (this.loopPoints.startTick) {
    //       this.midiPlayer.skipToTick(this.loopPoints.startTick);
    //     } else {
    //       this.restart();
    //     }
    //   }
    // }
    // if (!this.practiceMode) {
    //   this.playingNotes.clear();
    //   for (let i = 0; i < this.groupedNotes.length; i++) {
    //     // use this.groupedNotes[i] for performance
    //     if (
    //       currentTick.tick >= this.groupedNotes[i].on &&
    //       currentTick.tick <= this.groupedNotes[i].off
    //     ) {
    //       this.playingNotes.add(this.groupedNotes[i].x);
    //     }
    //   }
    // }

    callback();
  }

  _scheduleNotesToPlay(tracks: Track[]) {
    tracks.forEach((track) => {
      instruments.scheduleNotesToPlay(track.notes);
    });
  }

  _handleFileLoaded() {
    this.isPlaying = false;
    this.isReady = true;
  }

  getTotalTicks(): number {
    return this.durationTicks;
  }

  setLocalSampler(sampler: SamplerOptions["urls"]) {
    this.localSampler = sampler;
  }

  _sweepTempoEvents() {
    const tick = this.loopPoints.startTick;
    // for entering the correct tempo at given tick
    const tempos = this.midi.header.tempos;
    for (let i = 0; i < tempos.length; i++) {
      if (tempos[i].ticks <= tick) {
        this._setBpm(tempos[i].bpm, tempos[i].ticks);
      } else {
        break;
      }
    }
  }

  play() {
    this.isPlaying = true;
    myCanvas.onBeforePlay();
    this.skipToTick(this.loopPoints.startTick); // always start at loop start
    this._sweepTempoEvents();
    // need to read tempo adjustments before this start tick
    instruments.play();
    this.eventListeners.actioned();
    game.resetGame();
  }

  stop() {
    this.isPlaying = false;
    instruments.stop();
    this.eventListeners.actioned();
  }

  pause() {
    this.isPlaying = false;
    instruments.pause();
    this.eventListeners.actioned();
  }

  restart() {
    this.skipToPercent(0);
    this.setLoopPoints(0, 0);
    this.eventListeners.actioned();
  }

  skipToPercent(percent: number) {
    this.skipToTick(Math.round(this.getTotalTicks() * percent));
  }

  skipToTick(tick: number) {
    Transport.ticks = tick;
    this.restartStates();
    this.eventListeners.actioned();
  }

  setTempo(bpm: number) {
    Transport.set({ bpm });
    this.eventListeners.actioned();
  }

  async setSamplerSource(source: types.SamplerSource) {
    this.samplerSource = source;
    localStorageUtils.setSamplerSource(source);
    // await this._initToneJs();
    // after sample set
    this.eventListeners.actioned();
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setTempoPercent(percent: number) {
    this.tempoPercent = percent / 100;
    const newValue = this.originalBpm * this.tempoPercent;
    // @ts-ignore
    this.setTempo(newValue);
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

  checkIfSampler(): boolean {
    if (this.samplerSource) {
      return [
        types.SamplerSourceEnum.cachedLocal,
        types.SamplerSourceEnum.local,
        types.SamplerSourceEnum.server,
        types.SamplerSourceEnum.recorded,
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

  async downloadMidiFromFirebase(songId: string) {
    this.eventListeners?.willDownloadMidi();
    const midiRef = storageRef.child("midi").child(`${songId}.mid`);
    const url = await midiRef.getDownloadURL();
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.onload = () => this.handleOnDownloaded(xhr);
    xhr.onerror = () => {
      // probably cors
      this.eventListeners?.error();
    };
    xhr.open("GET", url);
    xhr.send();
  }

  handleOnDownloaded(xhr: XMLHttpRequest) {
    const blob = xhr.response;
    this.readArrayBuffer(blob);
    console.log("Finished downloading");
    this.tempoPercent = 1;
    myCanvas.buildNotes();
    game.buildPlayMap();
    this.eventListeners?.downloadedMidi();
  }

  // async _initToneJs() {
  //   this.eventListeners.willSetTone();
  //   const pastEventListeners = this.myTonejs?.eventListeners;
  //   this.myTonejs?.destroy();
  //   if (this.samplerSource === types.SamplerSourceEnum.server) {
  //     // if its useSample, then it must have this.sampleName
  //     this.myTonejs = new Instruments(true, undefined, {
  //       instrument: this.instrument,
  //       sample: this.sampleName as string,
  //     });
  //   } else if (
  //     this.samplerSource === types.SamplerSourceEnum.local ||
  //     this.samplerSource === types.SamplerSourceEnum.cachedLocal ||
  //     this.samplerSource === types.SamplerSourceEnum.recorded
  //   ) {
  //     const sampleMap = this.localSampler;
  //     this.myTonejs = new Instruments(true, undefined, {
  //       instrument: this.instrument,
  //       sample: this.sampleName as string,
  //       sampleMap,
  //     });
  //   } else {
  //     this.myTonejs = new Instruments(false);
  //   }
  //   this.myTonejs.on(
  //     "downloadingSamples",
  //     this.eventListeners?.downloadingSamples
  //   );
  //   await this.myTonejs.init(); // must be here because construct cannot be async
  //   if (pastEventListeners) {
  //     Object.entries(pastEventListeners).forEach(([event, func]) => {
  //       this.myTonejs?.on(event, func);
  //     });
  //   }
  //   this.eventListeners.toneSet();
  // }

  // async init() {
  //   if (!this.myTonejs) {
  //     await this.fetchLocalSampler();
  //     console.log("Constructing My MidiPlayer");
  //     this.eventListeners?.willMount();
  //     await this._initToneJs();
  //     this.eventListeners?.mounted();
  //   }
  // }

  async fetchLocalSampler() {
    const localSampler: types.ArrayBufferMap =
      await indexedDbUtils.getLocalSamplerArrayBuffer();
    const userLastSampler = localStorageUtils.getSamplerSource();
    const wasUsingLocal =
      userLastSampler === types.SamplerSourceEnum.local ||
      userLastSampler === types.SamplerSourceEnum.cachedLocal ||
      userLastSampler === types.SamplerSourceEnum.recorded;
    if (wasUsingLocal && localSampler) {
      this.localSampler = await convertArrayBufferToAudioContext(localSampler);
      this.setSamplerSource(types.SamplerSourceEnum.cachedLocal);
    }
  }

  async readArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.skipToTick(0);
    Transport.cancel(0);
    this.midi = new Midi(arrayBuffer);
    this._setUpNewMidi(this.midi);
    this.eventListeners?.import();
    this.isReady = true;
    myCanvas.buildNotes();
    // game.buildPlayMap();
    //@ts-ignore
    this.eventListeners?.imported();
    this.eventListeners.actioned();
  }

  setLoopPoints(startTick: number, endTick: number) {
    startTick = Math.round(startTick);
    endTick = Math.round(endTick);
    console.log({ startTick, endTick });
    if (startTick === endTick) {
      endTick = this.getTotalTicks();
    }
    Transport.setLoopPoints(`${startTick}i`, `${endTick}i`);
    this.loopPoints = { startTick, endTick };
    Transport.loop = true;
  }

  _setUpNewMidi(midi: Midi) {
    this._scheduleNoteEvents();
    this.notes = midi.tracks.map((track) => track.notes).flat();
    this.durationTicks = midi.durationTicks;
    this._scheduleTempoEvents(midi.header.tempos);
    this._scheduleNotesToPlay(midi.tracks);
    this._scheduleCanvasEvents(midi.tracks);
    this._setPpq(midi.header.ppq);
    this._setUpLoop(midi.durationTicks);
    myCanvas.setupCanvasNoteScale(midi.header.ppq);
  }

  _scheduleNoteEvents() {
    Transport.cancel(this.scheduleId);
    this.scheduleId = Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const tick = Transport.ticks;
        console.log({tick})
        myCanvas.render(tick);
        progressBar.render(tick);
      }, time);
    }, `${this.fps}hz`);
  }

  _setUpLoop(endTick: number) {
    this.setLoopPoints(0, endTick);
  }

  _setPpq(ppq: number) {
    Transport.PPQ = ppq;
    this.ppq = ppq;
  }

  _scheduleCanvasEvents(tracks: Track[]) {
    tracks.forEach((track) => {
      track.notes.forEach((note) => {
        const column = PIANO_TUNING[note.name];
        Transport.schedule(() => {
          myCanvas.flashingBottomTiles.flash(column);
          myCanvas.flashingColumns.flash(column);
        }, `${note.ticks}i`);
        Transport.schedule(() => {
          myCanvas.flashingBottomTiles.unflash(column);
          myCanvas.flashingColumns.unflash(column);
        }, `${note.ticks + note.durationTicks}i`);
      });
    });
  }

  _scheduleTempoEvents(tempos: TempoEvent[]) {
    tempos.forEach((tempoObj) => {
      Transport.schedule(() => {
        this._setBpm(tempoObj.bpm, tempoObj.ticks);
      }, `${tempoObj.ticks}i`);
    });
  }

  _setBpm(bpm: number, startTick: number) {
    Transport.bpm.value = bpm * this.tempoPercent;
    this.originalBpm = bpm;
    if (metronome.activated) {
      metronome.activate(startTick); // reset metronome to new tempo
    }
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

  setVolume(value: number) {
    instruments.setVolume(value);
    metronome.setVolume(value - 5);
    this.eventListeners.actioned();
  }

  getVolume(): number {
    return instruments.getVolume();
  }

  cleanup() {
    this.stop();
    // this.midiPlayer.on("playing", () => {});
    // this.myTonejs?.cleanUp();
    console.log("Cleaned Midi Player");
  }
}
