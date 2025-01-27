import { type SQLiteDatabase } from 'expo-sqlite';

// Asume que `db` es tu instancia de SQLiteDatabase.
async function insertDefault(db: SQLiteDatabase) {
  try{

  // Insertar valores predeterminados en PaymentMethods y Categories
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type, closing_date) VALUES (?, ?, ?)','💳', 'credit', 1);
  await db.runAsync('INSERT INTO PaymentMethods (method_name, payment_type) VALUES (?, ?)', '💵', 'debit');
  await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', '😶‍🌫️');

  // Obtener los ID de los valores insertados
  const paymentMethodIdCredit = 1; // Método de pago crédito
  const paymentMethodIdDebit = 2; // Método de pago débito
  const categoryId = 1; // Categoría predeterminada

  // Insertar un grupo predeterminado
  await db.runAsync('INSERT INTO Groups (group_name, goal, year, month) VALUES (?, ?, ?, ?)','🐽 Default', 1000, 2024, 1);

  // Obtener el ID del grupo insertado
  const groupId = 1; // Grupo predeterminado

  // Insertar registros predeterminados usando los valores de ID
  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [100.0, 'income', groupId, categoryId, paymentMethodIdCredit, '2024-01-01','🥕']);

  await db.runAsync(`
    INSERT INTO Records (amount, record_type, group_id, category_id, payment_method_id, date, record_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [50.0, 'expense', groupId, categoryId, paymentMethodIdDebit, '2024-01-02','⛽']);
  }catch(e){
    console.log(e)
  }
  
}

export default insertDefault;
