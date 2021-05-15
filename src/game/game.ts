import * as constants from "./constants";
import myCanvas from "canvas";
import { PIANO_TUNING, NOTE_NUMBER_TO_NOTE } from "audio/constants";
import myMidiPlayer from "audio";
import * as types from "./types";
import { getKeyBindings } from "utils/localStorageUtils/localStorageUtils";
import * as midiKeyboard from "./midiKeyboard";

interface IPlayMap {
  [key: number]: number[];
}

interface INotesToBePlayed {
  [key: number]: INoteStatus;
}

interface INoteStatus {
  note: string;
  played: boolean;
  lastTick: number;
}

class Game {
  score: number;
  pressedKeys: Set<string>;
  playMap: IPlayMap; // detects if user played at the right timing
  notesToBePlayed: INotesToBePlayed; // notes that the player is supposed to play
  originalNotesToBePlayed: INotesToBePlayed; // for resetting
  keyNoteMap!: types.IKeyNoteMap;
  availableKeys!: Set<string>; // filter only keys that are used in the key binding
  noteLabelMap!: types.INoteKeyboardLabel;

  constructor() {
    this.score = 0;
    this.pressedKeys = new Set();
    this.playMap = {};
    this.notesToBePlayed = {};
    this.originalNotesToBePlayed = {};

    this.addScore = this.addScore.bind(this);
    this.resetScore = this.resetScore.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.buildPlayMap = this.buildPlayMap.bind(this);
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);
    this.handleOnKeyUp = this.handleOnKeyUp.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.loadKeyNoteMap = this.loadKeyNoteMap.bind(this);
    this.triggerAttack = this.triggerAttack.bind(this);
    this.triggerRelease = this.triggerRelease.bind(this);
    this.handleMidiPlayerOnClick = this.handleMidiPlayerOnClick.bind(this);
    this.loadKeyNoteMap();
  }

  loadKeyNoteMap() {
    this.keyNoteMap = getKeyBindings() || constants.DEFAULT_KEY_NOTE_MAP;
    this.availableKeys = new Set(Object.keys(this.keyNoteMap));

    this.noteLabelMap = {};

    Object.values(this.keyNoteMap).forEach((obj) => {
      this.noteLabelMap[obj.note] = obj.label;
    });
    myCanvas?.background.resetBottomTiles(true);
  }

  addScore() {
    this.score++;
  }

  resetScore() {
    this.score = 0;
  }

  resetGame() {
    this.resetScore();
    this.notesToBePlayed = JSON.parse(
      JSON.stringify(this.originalNotesToBePlayed)
    );
    myCanvas.comboDisplay.draw(this.score);
  }

  async enable() {
    this.buildPlayMap();
    window.addEventListener("keydown", this.handleOnKeyDown);
    window.addEventListener("keyup", this.handleOnKeyUp);
    const midiKeyboardEnabled = await midiKeyboard.enableMidiKeyboard();
    if (midiKeyboardEnabled) {

    }
    midiKeyboard.onClick(this.handleMidiPlayerOnClick);
  }

  handleMidiPlayerOnClick(message: any) {
    // 0 is command, 1 is note, 2 is velocity
    const note = NOTE_NUMBER_TO_NOTE[message.data[1]];
    // a velocity value might not be included with a noteOff command
    const velocity = message.data.length > 2 ? message.data[2] : 0;
    switch (message.data[0]) {
      case 144: // note on
        if (velocity > 0) {
          this.triggerAttack(note, velocity);
        } else {
          this.triggerRelease(note);
        }
        break;
      case 128: // note off
        this.triggerRelease(note);
        break;
    }
  }

  buildPlayMap() {
    const playMap: IPlayMap = {};
    const notesToBePlayed: INotesToBePlayed = {};

    for (const note of myMidiPlayer.groupedNotes) {
      notesToBePlayed[note.id] = {
        played: false,
        note: note.noteName,
        lastTick: note.on + 99,
      };
      for (let i = -100; i < 120; i++) {
        if (!playMap[i + note.on]) {
          playMap[i + note.on] = [note.id];
        } else {
          playMap[i + note.on].push(note.id);
        }
      }
    }
    this.playMap = playMap;
    this.notesToBePlayed = notesToBePlayed;
    this.originalNotesToBePlayed = JSON.parse(JSON.stringify(notesToBePlayed));
  }

  disable() {
    window.removeEventListener("keydown", this.handleOnKeyDown);
    window.removeEventListener("keyup", this.handleOnKeyUp);
  }

  handleOnKeyDown(e: KeyboardEvent) {
    console.log({ e });
    console.log(e.code);
    if (this.availableKeys.has(e.code) && !this.pressedKeys.has(e.code)) {
      this.pressedKeys.add(e.code);
      const note = this.keyNoteMap[e.code];
      this.triggerAttack(note.note);
    }
  }

  handleOnKeyUp(e: KeyboardEvent) {
    this.pressedKeys.delete(e.code);
    if (this.availableKeys.has(e.code)) {
      const note = this.keyNoteMap[e.code];
      this.triggerRelease(note.note);
    }
  }

  triggerAttack(note: string, velocity: number = 1) {
    myMidiPlayer.myTonejs?.triggerAttack(note, velocity);
    myMidiPlayer.playingNotes.add(PIANO_TUNING[note]);
    myCanvas.render();
    if (this.playMap[myMidiPlayer.getCurrentTick()]) {
      for (const id of this.playMap[myMidiPlayer.getCurrentTick()]) {
        if (
          this.notesToBePlayed[id].note === note &&
          !this.notesToBePlayed[id].played
        ) {
          this.notesToBePlayed[id].played = true;
          this.addScore();
          myCanvas.comboDisplay.draw(this.score);
          break;
        }
      }
    }
  }

  triggerRelease(note: string) {
    myMidiPlayer.myTonejs?.triggerRelease(note);
    myMidiPlayer.playingNotes.delete(PIANO_TUNING[note]);
    myCanvas.render();
  }

  render() {
    // used in midiPlayer handleOnPlaying
    if (this.playMap[myMidiPlayer.getCurrentTick() - 1]) {
      for (const id of this.playMap[myMidiPlayer.getCurrentTick() - 1]) {
        if (
          this.notesToBePlayed[id].played === false && // not played
          myMidiPlayer.getCurrentTick() >= this.notesToBePlayed[id].lastTick // passed timing
        ) {
          this.resetScore();
          myCanvas.comboDisplay.draw(this.score);
          break;
        }
      }
    }
  }
}

export default Game;
