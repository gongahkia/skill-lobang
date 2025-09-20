import { pool } from '@/database/connection';
import { Review, PaginatedResponse } from '@/types';

export class ReviewModel {
  static async findById(id: string): Promise<Review | null> {
    const query = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReview(result.rows[0]);
  }

  static async findByCourseId(
    courseId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Review & { authorName: string }>> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews
      WHERE course_id = $1
    `;

    const dataQuery = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, [courseId]),
      pool.query(dataQuery, [courseId, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(row => ({
        ...this.mapRowToReview(row),
        authorName: `${row.first_name} ${row.last_name.charAt(0)}.`,
      })),
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  static async findByProviderId(
    providerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Review & { authorName: string }>> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews
      WHERE provider_id = $1
    `;

    const dataQuery = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, [providerId]),
      pool.query(dataQuery, [providerId, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(row => ({
        ...this.mapRowToReview(row),
        authorName: `${row.first_name} ${row.last_name.charAt(0)}.`,
      })),
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  static async create(reviewData: Omit<Review, 'id' | 'helpful' | 'verified' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const query = `
      INSERT INTO reviews (user_id, course_id, provider_id, rating, title, content)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      reviewData.userId,
      reviewData.courseId || null,
      reviewData.providerId || null,
      reviewData.rating,
      reviewData.title,
      reviewData.content,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToReview(result.rows[0]);
  }

  static async update(id: string, updates: Partial<Review>): Promise<Review | null> {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.rating !== undefined) {
      setClause.push(`rating = $${paramCount++}`);
      values.push(updates.rating);
    }
    if (updates.title !== undefined) {
      setClause.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClause.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE reviews SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReview(result.rows[0]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM reviews WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async checkUserReviewExists(userId: string, courseId?: string, providerId?: string): Promise<boolean> {
    let query: string;
    let values: string[];

    if (courseId) {
      query = 'SELECT id FROM reviews WHERE user_id = $1 AND course_id = $2';
      values = [userId, courseId];
    } else if (providerId) {
      query = 'SELECT id FROM reviews WHERE user_id = $1 AND provider_id = $2';
      values = [userId, providerId];
    } else {
      return false;
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  private static mapRowToReview(row: any): Review {
    return {
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      providerId: row.provider_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      helpful: row.helpful,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}