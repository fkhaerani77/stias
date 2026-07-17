// Versi NATIVE (Android/iOS) — dipakai otomatis oleh Metro bundler saat build native.
// Untuk versi web, lihat platform-date-time-picker.web.tsx (Metro otomatis pilih file
// yang sesuai berdasarkan platform, tidak perlu import manual/kondisional).
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";

type Mode = "date" | "time";

interface PlatformDateTimePickerProps {
  value: Date;
  mode: Mode;
  is24Hour?: boolean;
  onChange: (event: { type: string }, selectedDate?: Date) => void;
}

export default function PlatformDateTimePicker({
  value,
  mode,
  is24Hour,
  onChange,
}: PlatformDateTimePickerProps) {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      is24Hour={is24Hour}
      onChange={onChange}
    />
  );
}
