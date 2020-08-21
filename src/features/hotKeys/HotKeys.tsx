import React from "react";

import { useHotkeys } from 'react-hotkeys-hook';
import { MidiFunctions } from "audio/types";

interface HotKeysProps {
  midiFunctions: MidiFunctions
}


export default function HotKeys({midiFunctions}: HotKeysProps) {
  useHotkeys('space', midiFunctions.play);
  return (<div></div>)
}
