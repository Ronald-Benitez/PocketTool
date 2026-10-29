import { View, StyleSheet } from "react-native";
import React from "react";

import { AppText } from "@/src/ui/primitives/AppText";

const FuelScreen = () => {
  return (
    <>
      <View style={localStyles.container}>
        <AppText>Hola</AppText>
      </View>
    </>
  );
};

const localStyles = StyleSheet.create({
  balanceText: {
    borderTopWidth: 4,
    height: 60,
    paddingTop: 10,
    textAlign: "center",
    marginLeft: 5,
    fontWeight: "300",
    fontSize: 18,
  },
  simpleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    paddingVertical: 15,
  },
  container: {
    padding: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    width: "100%",
  },
});

export default FuelScreen;
