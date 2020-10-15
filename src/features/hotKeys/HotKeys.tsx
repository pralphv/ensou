import React from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { IMidiFunctions } from "types";

interface HotKeysProps {
  midiFunctions: IMidiFunctions;
}

export default function HotKeys({ midiFunctions }: HotKeysProps) {
  // useHotkeys("space", midiFunctions.play);
  return <div></div>;
}
