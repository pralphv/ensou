import React, { useState, useMemo } from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import GraphicEqIcon from "@material-ui/icons/GraphicEq";

import * as types from "types";
import SamplesDialog from "features/samplesDialog/SamplesDialog";
import AudioSettingsDialog from "features/audioSettingsDialog/AudioSettingsDialog";

interface ISettingsMenu {
  soundEffect: types.IMidiFunctions["soundEffect"];
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
  open: boolean;
  sampleApi: types.IMidiFunctions["sampleApi"];
  audioSettingsApi: types.IMidiFunctions["audioSettingsApi"];
}

export default function SettingsMenu({
  soundEffect,
  forceRerender,
  samplerSourceApi,
  getIsPlaying,
  metronomeApi,
  loopApi,
  open,
  sampleApi,
  audioSettingsApi
}: ISettingsMenu): JSX.Element {
  const [samplerDialogOpen, setSamplerDialogOpen] = useState<boolean>(false);
  const [audioSettingsDialogOpen, setAudioSettingsDialogOpen] = useState<
    boolean
  >(false);
  function handleOnChangeSoundEffect() {
    if (soundEffect.getIsSoundEffect()) {
      soundEffect.setIsNotSoundEffect();
    } else {
      soundEffect.setIsSoundEffect();
    }
    forceRerender();
  }

  async function handleOnChangeDialog() {
    if (samplerSourceApi.checkIfSampler()) {
      samplerSourceApi.setSamplerSource(types.SamplerSourceEnum.synth);
      forceRerender();
    } else {
      setSamplerDialogOpen(true);
    }
  }

  function handleOnChangeMetronome() {
    if (metronomeApi.getIsMetronome()) {
      metronomeApi.setIsNotMetronome();
    } else {
      metronomeApi.setIsMetronome();
    }
    forceRerender();
  }

  function handleOnChangeLoop() {
    if (loopApi.getIsLoop()) {
      loopApi.setIsNotLoop();
    } else {
      loopApi.setIsLoop();
    }
    forceRerender();
  }

  const sampleDialogMemo = useMemo(
    () => (
      <SamplesDialog
        open={samplerDialogOpen}
        setOpen={setSamplerDialogOpen}
        sampleApi={sampleApi}
        samplerSourceApi={samplerSourceApi}
        forceRerender={forceRerender}
      />
    ),
    [samplerDialogOpen]
  );

  const audioSettingsDialogMemo = useMemo(
    () => (
      <AudioSettingsDialog
        open={audioSettingsDialogOpen}
        setOpen={setAudioSettingsDialogOpen}
        sampleApi={sampleApi}
        samplerSourceApi={samplerSourceApi}
        forceRerender={forceRerender}
        isSampler={samplerSourceApi.checkIfSampler()}
        audioSettingsApi={audioSettingsApi}
      />
    ),
    [audioSettingsDialogOpen, audioSettingsApi.getOscillator()]
  );

  return (
    <div>
      <List
        component="nav"
        style={{
          // not use mui for speed sorry
          display: open ? "block" : "none",
          position: "absolute",
          backgroundColor: "#1e1e1e",
          zIndex: 100,
          marginTop: `-${55 * 5}px`,
          right: "38px",
          opacity: 0.9,
        }}
      >
        <ListItem button>
          <ListItemText primary="Sound Effect" />
          <Switch
            checked={soundEffect.getIsSoundEffect()}
            onChange={handleOnChangeSoundEffect}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Use Samples" />
          <Switch
            // color="secondary"
            checked={samplerSourceApi.checkIfSampler()}
            onChange={handleOnChangeDialog}
            disabled={getIsPlaying()}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Metronome" />
          <Switch
            // color="secondary"
            checked={metronomeApi.getIsMetronome()}
            onChange={handleOnChangeMetronome}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Loop" />
          <Switch
            // color="secondary"
            checked={loopApi.getIsLoop()}
            onChange={handleOnChangeLoop}
          />
        </ListItem>
        <ListItem button onClick={() => setAudioSettingsDialogOpen(true)}>
          <ListItemText primary="Audio Settings" />
          <GraphicEqIcon />
        </ListItem>
      </List>
      {sampleDialogMemo}
      {audioSettingsDialogMemo}
    </div>
  );
}
