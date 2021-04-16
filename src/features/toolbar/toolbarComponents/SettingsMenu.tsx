import React, { useState, useMemo } from "react";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import GraphicEqIcon from "@material-ui/icons/GraphicEq";

import * as types from "types";
import SamplesDialog from "features/samplesDialog/SamplesDialog";
import AudioSettingsDialog from "features/audioSettingsDialog/AudioSettingsDialog";
import myMidiPlayer from "audio";
import myCanvas from "canvas";

interface ISettingsMenu {
  open: boolean;
}

export default function SettingsMenu({ open }: ISettingsMenu): JSX.Element {
  const [forceLocalRenderDummy, setForceLocalRenderDummy] = useState<number>(0);
  const [samplerDialogOpen, setSamplerDialogOpen] = useState<boolean>(false);
  const [
    audioSettingsDialogOpen,
    setAudioSettingsDialogOpen,
  ] = useState<boolean>(false);

  /**
   * for rerendering settings because checking objects
   * turned into JSON in useEffect is expensive
   * hacky i know
   */
  function forceLocalRender(skipWait?: boolean) {
    if (skipWait) {
      setForceLocalRenderDummy(forceLocalRenderDummy + 1);
    } else {
      setTimeout(() => {
        if (!myMidiPlayer.myTonejs?.publishingChanges) {
          console.log("waiting for change...");
          setForceLocalRenderDummy(forceLocalRenderDummy + 1);
          return;
        } else {
          forceLocalRender(false);
        }
      }, 100);
    }
  }

  async function handleOnChangeDialog() {
    if (myMidiPlayer.checkIfSampler()) {
      myMidiPlayer.setSamplerSource(types.SamplerSourceEnum.synth);
    } else {
      setSamplerDialogOpen(true);
    }
  }

  function handleOnChangeMetronome() {
    if (myMidiPlayer.getIsMetronome()) {
      myMidiPlayer.setIsMetronome(false);
    } else {
      myMidiPlayer.setIsMetronome(true);
    }
  }

  function handleOnChangeLoop() {
    if (myMidiPlayer.getIsLoop()) {
      myMidiPlayer.setIsLoop(false);
    } else {
      myMidiPlayer.setIsLoop(true);
    }
  }

  const sampleDialogMemo = useMemo(
    () => (
      <SamplesDialog open={samplerDialogOpen} setOpen={setSamplerDialogOpen} />
    ),
    [samplerDialogOpen]
  );

  const audioSettingsDialogMemo = useMemo(
    () => (
      <AudioSettingsDialog
        open={audioSettingsDialogOpen}
        setOpen={setAudioSettingsDialogOpen}
        forceLocalRender={forceLocalRender}
      />
    ),
    [
      audioSettingsDialogOpen,
      // midiPlayer.myTonejs?.getSynthName(),
      forceLocalRenderDummy,
    ]
  );

  return (
    <div>
      <List
        component="nav"
        style={{
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
          <ListItemText primary="Open Microphone" />
          <Switch
            checked={myMidiPlayer.myTonejs?.isMicrophoneOn()}
            onChange={() => {
              if (myMidiPlayer.myTonejs?.isMicrophoneOn()) {
                myMidiPlayer.myTonejs?.closeMicrophone();
              } else {
                myMidiPlayer.myTonejs?.openMicrophone();
              }
              // forceRerender();
            }}
          />
        </ListItem>
        {/* <ListItem button>
          <ListItemText primary="Horizontal" />
          <Switch
            checked={myCanvas.isHorizontal}
            onChange={() => {
              myCanvas.setIsHorizontal(!myCanvas.isHorizontal);
            }}
          />
        </ListItem> */}
        <ListItem button>
          <ListItemText primary="Use Samples" />
          <Switch
            // color="secondary"
            checked={myMidiPlayer.checkIfSampler()}
            onChange={handleOnChangeDialog}
            disabled={myMidiPlayer.getIsPlaying()}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Metronome" />
          <Switch
            // color="secondary"
            checked={myMidiPlayer.getIsMetronome()}
            onChange={handleOnChangeMetronome}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Loop" />
          <Switch
            // color="secondary"
            checked={myMidiPlayer.getIsLoop()}
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
