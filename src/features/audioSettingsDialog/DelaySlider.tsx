import React from "react";

// import InputLabel from "@mui/material/InputLabel";
// import Slider from "@mui/material/Slider";
// import * as types from "types";
// import prettyMilliseconds from "pretty-ms";
// import Tooltip from "@mui/material/Tooltip";
// import myMidiPlayer from "audio";

// interface IDelaySliderProps {
//   forceLocalRender: types.forceLocalRender;
//   synthIndex: number;
// }

// export default function DelaySlider({
//   forceLocalRender,
//   synthIndex,
// }: IDelaySliderProps): JSX.Element {
//   return (
//     <div>
//       <Tooltip
//         title="Increasing this may help with performance"
//         placement="top"
//       >
//         <InputLabel>Delay</InputLabel>
//       </Tooltip>
//       {myMidiPlayer.myTonejs && (
//         <Slider
//           size="small"
//           value={myMidiPlayer.myTonejs.getDelay(synthIndex)}
//           min={0.01}
//           step={0.001}
//           max={0.1}
//           valueLabelFormat={(value) => {
//             return prettyMilliseconds(value * 1000, {
//               formatSubMilliseconds: true,
//             });
//           }}
//           onChange={(e, newValue) => {
//             myMidiPlayer.myTonejs?.setDelay(newValue as number, synthIndex);
//             forceLocalRender(true);
//           }}
//           valueLabelDisplay="auto"
//         />
//       )}
//     </div>
//   );
// }
