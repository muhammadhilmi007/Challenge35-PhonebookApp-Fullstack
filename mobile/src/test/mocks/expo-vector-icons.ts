const createIconSet = () => {
  const Icon = () => null;
  Icon.getRawGlyphMap = () => ({});
  Icon.getFontFamily = () => '';
  Icon.loadFont = () => Promise.resolve();
  Icon.font = {};
  return Icon;
};

export const Ionicons = createIconSet();
export const MaterialIcons = createIconSet();
export const FontAwesome = createIconSet();
export const AntDesign = createIconSet();
// Add other icon sets as needed
