import { TextStyle, Dimensions } from "react-native";
import { moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");
const scaleFactor = Math.min(1, width / 360);

const baseFont = (size: number) => moderateScale(size * scaleFactor);

const verticalFix = {
  english: 0,
  ethiopic: -2,
  afro: -1,
};

const lineHeightMap = {
  english: (size: number) => size * 1.25,
  ethiopic: (size: number) => size * 1.5,
  afro: (size: number) => size * 1.35,
};

const createTextStyle = (
  family: string,
  size: number,
  type: "english" | "ethiopic" | "afro",
  color = "#000080",
): TextStyle => ({
  fontFamily: family,
  fontSize: baseFont(size),
  lineHeight: lineHeightMap[type](baseFont(size)),
  includeFontPadding: false,
  paddingTop: verticalFix[type],
  color,
});

type Typography = {
  englishBold: TextStyle;
  englishRegular: TextStyle;
  amharicBold: TextStyle;
  amharicRegular: TextStyle;
  oromoRegular: TextStyle;
  somaliRegular: TextStyle;
  tigrinyaRegular: TextStyle;
};

export const typography: Typography = {
  englishBold: createTextStyle("NotoSans-Bold", 13, "english"),
  englishRegular: createTextStyle("NotoSans-Regular", 11, "english"),

  amharicBold: createTextStyle("NotoSansEthiopic-Bold", 13, "ethiopic"),

  amharicRegular: createTextStyle("NotoSansEthiopic-Regular", 11, "ethiopic"),

  oromoRegular: createTextStyle("NotoSans-Regular", 11, "afro"),

  somaliRegular: createTextStyle("NotoSans-Regular", 11, "afro"),

  tigrinyaRegular: createTextStyle("NotoSansEthiopic-Regular", 11, "ethiopic"),
};
