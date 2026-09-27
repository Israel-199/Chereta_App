import { useMemo } from "react";
import { TextStyle } from "react-native";
import { typography } from "../styles/typography";

const ETHIOPIC = new Set(["አማርኛ", "ትግርኛ"]);

export function useLocalizedTypography(language: string) {
  return useMemo(() => {
    const isEthiopic = ETHIOPIC.has(language);
    const bold: TextStyle = isEthiopic ? typography.amharicBold : typography.englishBold;
    const regular: TextStyle = isEthiopic ? typography.amharicRegular : typography.englishRegular;
    const fontFamily = (b = false) =>
      isEthiopic
        ? b
          ? "NotoSansEthiopic-Bold"
          : "NotoSansEthiopic-Regular"
        : b
          ? "NotoSans-Bold"
          : "NotoSans-Regular";
    return { bold, regular, fontFamily };
  }, [language]);
}
