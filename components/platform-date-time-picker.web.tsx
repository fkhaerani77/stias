// Versi WEB — @react-native-community/datetimepicker tidak punya implementasi web sama sekali
// (klik jadi tidak ada respon di browser). Jadi khusus untuk web, kita pakai <input type="date">
// / <input type="time"> bawaan browser. Metro otomatis memilih file INI (bukan
// platform-date-time-picker.tsx) saat aplikasi dijalankan/build untuk web.
import React from "react";

type Mode = "date" | "time";

interface PlatformDateTimePickerProps {
  value: Date;
  mode: Mode;
  is24Hour?: boolean;
  onChange: (event: { type: string }, selectedDate?: Date) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function PlatformDateTimePicker({
  value,
  mode,
  onChange,
}: PlatformDateTimePickerProps) {
  if (mode === "date") {
    const isoDate = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

    return React.createElement("input", {
      type: "date",
      value: isoDate,
      style: webInputStyle,
      onChange: (e: any) => {
        const raw = e.target.value; // format: YYYY-MM-DD
        if (!raw) return;
        const [year, month, day] = raw.split("-").map(Number);
        const updated = new Date(value);
        updated.setFullYear(year, month - 1, day);
        onChange({ type: "set" }, updated);
      },
    });
  }

  const isoTime = `${pad(value.getHours())}:${pad(value.getMinutes())}`;

  return React.createElement("input", {
    type: "time",
    value: isoTime,
    style: webInputStyle,
    onChange: (e: any) => {
      const raw = e.target.value; // format: HH:MM
      if (!raw) return;
      const [hours, minutes] = raw.split(":").map(Number);
      const updated = new Date(value);
      updated.setHours(hours, minutes, 0, 0);
      onChange({ type: "set" }, updated);
    },
  });
}

const webInputStyle: any = {
  border: "1.5px solid #E5D6D7",
  borderRadius: 14,
  padding: "12px 16px",
  fontSize: 14,
  color: "#61141A",
  fontFamily: "inherit",
  marginTop: 8,
  width: "100%",
  boxSizing: "border-box",
};
