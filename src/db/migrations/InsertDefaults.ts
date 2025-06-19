import { type SQLiteDatabase } from 'expo-sqlite';

async function insertDefault(db: SQLiteDatabase) {
  try {
    const date = new Date();
    //PaymentTypes
    await db.runAsync('INSERT INTO PaymentTypes (payment_type_name, payment_color) VALUES (?, ?)', 'Credit', '#4CAF50');
    await db.runAsync('INSERT INTO PaymentTypes (payment_type_name, payment_color) VALUES (?, ?)', 'Debit', '#2196F3');


    //RecordTypes
    await db.runAsync('INSERT INTO RecordTypes (type_name, effect, record_color) VALUES (?, ?, ?)', 'Income', '+', '#4CAF50');
    await db.runAsync('INSERT INTO RecordTypes (type_name, effect, record_color) VALUES (?, ?, ?)', 'Expense', '-', '#F44336');
    await db.runAsync('INSERT INTO RecordTypes (type_name, effect, record_color) VALUES (?, ?, ?)', 'Transfer', '=', '#FF9800');
    await db.runAsync('INSERT INTO RecordTypes (type_name, effect, record_color) VALUES (?, ?, ?)', 'Credit', '=', '#9C27B0');

    //Categories
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Groceries');
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Gas');
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Entertainment');
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Utilities');
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Rent');
    await db.runAsync('INSERT INTO Categories (category_name) VALUES (?)', 'Salary');

    //PaymentMethods
    await db.runAsync('INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id) VALUES (?, ?, ?)', 'Visa', 15, 1);
    await db.runAsync('INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id) VALUES (?, ?, ?)', 'MasterCard', 20, 1);
    await db.runAsync('INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id) VALUES (?, ?, ?)', 'Cash', 0, 2);
    await db.runAsync('INSERT INTO PaymentMethods (method_name, closing_date, payment_type_id) VALUES (?, ?, ?)', 'Bank Transfer', 0, 2);

    //Groups
    await db.runAsync('INSERT INTO Groups (group_name, goal, year, month) VALUES (?, ?, ?, ?)', 'Default Group', 5000, 2025, 1);

    //Records
    await db.runAsync('INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 1000, 'Salary for January', date.getTime(), 1, 1, 6, 1);
    await db.runAsync('INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 200, 'Groceries', date.getTime(), 2, 1, 1, 3);
    await db.runAsync('INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 150, 'Gas', date.getTime(), 2, 1, 2, 3);
    await db.runAsync('INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 100, 'Entertainment', date.getTime(), 2, 1, 3, 4);
    await db.runAsync('INSERT INTO Records (amount, record_name, date, record_type_id, group_id, category_id, payment_method_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 1200, 'Rent for January', date.getTime(), 2, 1, 5, 4);


  } catch (e) {
    console.log(e)
  }

}

export default insertDefault;
