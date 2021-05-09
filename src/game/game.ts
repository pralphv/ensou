import * as constants from "./constants";
import myCanvas from "canvas";
import { PIANO_TUNING } from "audio/constants";
import myMidiPlayer from "audio";

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
  playMap: IPlayMap;
  notesToBePlayed: INotesToBePlayed;
  originalNotesToBePlayed: INotesToBePlayed; // for resetting

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

  enable() {
    window.addEventListener("keydown", this.handleOnKeyDown);
    window.addEventListener("keyup", this.handleOnKeyUp);
    this.buildPlayMap();
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
    if (constants.AVAILABLE_KEYS.has(e.code) && !this.pressedKeys.has(e.code)) {
      const note = constants.KEY_NOTE_MAP[e.code];
      myMidiPlayer.myTonejs?.triggerAttack(note, 1);
      this.pressedKeys.add(e.code);
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
  }

  handleOnKeyUp(e: KeyboardEvent) {
    this.pressedKeys.delete(e.code);
    if (constants.AVAILABLE_KEYS.has(e.code)) {
      const note = constants.KEY_NOTE_MAP[e.code];
      myMidiPlayer.myTonejs?.triggerRelease(note);
      myMidiPlayer.playingNotes.delete(PIANO_TUNING[note]);
      myCanvas.render();
    }
  }

  render() {
    // used in midiPlayer handleOnPlaying
    if (this.playMap[myMidiPlayer.getCurrentTick() - 1]) {
      for (const id of this.playMap[myMidiPlayer.getCurrentTick() - 1]) {
        const currentTick = myMidiPlayer.getCurrentTick();
        const off = this.notesToBePlayed[id].lastTick;
        if (
          this.notesToBePlayed[id].played === false &&  // not played
          myMidiPlayer.getCurrentTick() >= this.notesToBePlayed[id].lastTick  // passed timing 
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
