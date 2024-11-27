import { type SQLiteDatabase } from 'expo-sqlite';

async function alterPaymentMethodsAddClosingDate(db: SQLiteDatabase) {
  
  await db.execAsync(`
    ALTER TABLE PaymentMethods 
    ADD COLUMN closing_date INTEGER;
  `);
}

export default alterPaymentMethodsAddClosingDate;
