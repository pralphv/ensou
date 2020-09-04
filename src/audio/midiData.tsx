import { useEffect, useRef, useState } from "react";

import { RootState } from "app/rootReducer";
import { useSelector, useDispatch } from "react-redux";

import { Player as SoundFontPlayer } from "soundfont-player";

import MidiPlayer from "midi-player-js";

import { now } from "tone";

import { useInstrument } from "./loadInstrument";
import * as types from "./types";
import * as processing from "./processing";
import {
  setMidiNotPlaying,
  setMidiPlaying,
  setPlayRange,
} from "features/midiPlayerStatus/midiPlayerStatusSlice";
import { useEventListener, useStateToRef } from "utils/customHooks";
import { MidiStatus } from "features/midiPlayerStatus/constants";
import { PlayRange } from "features/midiPlayerStatus/types";

const BEAT_BUFFER = 0.02;

type MidiPlayerType = MidiPlayer.Player & MidiPlayer.Event & MidiPlayer.Track;

function useMidiData(): [
  () => MidiPlayerType | undefined,
  types.MidiFunctions,
  types.GroupedNotes[]
] {
  const dispatch = useDispatch();
  const isMetronome: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.metronome
  );
  const tempoChange: number = useSelector(
    (state: RootState) => state.midiPlayerStatus.tempo
  );
  const isPlaying: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.isPlaying
  );
  const isLoop: boolean = useSelector(
    (state: RootState) => state.midiPlayerStatus.loop
  );
  const midiStatus: string = useSelector(
    (state: RootState) => state.midiPlayerStatus.status
  );
  const playRange: PlayRange = useSelector(
    (state: RootState) => state.midiPlayerStatus.playRange
  );
  const [currentTick, setCurrentTick] = useState<number>(0); // just for force rerendering

  // sadly types provided by libraries are incomplete
  const instrumentRef = useRef<SoundFontPlayer>();
  const midiPlayerRef = useRef<
    MidiPlayer.Player & MidiPlayer.Event & MidiPlayer.Track
  >();
  const groupedNotes = useRef<types.GroupedNotes[]>([]);
  const lastTick = useRef<number>(0);
  const originalTempoRef = useRef<number>();
  const ticksPerBeat = useRef<number>();

  const isLoopRef = useStateToRef(isLoop);
  const playRangeRef = useStateToRef(playRange);
  const isMetronomeRef = useStateToRef(isMetronome);
  const tempoChangeRef = useStateToRef(tempoChange);
  const midiStatusRef = useStateToRef(midiStatus);
  const isPlayingRef = useStateToRef(isPlaying);

  useEventListener("wheel", (e) => {
    // scroll up and down
    if (midiPlayerRef.current) {
      const currentTick: number = midiPlayerRef.current.getCurrentTick();
      let newTick: number = currentTick + e.deltaY / 2;
      const SCROLL_BUFFER: number = 300;
      const withinUpperLimit = newTick + SCROLL_BUFFER < lastTick.current;
      const withinLowerLimit = newTick > 0;
      if (withinUpperLimit && withinLowerLimit) {
        midiPlayerRef.current?.skipToTick(newTick);
        fakePlay();
      }
    }
  });

  function getMidiPlayer(): MidiPlayerType | undefined {
    return midiPlayerRef.current;
  }

  function getCurrentTick(): number | undefined {
    return midiPlayerRef.current?.getCurrentTick();
  }

  function getSongPercentRemaining(): number | undefined {
    return midiPlayerRef.current?.getSongPercentRemaining();
  }

  function loadArrayBuffer(blob: XMLHttpRequest["response"]): void {
    midiPlayerRef.current?.loadArrayBuffer(blob);
  }

  function getTicksPerBeat(): number | undefined {
    try {
      // @ts-ignore
      return midiPlayerRef.current?.getDivision()?.division;
    } catch {
      return undefined;
    }
  }
  function getTotalTicks(): number | undefined {
    return midiPlayerRef.current?.getTotalTicks();
  }

  function changeTempo() {
    if (tempoChangeRef.current && originalTempoRef.current) {
      const tempoChange = tempoChangeRef.current / 100;
      // it is there stupid
      // @ts-ignore
      midiPlayerRef.current?.setTempo(originalTempoRef.current * tempoChange);
    }
  }

  function play(noSkip = false, skipDispatch = false) {
    if (midiStatusRef.current === MidiStatus.MidiNotLoaded) {
      return;
    }
    if (!noSkip && playRangeRef?.current?.startTick !== 0) {
      midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
    }
    if (!skipDispatch) {
      dispatch(setMidiPlaying());
    }
    midiPlayerRef.current?.play();
  }

  function stop() {
    dispatch(setMidiNotPlaying());
    midiPlayerRef.current?.stop();
  }

  function pause() {
    dispatch(setMidiNotPlaying());
    midiPlayerRef.current?.pause();
  }

  function restart() {
    skipToPercent(0);
    dispatch(setPlayRange({ startTick: 0, endTick: 0 }));
  }
  /**
   * To make canvas rerender
   */
  function fakePlay() {
    play(true, true);
    if (!isPlayingRef.current) {
      setTimeout(pause, 80);
    }
  }

  /**
   * After skipping, only midi is skipped.
   * Canvas is still in old position.
   * So play slightly to update cavas.
   * @param percent target percentage
   */
  function skipToPercent(percent: number) {
    if (midiStatusRef.current !== MidiStatus.MidiNotLoaded) {
      midiPlayerRef.current?.skipToPercent(percent);
      fakePlay();
    }
  }

  const intrumentApi = useInstrument();
  useEffect(() => {
    midiPlayerRef.current = new MidiPlayer.Player() as MidiPlayer.Player &
      MidiPlayer.Event &
      MidiPlayer.Track;

    midiPlayerRef.current.on("playing", (currentTick: types.Tick) => {
      // handle metronome
      setCurrentTick(currentTick.tick);
      const ticksPerBeat_ = getTicksPerBeat() as number;
      const remainder = currentTick.tick % ticksPerBeat_;
      const progressToOneBeat = remainder / (ticksPerBeat_ * 4); // 1 is on the beat
      const fourthBeat = progressToOneBeat <= 0.0 + BEAT_BUFFER;
      const firstBeat =
        progressToOneBeat <= 0.25 + BEAT_BUFFER && progressToOneBeat >= 0.25;
      const secondBeat =
        progressToOneBeat <= 0.5 + BEAT_BUFFER && progressToOneBeat >= 0.5;
      const thirdBeat =
        progressToOneBeat <= 0.75 + BEAT_BUFFER && progressToOneBeat >= 0.75;
      if (
        isMetronomeRef.current &&
        (firstBeat || secondBeat || thirdBeat || fourthBeat)
      ) {
        instrumentRef.current?.play("A0");
      }

      // handle song loop
      const songEnded: boolean = currentTick.tick >= lastTick.current;
      const playRangeReached: boolean =
        currentTick.tick >= (playRangeRef?.current?.endTick as number);
      const hasPlayRange =
        (playRangeRef?.current?.startTick as number) !==
        (playRangeRef?.current?.endTick as number);

      if (
        isPlayingRef?.current &&
        (songEnded || (hasPlayRange && playRangeReached))
      ) {
        if (isLoopRef.current) {
          midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
          play();
        } else {
          dispatch(setMidiNotPlaying());
          stop();
          midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
          fakePlay();
        }
      }
    });
    midiPlayerRef.current.on("fileLoaded", () => {
      if (midiPlayerRef.current) {
        const allEvents: MidiPlayer.Event[] = midiPlayerRef.current.getEvents();
        dispatch(setMidiNotPlaying());
        const groupedNotes_: types.GroupedNotes[] = processing.groupNotes(
          allEvents
        );
        lastTick.current = groupedNotes_[groupedNotes_.length - 1].off;
        groupedNotes.current = groupedNotes_;
      }
    });
    midiPlayerRef.current.on("midiEvent", (midiEvent: any) => {
      if (midiEvent.name === "Set Tempo" && midiPlayerRef.current) {
        originalTempoRef.current = midiPlayerRef.current.tempo;
        changeTempo();
      }
      if (midiEvent.name === "Note on") {
        intrumentApi.triggerAttack(
          midiEvent.noteName,
          midiEvent.velocity / 100
        );
        return;
      } else if (midiEvent.name === "Note off") {
        intrumentApi.triggerRelease(midiEvent.noteName);
      }
    });
  }, []);
  useEffect(() => {
    changeTempo();
  }, [tempoChange, changeTempo]);

  const playerFunctions: types.MidiFunctions = {
    play,
    stop,
    pause,
    skipToPercent,
    restart,
    getCurrentTick,
    getSongPercentRemaining,
    loadArrayBuffer,
    getTicksPerBeat,
    getTotalTicks,
    changeVolume: intrumentApi.changeVolume,
    getVolumeDb: intrumentApi.getVolumeDb,
  };

  return [getMidiPlayer, playerFunctions, groupedNotes.current];
}

export default useMidiData;
