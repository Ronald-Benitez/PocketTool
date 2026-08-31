import { type SQLiteDatabase } from 'expo-sqlite';

async function AlterPaymentMethodsAddPaymentDate(db: SQLiteDatabase): Promise<void> {
  try {
    await db.runAsync('ALTER TABLE PaymentMethods ADD COLUMN payment_date INTEGER;');
  } catch (e) {
    console.log('Error agregando payment_date a PaymentMethods:', e);
  }
}

export default AlterPaymentMethodsAddPaymentDate;