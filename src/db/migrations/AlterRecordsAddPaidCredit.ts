import { type SQLiteDatabase } from 'expo-sqlite';

async function AlterRecordsAddPaidCredit(db: SQLiteDatabase) {
  try {
    await db.runAsync('ALTER TABLE Records ADD COLUMN paid_credit_id INTEGER REFERENCES PaidCredits(id);');
  } catch (e) {
    console.log(e)
  }

}

export default AlterRecordsAddPaidCredit;
