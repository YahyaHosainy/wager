import noop from "lodash/noop";
import React, { CSSProperties, KeyboardEvent, useCallback } from "react";

interface CurrencyInputProps {
  className?: string;
  max?: number;
  onValueChange: (value: number) => void;
  style?: CSSProperties;
  value: number;
  onBlurCallBack?: () => void;
}

const VALID_FIRST = /^[1-9]{1}$/;
const VALID_NEXT = /^[0-9]{1}$/;
const DELETE_KEY_CODE = 8;

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  className = "",
  max = Number.MAX_SAFE_INTEGER,
  onValueChange,
  style = {},
  value,
  onBlurCallBack = noop,
}) => {
  const valueAbsTrunc = Math.trunc(Math.abs(value));

  if (
    value !== valueAbsTrunc ||
    !Number.isFinite(value) ||
    Number.isNaN(value)
  ) {
    return;
  }
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>): void => {
      const { key, keyCode } = e;

      if (
        (value === 0 && !VALID_FIRST.test(key)) ||
        (value !== 0 && !VALID_NEXT.test(key) && keyCode !== DELETE_KEY_CODE)
      ) {
        return;
      }

      const valueString = value.toString();
      let nextValue: number;

      if (keyCode !== DELETE_KEY_CODE) {
        const nextValueString: string =
          value === 0 ? key : `${valueString}${key}`;
        nextValue = Number.parseInt(nextValueString, 10);
      } else {
        const nextValueString = valueString.slice(0, -1);
        nextValue =
          nextValueString === "" ? 0 : Number.parseInt(nextValueString, 10);
      }
      if (nextValue > max) {
        return;
      }
      onValueChange(nextValue);
    },
    [max, onValueChange, value]
  );

  const handleOnBlur = () => {
    onBlurCallBack();
  };

  const handleChange = useCallback(() => {
    noop(); // avoids react warning
  }, []);

  const valueDisplay = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  return (
    <input
      className={className}
      inputMode="numeric"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleOnBlur}
      style={style}
      value={valueDisplay}
    />
  );
};

export default CurrencyInput;
