import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite';
import { View, StyleSheet, ToastAndroid, Button, StatusBar } from 'react-native';

export const importDatabaseFromSQLFile = async (db: SQLiteDatabase,t:any) => {
  try {
    // Seleccionar el archivo SQL a importar
    const result = await DocumentPicker.getDocumentAsync();

    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log("Importación cancelada");
      ToastAndroid.show(t('db.importCancel') , ToastAndroid.SHORT);
      return;
    }

    // Leer el contenido del archivo SQL
    const fileUri = result.assets[0].uri;
    const sqlContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Separar las consultas individuales en base a los puntos y coma (;) y quitar espacios extra
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0); // Eliminar consultas vacías

    // Ejecutar cada consulta individualmente en la base de datos
    for (const statement of statements) {
      const res = await db.runAsync(statement);
      console.log(statement)
    }

    console.log("Importación completada con éxito", statements);
    ToastAndroid.show( t('db.importSuccess') , ToastAndroid.SHORT);
  } catch (error) {
    console.error("Error al importar la base de datos:", error);
  }
};
