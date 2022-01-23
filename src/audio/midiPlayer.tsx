import { SamplerOptions, Transport, Draw } from "tone";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import { isLoopLocalStorage } from "utils/localStorageUtils";
import instruments from "./instruments";
import { storageRef } from "firebaseApi/firebase";
import myCanvas from "canvas";
import progressBar from "progressBar";
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
  isReady: boolean;
  totalTicks: number;
  isPlaying: boolean;
  isLoop: boolean;
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
    this.isPlaying = false;
    this.isLoop = isLoopLocalStorage.getIsLoop() || false;
    this.totalTicks = 0;
    this.ticksPerBeat = 0;
    this.tempoPercent = 1;
    this.practiceMode = false;
    this.loopPoints = { startTick: 0, endTick: 0 };
    this.localSampler = undefined;
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
    // this._initToneJs = this._initToneJs.bind(this);
    this.handleOnDownloaded = this.handleOnDownloaded.bind(this);
    this.on = this.on.bind(this);
    this.enablePracticeMode = this.enablePracticeMode.bind(this);
    this.disablePracticeMode = this.disablePracticeMode.bind(this);
    this.scheduleNotesToPlay = this.scheduleNotesToPlay.bind(this);
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
    instruments.myPolySynth.on("restart", () => {
      this.scheduleNotesToPlay();
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

  scheduleNotesToPlay() {
    this.midi.tracks.forEach((track) => {
      instruments.scheduleNotesToPlay(track.notes);
    });
  }

  addSynth() {
    // this function exists for rescheduling notes when add synth button is pressed
    instruments.myPolySynth.add();
    this.midi.tracks.forEach((track) => {
      instruments.scheduleNotesToPlayForLastInstrument(track.notes);
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
    myCanvas.highlighter.disable();
    this.eventListeners.actioned();
    this.updateCanvas(0);
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
    isLoopLocalStorage.setIsLoop(isLoop);
    this.eventListeners.actioned();
  }

  checkIfSampler(): boolean {
    return instruments.useSampler;
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

  async readArrayBuffer(arrayBuffer: ArrayBuffer) {
    this.skipToTick(0);
    instruments.cancelEvents();
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
    startTick = Math.max(startTick, 0);
    startTick = Math.round(startTick);
    endTick = Math.round(endTick);
    if (startTick === endTick) {
      endTick = this.getTotalTicks();
    }
    Transport.setLoopPoints(`${startTick}i`, `${endTick}i`);
    this.loopPoints = { startTick, endTick };
    Transport.loop = true;
  }

  _setUpNewMidi(midi: Midi) {
    Transport.cancel();
    this._scheduleDrawing();
    this.notes = midi.tracks.map((track) => track.notes).flat();
    this.durationTicks = midi.durationTicks;
    this._scheduleTempoEvents(midi.header.tempos);
    this._scheduleCanvasEvents(midi.tracks);
    this._setPpq(midi.header.ppq);
    this._setUpLoop(midi.durationTicks);
    myCanvas.setupCanvasNoteScale(midi.header.ppq);
    // only set up notes in transport last. there will be bug if not (notes release pre-maturely)
    this.scheduleNotesToPlay();
    this.updateCanvas(0);
  }

  _scheduleDrawing() {
    Transport.cancel(this.scheduleId);
    this.scheduleId = Transport.scheduleRepeat((time) => {
      Draw.schedule(() => {
        const tick = Transport.ticks;
        this.updateCanvas(tick);
      }, time);
    }, `${this.fps}hz`);
  }

  updateCanvas(tick: number) {
    myCanvas.render(tick);
    progressBar.render(tick);
  }

  _setUpLoop(endTick: number) {
    this.setLoopPoints(0, endTick);
    myCanvas.highlighter.activate();
  }

  _setPpq(ppq: number) {
    Transport.PPQ = ppq;
    this.ppq = ppq;
  }

  _scheduleCanvasEvents(tracks: Track[]) {
    // flash and unflash
    tracks.forEach((track) => {
      track.notes.forEach((note) => {
        const column = PIANO_TUNING[note.name];
        Transport.schedule(() => {
          myCanvas.flash(column);
        }, `${note.ticks}i`);
        Transport.schedule(() => {
          myCanvas.unflash(column);
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

  async useRecordedSound(note: string, arrayBuffer: ArrayBuffer) {
    await instruments.processRecordedSound(note, arrayBuffer);
    await this.activateSampler();
  }

  async useDownloadedSample() {
    instruments.mySampler.processDownloadedSample();
    await this.activateSampler();
  }

  async useLocalSample() {
    await this.activateSampler();
  }

  async activateSampler() {
    await instruments.activateSampler();
    this.scheduleNotesToPlay();
    this.eventListeners.actioned();
  }

  activatePolySynth() {
    instruments.activatePolySynth();
    this.scheduleNotesToPlay();  // synth -> sampler -> synth may cause synth to have 2 duplicate events
    this.eventListeners.actioned();
  }

  cleanup() {
    this.stop();
    // this.midiPlayer.on("playing", () => {});
    // this.myTonejs?.cleanUp();
    console.log("Cleaned Midi Player");
  }
}
