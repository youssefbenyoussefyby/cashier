import Database from 'tauri-plugin-sql-api';
import { Charge } from './interface.ts';

export class ChargeService {
  private static getDb() {
    return Database.load('sqlite:cashier.db');
  }

  /** Create a new charge record */
  static async create(charge: Charge): Promise<void> {
    const db = await this.getDb();
    await db.execute(
      `INSERT INTO charges (description, amount, kind, date,period)
       VALUES ($1, $2, $3, $4);`,
      [
        charge.description ?? '',
        charge.value ?? 0,
        charge.type ?? 'variable',
        charge.date ?? new Date().toISOString().split('T')[0],
        charge.period ?? 0
      ]
    );
    await db.close();
  }

  /** Fetch one charge by its ID */
  static async getById(id: string): Promise<Charge | null> {
    const db = await this.getDb();
    const res = await db.select(`SELECT * FROM charges WHERE id = $1;`, [id]);
    await db.close();

    const rows: any[] = JSON.parse(JSON.stringify(res));
    if (rows.length === 0) return null;

    const r = rows[0];
    return {
      id: String(r.id),
      description: r.description,
      type: r.kind,
      value: r.amount,
      date: r.date,
      period:r.period
    };
  }

  /** Fetch all charges (optionally filter by type) */
  static async getAll(filterType?: 'fixed' | 'variable'): Promise<Charge[]> {
    const db = await this.getDb();
    let res;
    if (filterType) {
      res = await db.select(
        `SELECT * FROM charges WHERE kind = $1 ORDER BY date DESC;`,
        [filterType]
      );
    } else {
      res = await db.select(`SELECT * FROM charges ORDER BY date DESC;`);
    }
    await db.close();

    const rows: any[] = JSON.parse(JSON.stringify(res));
    return rows.map((r) => ({
      id: String(r.id),
      description: r.description,
      type: r.kind,
      value: r.amount,
      date: r.date,
      period:r.period
    }));
  }

  /** Update an existing charge */
  static async update(charge: Charge): Promise<void> {
    if (!charge.id) throw new Error('Charge ID is required for update');
    const db = await this.getDb();
    await db.execute(
      `UPDATE charges
         SET description = $2,
             amount      = $3,
             kind        = $4,
             date        = $5,
             period=$6,
       WHERE id = $1;`,
      [
        charge.id,
        charge.description ?? '',
        charge.value ?? 0,
        charge.type ?? 'variable',
        charge.date ?? new Date().toISOString().split('T')[0],
        charge.period ?? 0

      ]
    );
    await db.close();
  }

  /** Delete a charge by its ID */
  static async delete(id: string): Promise<void> {
    const db = await this.getDb();
    await db.execute(`DELETE FROM charges WHERE id = $1;`, [id]);
    await db.close();
  }
}