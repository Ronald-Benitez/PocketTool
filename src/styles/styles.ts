import { StyleSheet, StyleProp, TextStyle, ViewStyle } from "react-native";

export interface StylesProps {
  smallText: StyleProp<TextStyle>;
  middleText: StyleProp<TextStyle>;
  title: StyleProp<TextStyle>;
  text: StyleProp<TextStyle>;
  label: StyleProp<TextStyle>;
  textColor: StyleProp<TextStyle>;
  enfasizedText: StyleProp<TextStyle>;
  textCenter: StyleProp<TextStyle>;
  verticalText: StyleProp<TextStyle>;

  bgPrimary: StyleProp<ViewStyle>;
  container: StyleProp<ViewStyle>;
  flexContainer: StyleProp<ViewStyle>;
  wrapContainer: StyleProp<ViewStyle>;
  minGapContainer: StyleProp<ViewStyle>;
  dropdowmContainer: StyleProp<ViewStyle>;
  borderedContainer: StyleProp<ViewStyle>;
  toastContainer: StyleProp<ViewStyle>;
  toastContent: StyleProp<ViewStyle>;
  row: StyleProp<ViewStyle>;
  col: StyleProp<ViewStyle>;
  modalBackdrop: StyleProp<ViewStyle>;
  modalBackdrops: StyleProp<ViewStyle>;
  modalContent: StyleProp<ViewStyle>;
  modalContainer: StyleProp<ViewStyle>;
  input: StyleProp<ViewStyle>;
  button: StyleProp<ViewStyle>;
  enfasizedButton: StyleProp<ViewStyle>;
  backgroundButton: StyleProp<ViewStyle>;
  disabledButton: StyleProp<ViewStyle>;
  divider: StyleProp<ViewStyle>;
  horizontalBlock: StyleProp<ViewStyle>;
  fixedBottom: StyleProp<ViewStyle>;
  fixedBackground: StyleProp<ViewStyle>;
  fixedTop: StyleProp<ViewStyle>;
  colorView: StyleProp<ViewStyle>;
  colorContainer: StyleProp<ViewStyle>;
  colorBlock: StyleProp<ViewStyle>;
  primitiveModalContainer: StyleProp<ViewStyle>;
  centerer: StyleProp<ViewStyle>;
  pillContainer: StyleProp<ViewStyle>;
  pill: StyleProp<ViewStyle>;
  brigthnessBlock: StyleProp<ViewStyle>;
  brightnessSelector: StyleProp<ViewStyle>;
  underBlock: StyleProp<ViewStyle>;
  moodViewHorizontal: StyleProp<ViewStyle>;
  moodViewVertical: StyleProp<ViewStyle>;
  iconContainer: StyleProp<ViewStyle>;
  gradientBlock: StyleProp<ViewStyle>;
  selector: StyleProp<ViewStyle>;
  indicatorText: StyleProp<ViewStyle>;
}

const baseButton = {
  padding: 8,
  borderRadius: 4,
  minWidth: 48,
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  elevation: 5,
  flexDirection: "row",
  gap: 8,
} as ViewStyle;

const styles = StyleSheet.create({
  smallText: {
    fontSize: 10,
    fontWeight: "200",
    color: "black",
  },
  middleText: {
    fontSize: 14,
    fontWeight: "300",
    color: "black",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    color: "black",
    marginHorizontal: 10,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 12,
    fontWeight: "200",
    textAlign: "left",
    paddingLeft: 5
  },
  textColor: {
    fontWeight: "bold",
    fontSize: 15,
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    color: "black",
  },
  enfasizedText: {
    fontSize: 16,
    fontWeight: "400",
    color: "black",
    marginHorizontal: 10,
  },
  textCenter: {
    textAlign: "center",
  },
  verticalText: {
    transform: [{ rotate: "-90deg" }],
  },

  bgPrimary: {
    backgroundColor: "white",
  },
  container: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    padding: 16,
    gap: 16,
  },
  flexContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  minGapContainer: {
    gap: 4,
  },
  dropdowmContainer: {
    width: "100%",
    alignItems: "center",
    padding: 10,
    elevation: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    gap: 10,
  },
  borderedContainer: {
    minWidth: "40%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  toastContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    padding: 10,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    gap: 10,
    minHeight: 50,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  col: {
    flexDirection: "column",
    gap: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    maxWidth: 350,
    gap: 16,
  },
  input: {
    minWidth: 200,
    minHeight: 48,
    padding: 6,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#a0a3a1",
    color: "black",
  },
  inputContainer: {
    minWidth: 200,
    minHeight: 48,
    backgroundColor: "white",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#a0a3a1",
    color: "black",
    padding: 1,
  },
  button: {
    ...baseButton,
    backgroundColor: "#fff",
  },
  enfasizedButton: {
    ...baseButton,
    backgroundColor: "#F2F2F2",
  },
  backgroundButton: {
    flex: 1,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  disabledButton: {
    ...baseButton,
    backgroundColor: "gray",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#a0a3a1",
  },
  horizontalBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 48,
    padding: 8,
    borderRadius: 4,
    borderColor: "#FFF5E4",
    borderWidth: 2,
  },
  fixedBottom: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 16,
    padding: 10,
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "white",
  },
  fixedBackground: {
    position: "absolute",
    width: 48,
    height: 48,
    zIndex: -1,
    backgroundColor: "transparent",
  },
  fixedTop: {
    position: "absolute",
    width: "100%",
    top: 0,
    padding: 10,
    justifyContent: "space-around",
    flexDirection: "row",
    backgroundColor: "white",
  },
  colorView: {
    width: 48,
    height: 48,
    borderRadius: 5,
    elevation: 5,
    margin: 4,
  },
  colorContainer: {
    maxWidth: 300,
    maxHeight: 75,
  },
  colorBlock: {
    width: 100,
    height: 100,
    borderRadius: 5,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#00000025",
    borderWidth: 1,
  },
  primitiveModalContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centerer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pillContainer: {
    minWidth: 48,
    minHeight: 48,
  },
  pill: {
    borderRadius: 50,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    fontSize: 12,
    gap: 8,
    textAlign: "center",
  },
  brigthnessBlock: {
    borderRadius: 5,
    elevation: 5,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  brightnessSelector: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 100,
    elevation: 15,
    borderColor: "white",
    borderWidth: 3,
    backgroundColor: "transparent",
  },
  underBlock: {
    width: 48,
    height: 48,
    elevation: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  moodViewHorizontal: {
    width: "100%",
    height: 10,
    borderRadius: 5,
  },
  moodViewVertical: {
    width: 5,
    height: "100%",
    position: "absolute",
    left: 0,
  },
  iconContainer: {
    marginRight: 10,
  },
  gradientBlock: {
    position: "relative",
    borderRadius: 8,
  },
  selector: {
    position: "absolute",
    top: 5,
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 3, // Añadir sombra en Android
  },
  indicatorText: {
    fontWeight: "bold",
    color: "#000",
  },
  modalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2, // Capa superior para la modal
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10
  },
  modalBackdrops: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Capa por encima de otros elementos
  },
});

export default styles;
