import React, { useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import { DataGrid, GridColumns, GridCellParams } from "@mui/x-data-grid";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";

import game from "game";
import { PIANO_TUNING } from "audio/constants";
import { IRow } from "./types";
import { keyBindingsLocalStorage } from "utils/localStorageUtils";
import { IKeyNoteMap } from "game/types";

interface IKeyBindingsDialog {
  open: boolean;
  setOpen: (bool: boolean) => void;
}

const columns: GridColumns = [
  { field: "note", headerName: "Note", width: 85, sortable: false },
  {
    field: "hotkey",
    headerName: "Hotkey",
    type: "string",
    width: 150,
    sortable: false,
  },
];

interface IHotKey {
  hotkey: string;
  label: string;
}

interface ISettings {
  [key: string]: IHotKey;
}

export default function KeyBindingsDialog({
  open,
  setOpen,
}: IKeyBindingsDialog) {
  console.log("KeyBindingsDialog render");
  const [reset, setReset] = useState<boolean>(false); // to toggle useEffect
  const [value, setValue] = useState<number>(0);
  const [table, setTable] = useState<IRow[]>();
  useEffect(() => {
    const table = getPianoTuningTable();
    setTable(table);
  }, [reset]);

  function handleOnCellClick(param: GridCellParams, e: React.MouseEvent) {
    if (param.field === "hotkey") {
      // this sets the value to the virtualized table only
      // not the true table
      param.row.hotkey = "Press any key...";
    }
  }

  function handleOnCellBlur(param: GridCellParams) {
    if (param.field === "hotkey") {
      // just for getting rid of Press any key
      setValue(value + 1);
    } else if (param.field === "label") {
      const newTable = JSON.parse(JSON.stringify(table));
      const index = param.id as number;
      newTable[index].label = param.row.label;
      setTable(newTable);
      setKeyBindingsMiddleWare(newTable);
      game.loadKeyNoteMap();
    }
  }

  function handleOnCellKeyDown(param: GridCellParams, e: React.KeyboardEvent) {
    if (table) {
      if (param.field === "hotkey") {
        const newTable = JSON.parse(JSON.stringify(table));
        const index = param.id as number;
        //@ts-ignore
        const hotKey = e.code;
        const existingRowIndex = newTable.findIndex(
          (obj: IRow) => obj.hotkey === hotKey
        );

        newTable[index].hotkey = hotKey; // e.code is new in React 17
        newTable[index].label = e.key;

        if (existingRowIndex !== -1) {
          newTable[existingRowIndex].label = "";
          newTable[existingRowIndex].hotkey = "";
        }
        setTable(newTable);
        setKeyBindingsMiddleWare(newTable);
        game.loadKeyNoteMap();
      }
      if (param.field === "label") {
        // this sets the value to the virtualized table only
        // not the true table
        param.row.label = param.row.label + e.key;
      }
    }
  }

  function handleButtonOnClick() {
    keyBindingsLocalStorage.deleteKeyBindings();
    game.loadKeyNoteMap();
    setReset(!reset);
  }

  return (
    <Dialog maxWidth={false} open={open} onClose={() => setOpen(false)}>
      <DialogContent sx={{ width: 310 }}>
        <DataGrid
          disableColumnMenu={true}
          disableColumnSelector={true}
          autoHeight={true}
          rows={JSON.parse(JSON.stringify(table || []))} // use a virtualized one for easy reverting
          columns={columns}
          hideFooter={true}
          density="compact"
          onCellClick={handleOnCellClick}
          onCellKeyDown={handleOnCellKeyDown}
          onCellBlur={handleOnCellBlur}
        />
      </DialogContent>
      <Button variant="contained" onClick={handleButtonOnClick} size="small">
        Reset to Default
      </Button>
    </Dialog>
  );
}

function getPianoTuningTable(): IRow[] {
  const items = Object.entries(PIANO_TUNING);
  const currentSettings: ISettings = {};
  Object.entries(game.keyNoteMap).forEach(([key, value]) => {
    currentSettings[value.note] = { hotkey: key, label: value.label };
  });
  const rows: IRow[] = [];

  for (let i = 0; i < items.length; i++) {
    let note: string;
    const currentNote = items[i][0];
    if (rows.length === 0) {
      note = `${items[i][1] + 1} ${currentNote}`;
    } else {
      if (items[i - 1][1] !== items[i][1]) {
        // avoid c# db
        note = `${items[i][1] + 1} ${currentNote}`;
      } else {
        continue;
      }
    }
    rows.push({
      id: rows.length,
      note,
      label: currentSettings[currentNote]?.label || "",
      hotkey: currentSettings[currentNote]?.hotkey || "",
    });
  }
  return rows;
}

function setKeyBindingsMiddleWare(newTable: IRow[]) {
  const formattedTable: IKeyNoteMap = {};
  const appearedHotKey: Set<string> = new Set();
  for (const row of newTable) {
    if (!appearedHotKey.has(row.hotkey)) {
      const note = row.note.split(" ")[1]; // 0 A0
      formattedTable[row.hotkey] = { note, label: row.label };
      appearedHotKey.add(row.hotkey);
    }
  }
  keyBindingsLocalStorage.setKeyBindings(formattedTable);
}
