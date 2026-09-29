import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalizedTypography } from "../utils/useLocalizedTypography";

type CheretaBidInputProps = {
  language: string;
  label: string;
  value: string;
  disabled?: boolean;
  min: number;
  max: number;
  step?: number;
  minHint?: string;
  confirmLabel?: string;
  onChange: (value: string) => void;
};

const sanitizeNumericInput = (input: string) => {
  let cleaned = input.replace(/[^0-9.]/g, "");

  const firstDot = cleaned.indexOf(".");

  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  const [whole, decimal] = cleaned.split(".");

  if (decimal !== undefined) {
    cleaned = `${whole}.${decimal.slice(0, 2)}`;
  }

  return cleaned;
};

const formatAmount = (amount: number) => {
  if (!Number.isFinite(amount)) return "0";
  return Number(amount.toFixed(2)).toString();
};

const CheretaBidInput = ({
  language,
  label,
  value,
  disabled = false,
  min,
  max,
  step = 1,
  minHint,
  confirmLabel = "OK",
  onChange,
}: CheretaBidInputProps) => {
  const { bold, regular } = useLocalizedTypography(language);

  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const safeStep = useMemo(() => {
    const parsed = Number(step);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [step]);

  const clamp = useCallback(
    (amount: number) =>
      Math.min(
        Math.max(amount, Number.isFinite(min) ? min : 0),
        Number.isFinite(max) ? max : Number.MAX_SAFE_INTEGER
      ),
    [min, max]
  );

  const commit = useCallback(
    (nextValue: string) => {
      const sanitized = sanitizeNumericInput(nextValue);

      setDraft(sanitized);
      onChange(sanitized);
    },
    [onChange]
  );

  const changeBy = useCallback(
    (direction: 1 | -1) => {
      const current = Number.parseFloat(draft);
      const base = Number.isFinite(current) ? current : min;

      const next = clamp(base + direction * safeStep);
      const formatted = formatAmount(next);

      setDraft(formatted);
      onChange(formatted);
    },
    [clamp, draft, min, onChange, safeStep]
  );

  const handleBlur = useCallback(() => {
    setFocused(false);

    const parsed = Number.parseFloat(draft);

    if (!Number.isFinite(parsed)) {
      const fallback = formatAmount(clamp(min));

      setDraft(fallback);
      onChange(fallback);
      return;
    }

    const clamped = clamp(parsed);
    const formatted = formatAmount(clamped);

    setDraft(formatted);
    onChange(formatted);
  }, [clamp, draft, min, onChange]);

  const handleDone = useCallback(() => {
    handleBlur();
    Keyboard.dismiss();
  }, [handleBlur]);

  const canDecrease =
    !disabled &&
    Number.isFinite(Number.parseFloat(draft)) &&
    Number.parseFloat(draft) > min;

  const canIncrease =
    !disabled &&
    Number.isFinite(Number.parseFloat(draft)) &&
    Number.parseFloat(draft) < max;

  return (
    <View
      style={{
        marginTop: 5,
        borderWidth: 1,
        borderColor: focused ? "#3D5D96" : "#E5E7EB",
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 42,
        }}
      >
        {/* BID ICON */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 7,
          }}
        >
          <MaterialCommunityIcons
            name="gavel"
            size={19}
            color="#4B5563"
          />
        </View>

        {/* LABEL */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            flexShrink: 1,
            justifyContent: "center",
            marginRight: 5,
          }}
        >
          <Text
            style={[
              regular,
              {
                color: "#374151",
                fontSize: 12,
                lineHeight: 16,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {label}
          </Text>

          {!!minHint && (
            <Text
              style={[
                regular,
                {
                  color: "#9CA3AF",
                  fontSize: 9,
                  lineHeight: 12,
                  marginTop: 0,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {minHint}
            </Text>
          )}
        </View>

        {/* MINUS */}
        <TouchableOpacity
          onPress={() => changeBy(-1)}
          disabled={!canDecrease}
          activeOpacity={0.75}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: canDecrease ? "#D1D5DB" : "#E5E7EB",
            backgroundColor: canDecrease ? "#FFFFFF" : "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 2,
          }}
        >
          <MaterialCommunityIcons
            name="minus"
            size={16}
            color={canDecrease ? "#3D5D96" : "#B9C0C9"}
          />
        </TouchableOpacity>

        {/* NUMBER FIELD */}
        <View
          style={{
            width: 90,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextInput
            value={draft}
            editable={!disabled}
            keyboardType="decimal-pad"
            inputMode="decimal"
            returnKeyType="done"
            selectTextOnFocus
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            onChangeText={commit}
            onSubmitEditing={handleDone}
            maxLength={12}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            style={[
              bold,
              {
                width: 90,
                paddingVertical: 1,
                paddingHorizontal: 0,
                color: "#111827",
                fontSize: 15,
                lineHeight: 19,
                textAlign: "center",
                borderBottomWidth: 1.5,
                borderBottomColor: focused
                  ? "#3D5D96"
                  : "#374151",
              },
            ]}
          />

          <Text
            style={[
              regular,
              {
                color: "#9CA3AF",
                fontSize: 8,
                lineHeight: 10,
                marginTop: 1,
              },
            ]}
          >
            ETB
          </Text>
        </View>

        {/* PLUS */}
        <TouchableOpacity
          onPress={() => changeBy(1)}
          disabled={!canIncrease}
          activeOpacity={0.75}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: canIncrease ? "#D1D5DB" : "#E5E7EB",
            backgroundColor: canIncrease ? "#FFFFFF" : "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 2,
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color={canIncrease ? "#3D5D96" : "#B9C0C9"}
          />
        </TouchableOpacity>
      </View>

      {/* CONFIRM BUTTON */}
      {focused && !disabled && (
        <TouchableOpacity
          onPress={handleDone}
          activeOpacity={0.8}
          style={{
            alignSelf: "flex-end",
            marginTop: 3,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: "#EEF4FF",
          }}
        >
          <Text
            style={[
              bold,
              {
                color: "#3D5D96",
                fontSize: 10,
              },
            ]}
          >
            {confirmLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CheretaBidInput;