import React, { useState, useMemo } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import SamplesDialog from "features/samplesDialog/SamplesDialog";
import AudioSettingsDialog from "features/audioSettingsDialog/AudioSettingsDialog";
import KeyBindingsDialog from "../keyBindingsDialog/KeyBindingsDialog";
import myMidiPlayer from "audio";
import myCanvas from "canvas";
import metronome from "audio/metronome";

interface ISettingsMenu {
  open: boolean;
}

export default function SettingsMenu({ open }: ISettingsMenu): JSX.Element {
  const [forceLocalRenderDummy, setForceLocalRenderDummy] = useState<number>(0);
  const [samplerDialogOpen, setSamplerDialogOpen] = useState<boolean>(false);
  const [audioSettingsDialogOpen, setAudioSettingsDialogOpen] =
    useState<boolean>(false);
  const [keySettingsDialogOpen, setKeySettingsDialogOpen] =
    useState<boolean>(false);

  /**
   * for rerendering settings because checking objects
   * turned into JSON in useEffect is expensive
   * hacky i know
   */
  function forceLocalRender(skipWait?: boolean) {
    setForceLocalRenderDummy(forceLocalRenderDummy + 1);

    // if (skipWait) {
    //   setForceLocalRenderDummy(forceLocalRenderDummy + 1);
    // } else {
    //   setTimeout(() => {
    //     if (!myMidiPlayer.myTonejs?.publishingChanges) {
    //       console.log("waiting for change...");
    //       setForceLocalRenderDummy(forceLocalRenderDummy + 1);
    //       return;
    //     } else {
    //       forceLocalRender(false);
    //     }
    //   }, 100);
    // }
  }

  function handleOnChangeDialog() {
    if (myMidiPlayer.checkIfSampler()) {
      myMidiPlayer.activatePolySynth();
    } else {
      setSamplerDialogOpen(true);
    }
    forceLocalRender();
  }

  function handleOnChangeMetronome() {
    if (metronome.activated) {
      metronome.deactivate();
    } else {
      metronome.activate();
    }
    forceLocalRender();
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
        onClose={() => setAudioSettingsDialogOpen(false)}
        requireRender={forceLocalRender}
      />
    ),
    [
      audioSettingsDialogOpen,
      // midiPlayer.myTonejs?.getSynthName(),
      forceLocalRenderDummy,
    ]
  );

  const keySettingsDialogMemo = useMemo(
    () => (
      <KeyBindingsDialog
        open={keySettingsDialogOpen}
        setOpen={setKeySettingsDialogOpen}
      />
    ),
    [
      keySettingsDialogOpen,
      // midiPlayer.myTonejs?.getSynthName(),
      forceLocalRenderDummy,
    ]
  );

  return (
    <React.Fragment>
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
        {/* <ListItem button>
          <ListItemText primary="Open Microphone" />
          <Switch
            checked={myMidiPlayer.myTonejs?.isMicrophoneOn() || false}
            onChange={() => {
              if (myMidiPlayer.myTonejs?.isMicrophoneOn()) {
                myMidiPlayer.myTonejs?.closeMicrophone();
              } else {
                myMidiPlayer.myTonejs?.openMicrophone();
              }
            }}
          />
        </ListItem> */}
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
            checked={myMidiPlayer.checkIfSampler()}
            onChange={handleOnChangeDialog}
            disabled={myMidiPlayer.getIsPlaying()}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Metronome" />
          <Switch
            checked={metronome.activated}
            onChange={handleOnChangeMetronome}
            disabled={myMidiPlayer.getIsPlaying()}
          />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Zoom" />
          <RemoveIcon
            onClick={myCanvas.increaseCanvasNoteScale}
            color={myMidiPlayer.getIsPlaying() ? "disabled" : undefined}
          />
          <AddIcon
            onClick={myCanvas.decreaseCanvasNoteScale}
            color={myMidiPlayer.getIsPlaying() ? "disabled" : undefined}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            setAudioSettingsDialogOpen(true);
          }}
        >
          <ListItemText primary="Audio Settings" />
          <GraphicEqIcon />
        </ListItem>
        <ListItem button onClick={() => setKeySettingsDialogOpen(true)}>
          <ListItemText primary="Keyboard Settings" />
          <KeyboardIcon />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Particles" />
          <Switch
            checked={myCanvas.particles.enabled}
            onChange={() => {
              myCanvas.particles.toggle();
              forceLocalRender();
            }}
            disabled={myMidiPlayer.getIsPlaying()}
          />
        </ListItem>
      </List>
      {sampleDialogMemo}
      {audioSettingsDialogMemo}
      {keySettingsDialogMemo}
    </React.Fragment>
  );
}
