import { type SQLiteDatabase } from 'expo-sqlite';

// Asume que `db` es tu instancia de SQLiteDatabase.
async function insertDefault(db: SQLiteDatabase) {
  // Insertar valores predeterminados en PaymentMethods y Categories
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?, ?)', 'Método de Pago Predeterminado', 'credit', 1);
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?)', 'Método de Pago en Efectivo', 'debit');
  await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Categoría Predeterminada');

  // Obtener los ID de los valores insertados
  const paymentMethodIdCredit = 1; // Método de pago crédito
  const paymentMethodIdDebit = 2; // Método de pago débito
  const categoryId = 1; // Categoría predeterminada

  // Insertar un grupo predeterminado
  await db.runAsync('INSERT INTO Groups (group_name, goal, year, month) VALUES (?, ?, ?, ?)', 'Grupo Predeterminado', 1000, 2024, 1);

  // Obtener el ID del grupo insertado
  const groupId = 1; // Grupo predeterminado

  // Insertar registros predeterminados usando los valores de ID
  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [100.0, 'income', groupId, categoryId, paymentMethodIdCredit, '2024-01-01', 'base1']);

  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [50.0, 'expense', groupId, categoryId, paymentMethodIdDebit, '2024-01-02','base2']);
  
}

export default insertDefault;
