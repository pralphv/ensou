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
  forceRerender: types.forceRerender;
  samplerSourceApi: types.IMidiFunctions["samplerSourceApi"];
  getIsPlaying: types.IMidiFunctions["getIsPlaying"];
  metronomeApi: types.IMidiFunctions["metronomeApi"];
  loopApi: types.IMidiFunctions["loopApi"];
  open: boolean;
  sampleApi: types.IMidiFunctions["sampleApi"];
  synthSettingsApi: types.IMidiFunctions["synthSettingsApi"];
  trackFxApi: types.IMidiFunctions["trackFxApi"];
}

export default function SettingsMenu({
  forceRerender,
  samplerSourceApi,
  getIsPlaying,
  metronomeApi,
  loopApi,
  open,
  sampleApi,
  synthSettingsApi,
  trackFxApi,
}: ISettingsMenu): JSX.Element {
  const [forceLocalRenderDummy, setForceLocalRenderDummy] = useState<number>(0);
  const [samplerDialogOpen, setSamplerDialogOpen] = useState<boolean>(false);
  const [audioSettingsDialogOpen, setAudioSettingsDialogOpen] = useState<
    boolean
  >(false);

  /**
   * for rerendering settings because checking objects
   * turned into JSON in useEffect is expensive
   * hacky i know
   */
  function forceLocalRender(skipWait?: boolean) {
    if (skipWait) {
      setForceLocalRenderDummy(forceLocalRenderDummy + 1);
    } else {
      // super hacky way to wait for effectchain to finish building
      setTimeout(() => {
        setForceLocalRenderDummy(forceLocalRenderDummy + 1);
      }, 500);
    }
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
        synthSettingsApi={synthSettingsApi}
        forceLocalRender={forceLocalRender}
        trackFxApi={trackFxApi}
      />
    ),
    [
      audioSettingsDialogOpen,
      synthSettingsApi.getSynthName(),
      forceLocalRenderDummy,
    ]
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
          marginTop: `-${55 * 4}px`,
          right: "38px",
          opacity: 0.9,
        }}
      >
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
