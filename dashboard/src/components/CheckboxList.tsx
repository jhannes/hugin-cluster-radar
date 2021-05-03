import React from "react";

export function CheckboxList({
  options,
  value,
  setValue,
}: {
  options: string[];
  value: Record<string, boolean | undefined>;
  setValue: (v: string, k: boolean) => void;
}) {
  return (
    <>
      {options.map((s) => (
        <div>
          <label key={s}>
            <input
              type="checkbox"
              checked={value[s] || false}
              onChange={(e) => setValue(s, e.target.checked)}
            />
            {s}
          </label>
        </div>
      ))}
    </>
  );
}
