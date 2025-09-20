import { pool } from '@/database/connection';
import { User, UserPreferences } from '@/types';
import { PoolClient } from 'pg';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name,
             skills_future_credits, credit_expiry_date, preferences,
             created_at, updated_at
      FROM users WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      skillsFutureCredits: parseFloat(row.skills_future_credits),
      creditExpiryDate: row.credit_expiry_date,
      preferences: row.preferences,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name,
             skills_future_credits, credit_expiry_date, preferences,
             created_at, updated_at
      FROM users WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      skillsFutureCredits: parseFloat(row.skills_future_credits),
      creditExpiryDate: row.credit_expiry_date,
      preferences: row.preferences,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (email, password, first_name, last_name,
                        skills_future_credits, credit_expiry_date, preferences)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, password, first_name, last_name,
                skills_future_credits, credit_expiry_date, preferences,
                created_at, updated_at
    `;

    const values = [
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.skillsFutureCredits,
      userData.creditExpiryDate,
      JSON.stringify(userData.preferences || {}),
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      skillsFutureCredits: parseFloat(row.skills_future_credits),
      creditExpiryDate: row.credit_expiry_date,
      preferences: row.preferences,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.email !== undefined) {
      setClause.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.firstName !== undefined) {
      setClause.push(`first_name = $${paramCount++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setClause.push(`last_name = $${paramCount++}`);
      values.push(updates.lastName);
    }
    if (updates.skillsFutureCredits !== undefined) {
      setClause.push(`skills_future_credits = $${paramCount++}`);
      values.push(updates.skillsFutureCredits);
    }
    if (updates.creditExpiryDate !== undefined) {
      setClause.push(`credit_expiry_date = $${paramCount++}`);
      values.push(updates.creditExpiryDate);
    }
    if (updates.preferences !== undefined) {
      setClause.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(updates.preferences));
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, password, first_name, last_name,
                skills_future_credits, credit_expiry_date, preferences,
                created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      skillsFutureCredits: parseFloat(row.skills_future_credits),
      creditExpiryDate: row.credit_expiry_date,
      preferences: row.preferences,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async updatePreferences(id: string, preferences: UserPreferences): Promise<User | null> {
    const query = `
      UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, password, first_name, last_name,
                skills_future_credits, credit_expiry_date, preferences,
                created_at, updated_at
    `;

    const result = await pool.query(query, [JSON.stringify(preferences), id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      skillsFutureCredits: parseFloat(row.skills_future_credits),
      creditExpiryDate: row.credit_expiry_date,
      preferences: row.preferences,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}