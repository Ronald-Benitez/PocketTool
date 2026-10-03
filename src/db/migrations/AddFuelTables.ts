import { type SQLiteDatabase } from 'expo-sqlite';

async function AddFuelTables(db: SQLiteDatabase): Promise<void> {
  try {
    await db.runAsync(`
        -- 1. Fuel refill records with soft delete
        CREATE TABLE fuel_refills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            odometer_reading REAL NOT NULL,
            total_cost REAL NOT NULL,
            gallons REAL NOT NULL,
            price_per_gallon REAL NOT NULL,
            is_full_tank INTEGER NOT NULL,
            notes TEXT,
            deleted_at DATETIME DEFAULT NULL
        );

        CREATE INDEX idx_fuel_refills_active
        ON fuel_refills (odometer_reading)
        WHERE deleted_at IS NULL;

        -- 2. Dashboard trip records with soft delete
        CREATE TABLE trip_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            distance_traveled REAL NOT NULL,
            average_consumption REAL,
            is_counter_reset INTEGER,
            trip_type TEXT CHECK(trip_type IN ('city', 'highway', 'mixed')),
            notes TEXT,
            deleted_at DATETIME DEFAULT NULL
        );
        `);
  } catch (e) {
    console.log('Error adding fuel tables:', e);
  }
}

export default AddFuelTables;