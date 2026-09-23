export const getFontFamily = (language: string, bold = false) => {
  if (language === "አማርኛ" || language === "ትግርኛ" || language === "am" || language === "ti") {
    return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
  }
  return bold ? "NotoSans-Bold" : "NotoSans-Regular";
};
