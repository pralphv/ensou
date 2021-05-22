import { useCallback } from "react";
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

export function useLoadLocal(
  loadArrayBuffer: (blob: XMLHttpRequest["response"]) => void
): [(acceptedFiles: any) => void] {
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback(
    (acceptedFiles) => {
      const handleNotification = (message: string, variant: VariantType) => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, { variant });
      };

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
            throw Error("Wrong file format");
          }
          reader.readAsArrayBuffer(acceptedFiles[0]);
          handleNotification("SUCCESS", "success");
          console.log(`Successfully read: ${acceptedFiles[0].name}`);
        }
      } catch (error) {
        handleNotification(error.toString(), "error");
        console.log(error);
      }
    },
    [enqueueSnackbar, loadArrayBuffer]
  );
  return [onDrop];
}
