import { useEffect, useRef, useState } from "react";

import MidiPlayer from "midi-player-js";
import { SamplerOptions } from "tone";

import { useInstrument } from "./loadInstrument";
import * as processing from "./processing";

import * as types from "types";
import * as localStorageUtils from "utils/localStorageUtils/localStorageUtils";
import * as indexedDbUtils from "utils/indexedDbUtils/indexedDbUtils";
import { convertArrayBufferToAudioContext } from "utils/helper";

const BEAT_BUFFER = 0.02;
let BLOCK_METRONOME: boolean; // serve as blocker when metronome played once already for 1 beat
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
  const isSoundEffectRef = useRef<boolean>();
  const isLoopRef = useRef<boolean>(true);
  const isMetronomeRef = useRef<boolean>(false);
  const tempoPercentRef = useRef<number>(1); // tempo % and tempo is different
  // midi can change tempo, so need a % to keep the user's change
  const instrumentRef = useRef<types.Instrument>("piano");
  const localSamplerRef = useRef<SamplerOptions["urls"]>();
  const samplerSourceRef = useRef<types.SamplerSource>();
  const sampleRef = useRef<string>();
  useEffect(() => {
    // should be safe to say string because when useSample is chose it would save to local storage
    sampleRef.current = localStorageUtils.getSampleName() as string;
    const cachedSampler =
      localStorageUtils.getSamplerSource() || types.SamplerSourceEnum.synth;
    samplerSourceRef.current =
      cachedSampler === types.SamplerSourceEnum.cachedLocal
        ? types.SamplerSourceEnum.local
        : cachedSampler; // force rerender in useInstrument and getLocalSampler
  }, []);
  function getInstrument(): types.Instrument {
    return instrumentRef.current;
  }

  function setInstrument(instrument: types.Instrument) {
    instrumentRef.current = instrument;
  }

  function getSample(): string {
    return sampleRef.current as string; // seriously can only be string
  }

  function setSample(sample: string) {
    sampleRef.current = sample;
  }

  function getSamplerSource(): types.SamplerSource {
    return samplerSourceRef.current as types.SamplerSource; // seriously can only be types.SamplerSource
  }

  function setSamplerSource(source: types.SamplerSource) {
    samplerSourceRef.current = source;
    localStorageUtils.setSamplerSource(source);
  }

  function checkIfSampler(): boolean {
    if (samplerSourceRef.current) {
      return [
        types.SamplerSourceEnum.cachedLocal,
        types.SamplerSourceEnum.local,
        types.SamplerSourceEnum.server,
      ].includes(samplerSourceRef.current);
    } else {
      return false;
    }
  }

  function getLocalSampler(): SamplerOptions["urls"] | undefined {
    return localSamplerRef.current;
  }

  async function setLocalSampler(sampler: SamplerOptions["urls"]) {
    localSamplerRef.current = sampler;
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
    instrumentApi.clearPlayingNotes();
    if (!noSkip && playRangeRef?.current?.startTick !== 0) {
      midiPlayerRef.current?.skipToTick(playRangeRef?.current?.startTick);
    }
    if (!skipDispatch) {
      setIsPlaying();
    }
    midiPlayerRef.current?.play();
    BLOCK_METRONOME = false;
  }

  function stop() {
    instrumentApi.clearPlayingNotes();
    setIsNotPlaying();
    midiPlayerRef.current?.stop();
  }

  function pause() {
    instrumentApi.clearPlayingNotes();
    setIsNotPlaying();
    midiPlayerRef.current?.pause();
  }

  function restart() {
    instrumentApi.clearPlayingNotes();
    skipToPercent(0);
    setPlayRange({ startTick: 0, endTick: 0 });
  }

  function skipToPercent(percent: number) {
    instrumentApi.clearPlayingNotes();
    midiPlayerRef.current?.skipToPercent(percent);
    if (isPlayingRef.current) {
      play(true, true);
    }
  }

  function skipToTick(tick: number) {
    instrumentApi.clearPlayingNotes();
    midiPlayerRef.current?.skipToTick(tick);
    if (isPlayingRef.current) {
      play(true, true);
    }
  }

  const instrumentApi = useInstrument(
    getInstrument,
    getSample,
    getSamplerSource,
    getLocalSampler
  );

  useEffect(() => {
    async function getLocalSampler() {
      const localSampler: types.ArrayBufferMap = await indexedDbUtils.getLocalSamplerArrayBuffer();
      const userLastSampler = localStorageUtils.getSamplerSource();
      const wasUsingLocal =
        userLastSampler === types.SamplerSourceEnum.local ||
        userLastSampler === types.SamplerSourceEnum.cachedLocal;
      if (wasUsingLocal && localSampler) {
        localSamplerRef.current = await convertArrayBufferToAudioContext(
          localSampler
        );
        setSamplerSource(types.SamplerSourceEnum.cachedLocal);
      }
    }
    getLocalSampler();
  }, []);

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
      if (isMetronomeRef.current && fourthBeat) {
        if (!BLOCK_METRONOME) {
          instrumentApi.triggerMetronome();
        }
        BLOCK_METRONOME = true;
      } else {
        BLOCK_METRONOME = false;
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
        instrumentApi.clearPlayingNotes();
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
      } else if (midiEvent.velocity !== 0 && midiEvent.name === "Note on") {
        // some stupid midi can have note on but 0 velocity to represent note off
        instrumentApi.triggerAttack(
          midiEvent.noteName,
          midiEvent.velocity / 100
        );
      } else if (midiEvent.velocity === 0 || midiEvent.name === "Note off") {
        instrumentApi.triggerRelease(midiEvent.noteName);
      }
    });
    return function cleanup() {
      stop();
      midiPlayerRef.current = undefined;
      console.log("Cleaned Midi Player");
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
    synthSettingsApi: instrumentApi.synthSettingsApi,
    trackFxApi: instrumentApi.trackFxApi,
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
      setInstrument,
    },
    sampleApi: {
      getSample,
      setSample,
    },
    samplerSourceApi: {
      getSamplerSource,
      setSamplerSource,
      checkIfSampler,
      getLocalSampler,
      setLocalSampler,
    },
  };

  return [playerFunctions, groupedNotes.current];
}

export default useMidiData;
