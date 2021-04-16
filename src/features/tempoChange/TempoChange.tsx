import React from "react";

import Slider from "@material-ui/core/Slider";

interface ITempoChange {
  value: number;
  setValue: (value: number) => void;
}

function TempoChange({ value, setValue }: ITempoChange) {
  const handleChange = (e: any, newValue: number | number[]) => {
    newValue = newValue as number;
    setValue(Math.round(newValue));
  };

  return (
    <Slider
      color="secondary"
      value={value}
      onChange={handleChange}
      min={0}
      max={200}
      style={{
        // use styles to be faster
        width: 100,
        paddingTop: 20,
        paddingBottom: 20,
        marginLeft: 20,
        marginRight: 20,
      }}
    />
  );
}

export default TempoChange;
