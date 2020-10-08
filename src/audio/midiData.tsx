import { useEffect, useRef, useState, useCallback } from "react";

import MidiPlayer from "midi-player-js";

import { useInstrument } from "./loadInstrument";
import * as processing from "./processing";

import * as types from "types";

const BEAT_BUFFER = 0.02;
interface Tick {
  tick: number;
}

function useMidiData(): [types.IMidiFunctions, types.IGroupedNotes[]] {
  const playRangeRef = useRef<types.PlayRange>({ startTick: 0, endTick: 0 });
  const [currentTick, setCurrentTick] = useState<number>(0); // just for force rerendering

  // sadly types provided by libraries are incomplete
  const ticksPerBeatRef = useRef<number>(0);
  const midiPlayerRef = useRef<
    MidiPlayer.Player & MidiPlayer.Event & MidiPlayer.Track
  >();
  const groupedNotes = useRef<types.IGroupedNotes[]>([]);
  const totalTicksRef = useRef<number>(0);
  const originalTempoRef = useRef<number>();
  const isPlayingRef = useRef<boolean>();
  const isSoundEffectRef = useRef<boolean>(true);
  const isLoopRef = useRef<boolean>(true);
  const isMetronomeRef = useRef<boolean>(false);
  const tempoPercentRef = useRef<number>(1); // tempo % and tempo is different
  // midi can change tempo, so need a % to keep the user's change
  const instrumentRef = useRef<types.Instrument>("piano");
  const isHqRef = useRef<boolean>(false);
  const sampleRef = useRef<string>("PedalOffMezzoForte1");

  function getInstrument(): types.Instrument {
    return instrumentRef.current;
  }

  function setInstrument(instrument: types.Instrument) {
    instrumentRef.current = instrument;
  }

  function getSample(): string {
    return sampleRef.current;
  }

  function setSample(sample: string) {
    sampleRef.current = sample;
  }

  function getIsHq(): boolean {
    return isHqRef.current;
  }

  function setIsHq() {
    isHqRef.current = true;
  }

  function setIsNotHq() {
    isHqRef.current = false;
  }

  function getTempo(): number {
    if (midiPlayerRef.current && originalTempoRef.current) {
      return midiPlayerRef.current?.tempo / originalTempoRef?.current || 100;
    } else {
      return 100;
    }
  }

  function setTempo(tempo: number) {
    // it is there stupid
    // @ts-ignore
    midiPlayerRef.current?.setTempo(tempo);
  }

  function setTempoPercent(percent: number) {
    if (originalTempoRef.current) {
      tempoPercentRef.current = percent / 100;
      const newValue = (originalTempoRef.current * percent) / 100;
      // @ts-ignore
      midiPlayerRef.current?.setTempo(newValue);
    }
  }

  function getIsLoop(): boolean {
    return isLoopRef.current;
  }

  function setIsLoop() {
    isLoopRef.current = true;
  }

  function setIsNotLoop() {
    isLoopRef.current = false;
  }

  function getIsMetronome(): boolean {
    return isMetronomeRef.current;
  }

  function setIsMetronome() {
    isMetronomeRef.current = true;
  }

  function setIsNotMetronome() {
    isMetronomeRef.current = false;
  }

  function getPlayRange(): types.PlayRange {
    return playRangeRef.current;
  }

  function setPlayRange(playRange: types.PlayRange) {
    playRangeRef.current = playRange;
  }

  function getIsPlaying(): boolean | undefined {
    return isPlayingRef.current;
  }

  function setIsPlaying() {
    isPlayingRef.current = true;
  }

  function setIsNotPlaying() {
    isPlayingRef.current = false;
  }

  function getIsSoundEffect(): boolean {
    return isSoundEffectRef.current;
  }

  function setIsSoundEffect() {
    isSoundEffectRef.current = true;
  }

  function setIsNotSoundEffect() {
    isSoundEffectRef.current = false;
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

  function getTicksPerBeat(): number {
    return ticksPerBeatRef.current;
  }

  function getTotalTicks(): number | undefined {
    return totalTicksRef.current;
  }

  function play(noSkip = false, skipDispatch = false) {
    if (!noSkip && playRangeRef?.current?.startTick !== 0) {
      midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
    }
    if (!skipDispatch) {
      setIsPlaying();
    }
    midiPlayerRef.current?.play();
  }

  function stop() {
    setIsNotPlaying();
    midiPlayerRef.current?.stop();
  }

  function pause() {
    setIsNotPlaying();
    midiPlayerRef.current?.pause();
  }

  function restart() {
    skipToPercent(0);
    setPlayRange({ startTick: 0, endTick: 0 });
  }

  function skipToPercent(percent: number) {
    midiPlayerRef.current?.skipToPercent(percent);
    if (isPlayingRef.current) {
      play(true, true);
    }
  }

  function skipToTick(tick: number) {
    midiPlayerRef.current?.skipToTick(tick);
    if (isPlayingRef.current) {
      play(true, true);
    }
  }

  const instrumentApi = useInstrument(
    getIsSoundEffect,
    getInstrument,
    getSample,
    getIsHq
  );
  useEffect(() => {
    midiPlayerRef.current = new MidiPlayer.Player() as MidiPlayer.Player &
      MidiPlayer.Event &
      MidiPlayer.Track;

    midiPlayerRef.current.on("playing", (currentTick: Tick) => {
      // handle metronome
      setCurrentTick(currentTick.tick);
      const ticksPerBeat_ = getTicksPerBeat() as number;
      const remainder = currentTick.tick % ticksPerBeat_;
      const progressToOneBeat = remainder / (ticksPerBeat_ * 4); // 1 is on the beat
      const fourthBeat = progressToOneBeat <= 0.0 + BEAT_BUFFER;
      const secondBeat =
        progressToOneBeat <= 0.5 + BEAT_BUFFER && progressToOneBeat >= 0.5;
      if (isMetronomeRef.current && (secondBeat || fourthBeat)) {
        instrumentApi.triggerMetronome();
      }

      // handle song loop
      const songEnded: boolean = currentTick.tick >= totalTicksRef.current;
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
          setIsNotPlaying();
          if (playRangeRef?.current?.startTick) {
            midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
          } else {
            restart();
          }
        }
      }
    });
    midiPlayerRef.current.on("fileLoaded", () => {
      if (midiPlayerRef.current) {
        const allEvents: MidiPlayer.Event[] = midiPlayerRef.current.getEvents();
        setIsNotPlaying();

        const groupedNotes_: types.IGroupedNotes[] = processing.groupNotes(
          allEvents
        );
        totalTicksRef.current = groupedNotes_[groupedNotes_.length - 1].off;
        groupedNotes.current = groupedNotes_;
        // @ts-ignore
        ticksPerBeatRef.current = midiPlayerRef.current?.getDivision()?.division;
      }
    });
    midiPlayerRef.current.on("midiEvent", (midiEvent: any) => {
      if (midiEvent.name === "Set Tempo" && midiPlayerRef.current) {
        originalTempoRef.current = midiPlayerRef.current.tempo;

        const customizedTempo =
          midiPlayerRef.current.tempo * tempoPercentRef.current;
        setTempo(customizedTempo);
      }
      if (midiEvent.name === "Note on") {
        instrumentApi.triggerAttack(
          midiEvent.noteName,
          midiEvent.velocity / 100
        );
        return;
      } else if (midiEvent.name === "Note off") {
        instrumentApi.triggerRelease(midiEvent.noteName);
      }
    });
    return function cleanup() {
      midiPlayerRef.current = undefined;
    };
  }, []);

  const playerFunctions: types.IMidiFunctions = {
    play,
    stop,
    pause,
    getIsPlaying,
    skipToPercent,
    restart,
    getCurrentTick,
    getSongPercentRemaining,
    loadArrayBuffer,
    getTicksPerBeat,
    getTotalTicks,
    skipToTick,
    changeVolume: instrumentApi.changeVolume,
    getVolumeDb: instrumentApi.getVolumeDb,
    instrumentLoading: instrumentApi.instrumentLoading,
    downloadProgress: instrumentApi.downloadProgress,
    soundEffect: {
      getIsSoundEffect,
      setIsSoundEffect,
      setIsNotSoundEffect,
    },
    playRangeApi: {
      getPlayRange,
      setPlayRange,
    },
    metronomeApi: {
      getIsMetronome,
      setIsMetronome,
      setIsNotMetronome,
    },
    loopApi: {
      getIsLoop,
      setIsLoop,
      setIsNotLoop,
    },
    tempoApi: {
      getTempo,
      setTempo,
      setTempoPercent,
    },
    instrumentApi: {
      getInstrument, 
      setInstrument
    },
    sampleApi: {
      getSample,
      setSample
    },
    isHqApi: {
      getIsHq,
      setIsHq,
      setIsNotHq
    }
  };

  return [playerFunctions, groupedNotes.current];
}

export default useMidiData;
