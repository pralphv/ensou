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
    async (acceptedFiles) => {
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
        const file = acceptedFiles[0];
        if (file) {
          let readFile;
          if (file.type.includes("image")) {
            readFile = await convertImageToMidi(file);
          } else if (file.type === "audio/mid") {
            readFile = file;
          } else {
            throw Error("Wrong file format");
          }
          reader.readAsArrayBuffer(readFile);
          handleNotification(`Successfully read: ${file.name}`, "success");
        }
      } catch (error) {
        handleNotification(error.toString(), "error");
        console.error(error);
      }
    },
    [enqueueSnackbar, loadArrayBuffer]
  );
  return [onDrop];
}

async function convertImageToMidi(file: File): Promise<File> {
  const encodedImage = await toBase64(file);
  const body = {
    encoded_image: encodedImage,
  };
  let resp;
  try {
    resp = await fetch(
      "https://ebs7md631k.execute-api.us-east-2.amazonaws.com/prod",
      { method: "POST", body: JSON.stringify(body) }
    );
  } catch (error) {
    throw Error("Unable to convert image to MIDI. Try again later.");
  }
  const data = await resp.json();
  const obj = JSON.parse(data.body);
  const url = `data:audio/mid;base64,${obj.midi_file}`;
  const fetchedFile = await (await fetch(url)).blob();
  //@ts-ignore
  return fetchedFile;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let stringed = reader.result as string;
      stringed = stringed.replace("data:image/png;base64,", "");
      resolve(stringed);
    };
    reader.onerror = (error) => reject(error);
  });
}
