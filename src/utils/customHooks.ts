import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import { VariantType, useSnackbar } from "notistack";

// export function useWindow(): types.Window {
//   const [width, setWidth] = useState<number>(window.innerHeight);
//   const [height, setHeight] = useState<number>(window.screen.width);

//   useEffect(() => {
//     // Bind the event listener
//     window.addEventListener("resize", handleSetTable);
//     return () => {
//       // Unbind the event listener on clean up
//       window.removeEventListener("resize", handleSetTable);
//     };
//   }, []);

//   function handleSetTable() {
//     const windowWidth = window.screen.width;
//     const windowHeight = window.innerHeight;
//     setWidth(windowWidth);
//     setHeight(windowHeight);
//   }
//   return { width, height };
// }

export function useIsMobile(): boolean {
  const isMobile: boolean = useMediaQuery("(max-width:600px)");
  return isMobile;
}

export function useIsVerified(): boolean {
  const isVerified = useSelector(
    (state: any) => state.firebase.auth.emailVerified
  );
  return isVerified;
}

export function useUserId(): string {
  const userId = useSelector((state: any) => state.firebase.auth.uid);
  return userId;
}

// export function useUserProfile(): any {
//   const profile = useSelector((state: RootState) => state.firebase.profile);
//   return profile;
// }

export function useStateWithRef(initialState: any) {
  const [state, _setState] = useState(initialState);
  const ref = useRef(state);
  const setState = useCallback((newState) => {
    if (typeof newState === "function") {
      _setState((prevState: any) => {
        const computedState = newState(prevState);
        ref.current = computedState;
        return computedState;
      });
    } else {
      ref.current = newState;
      _setState(newState);
    }
  }, []);
  return [state, setState, ref];
}

export function useEventListener(
  eventName: string,
  handler: (anything: any) => any,
  element = window
) {
  const savedHandler = useRef<(anything: any) => any>();

  useEffect(() => {
    savedHandler.current = handler;
  }, []);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    function eventListener(e: any) {
      if (savedHandler.current) {
        savedHandler.current(e);
      }
    }
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}

export function useStateToRef(state: any): any {
  const ref = useRef<any>();
  ref.current = state;
  return ref;
}

export function useLoadLocal(
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void
): [(acceptedFiles: any) => void] {
  const { enqueueSnackbar } = useSnackbar();

  const handleNotification = (message: string, variant: VariantType) => () => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(message, { variant });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader();
    reader.onabort = (e) => handleNotification("onabort error", "error");
    reader.onerror = (e) => handleNotification("load error", "error");
    reader.onload = (r: any) => {
      const data: any = r.target.result;
      if (data) {
        loadArrayBuffer(data);
      }
    };
    try {
      if (acceptedFiles[0]) {
        console.log(`Reading: ${acceptedFiles[0].name}`);
        if (acceptedFiles[0].type !== "audio/mid") {
          throw "Wrong file format";
        }
        reader.readAsArrayBuffer(acceptedFiles[0]);
        handleNotification("SUCCESS", "success");
        console.log(`Successfully read: ${acceptedFiles[0].name}`);
      }
    } catch (error) {
      handleNotification(error, "error");
      console.log(error);
    }
  }, []);
  return [onDrop];
}
