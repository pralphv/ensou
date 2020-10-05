export interface ISongTableData {
  filename: string;
  artist: string;
  instrument: string;
  uploader: string;
  date: any; // fix this
  id: string;
  transcribedBy: string;
}

export interface Column {
  id:
    | "filename"
    | "artist"
    | "transcribedBy"
    | "instrument"
    | "uploader"
    | "date";
  label: string;
  align?: "right";
}
