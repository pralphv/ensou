import { useState, useEffect } from "react";

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    //@ts-ignore
  } else if (document.webkitExitFullscreen) {
    //@ts-ignore
    document.webkitExitFullscreen();
    //@ts-ignore
  } else if (document.mozCancelFullScreen) {
    //@ts-ignore
    document.mozCancelFullScreen();
    //@ts-ignore
  } else if (document.msExitFullscreen) {
    //@ts-ignore
    document.msExitFullscreen();
  }
}

export default function useFullscreenStatus(
  elRef: any
): [boolean, (isFullscreen: boolean) => void, boolean] {
  const [error, setError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  async function setFullscreen(isFullscreen: boolean) {
    if (elRef.current) {
      if (isFullscreen === false) {
        exitFullscreen();
        setIsFullscreen(false);
        return;
      }
      try {
        await elRef.current.requestFullscreen();
        //@ts-ignore
        setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);
      } catch (error) {
        setIsFullscreen(false);
        setError(true);
      }
    }
  }

  useEffect(() => {
    let elemProp: string;
    try {
      elemProp = getBrowserFullscreenElementProp();
    } catch {
      setError(true);
    }
    //@ts-ignore
    setIsFullscreen(document[elemProp] !== null);
    document.onfullscreenchange = () =>
      //@ts-ignore
      setIsFullscreen(document[elemProp] !== null);
    //@ts-ignore
    return () => (document.onfullscreenchange = undefined);
  }, []);

  return [isFullscreen, setFullscreen, error];
}

function getBrowserFullscreenElementProp() {
  if (typeof document.fullscreenElement !== "undefined") {
    return "fullscreenElement";
    //@ts-ignore
  } else if (typeof document.mozFullScreenElement !== "undefined") {
    return "mozFullScreenElement";
    //@ts-ignore
  } else if (typeof document.msFullscreenElement !== "undefined") {
    return "msFullscreenElement";
    //@ts-ignore
  } else if (typeof document.webkitFullscreenElement !== "undefined") {
    return "webkitFullscreenElement";
  } else {
    throw new Error("fullscreenElement is not supported by this browser");
  }
}
