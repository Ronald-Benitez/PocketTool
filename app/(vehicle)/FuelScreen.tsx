import { View, ScrollView, StyleSheet, Text } from "react-native";
import React, { useState, useEffect } from "react";

import { useLanguage } from "@/src/lang/LanguageContext";

const FuelScreen = () => {
  const { t } = useLanguage();

  return (
    <>
      <View style={localStyles.container}>
        <Text>Hola</Text>
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
