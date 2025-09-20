import { pool } from '@/database/connection';
import { Course, SearchFilters, PaginatedResponse } from '@/types';

export class CourseModel {
  static async findById(id: string): Promise<Course | null> {
    const query = `
      SELECT c.*, p.name as provider_name
      FROM courses c
      LEFT JOIN providers p ON c.provider_id = p.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCourse(result.rows[0]);
  }

  static async search(filters: SearchFilters): Promise<PaginatedResponse<Course>> {
    const whereConditions: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (filters.query) {
      whereConditions.push(`(
        to_tsvector('english', c.title) @@ plainto_tsquery('english', $${paramCount}) OR
        to_tsvector('english', c.description) @@ plainto_tsquery('english', $${paramCount}) OR
        c.title ILIKE $${paramCount + 1} OR
        c.description ILIKE $${paramCount + 1}
      )`);
      values.push(filters.query, `%${filters.query}%`);
      paramCount += 2;
    }

    if (filters.category) {
      whereConditions.push(`c.category = $${paramCount++}`);
      values.push(filters.category);
    }

    if (filters.skillArea) {
      whereConditions.push(`c.skill_area = $${paramCount++}`);
      values.push(filters.skillArea);
    }

    if (filters.provider) {
      whereConditions.push(`c.provider ILIKE $${paramCount++}`);
      values.push(`%${filters.provider}%`);
    }

    if (filters.minPrice !== undefined) {
      whereConditions.push(`c.price_after_subsidy >= $${paramCount++}`);
      values.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      whereConditions.push(`c.price_after_subsidy <= $${paramCount++}`);
      values.push(filters.maxPrice);
    }

    if (filters.startDate) {
      whereConditions.push(`c.start_date >= $${paramCount++}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      whereConditions.push(`c.end_date <= $${paramCount++}`);
      values.push(filters.endDate);
    }

    if (filters.frequency && filters.frequency.length > 0) {
      whereConditions.push(`c.frequency = ANY($${paramCount++})`);
      values.push(filters.frequency);
    }

    if (filters.mode && filters.mode.length > 0) {
      whereConditions.push(`c.mode = ANY($${paramCount++})`);
      values.push(filters.mode);
    }

    if (filters.location) {
      whereConditions.push(`c.location ILIKE $${paramCount++}`);
      values.push(`%${filters.location}%`);
    }

    if (filters.availableSeats) {
      whereConditions.push(`c.available_seats > 0`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const orderByMap: Record<string, string> = {
      price: 'c.price_after_subsidy',
      startDate: 'c.start_date',
      subsidyPercentage: 'c.subsidy_percentage',
      rating: '(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.course_id = c.id)',
      popularity: '(SELECT COUNT(*) FROM saved_courses sc WHERE sc.course_id = c.id)',
    };

    const orderBy = orderByMap[filters.sortBy || 'startDate'] || 'c.start_date';
    const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';

    const offset = ((filters.page || 1) - 1) * (filters.limit || 20);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      LEFT JOIN providers p ON c.provider_id = p.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT c.*, p.name as provider_name,
             (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.course_id = c.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.id) as review_count
      FROM courses c
      LEFT JOIN providers p ON c.provider_id = p.id
      ${whereClause}
      ORDER BY ${orderBy} ${sortOrder}
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    values.push(filters.limit || 20, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, values.slice(0, -2)),
      pool.query(dataQuery, values),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / (filters.limit || 20));
    const currentPage = filters.page || 1;

    return {
      data: dataResult.rows.map(this.mapRowToCourse),
      total,
      page: currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }

  static async create(courseData: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
    const query = `
      INSERT INTO courses (
        title, description, provider, provider_id, category, skill_area,
        duration, price_before_subsidy, price_after_subsidy, subsidy_percentage,
        available_seats, total_seats, start_date, end_date, registration_deadline,
        frequency, mode, location, prerequisites, learning_outcomes, source_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      courseData.title,
      courseData.description,
      courseData.provider,
      courseData.providerId,
      courseData.category,
      courseData.skillArea,
      courseData.duration,
      courseData.priceBeforeSubsidy,
      courseData.priceAfterSubsidy,
      courseData.subsidyPercentage,
      courseData.availableSeats,
      courseData.totalSeats,
      courseData.startDate,
      courseData.endDate,
      courseData.registrationDeadline,
      courseData.frequency,
      courseData.mode,
      courseData.location,
      courseData.prerequisites,
      courseData.learningOutcomes,
      courseData.sourceUrl,
    ];

    const result = await pool.query(query, values);
    return this.mapRowToCourse(result.rows[0]);
  }

  static async update(id: string, updates: Partial<Course>): Promise<Course | null> {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        const dbColumn = this.camelToSnake(key);
        setClause.push(`${dbColumn} = $${paramCount++}`);

        if (Array.isArray(value)) {
          values.push(value);
        } else {
          values.push(value);
        }
      }
    });

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`last_updated = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE courses SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCourse(result.rows[0]);
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM courses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getCategories(): Promise<string[]> {
    const query = 'SELECT DISTINCT category FROM courses WHERE category IS NOT NULL ORDER BY category';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getSkillAreas(): Promise<string[]> {
    const query = 'SELECT DISTINCT skill_area FROM courses WHERE skill_area IS NOT NULL ORDER BY skill_area';
    const result = await pool.query(query);
    return result.rows.map(row => row.skill_area);
  }

  static async getProviders(): Promise<string[]> {
    const query = 'SELECT DISTINCT provider FROM courses WHERE provider IS NOT NULL ORDER BY provider';
    const result = await pool.query(query);
    return result.rows.map(row => row.provider);
  }

  private static mapRowToCourse(row: any): Course {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      provider: row.provider,
      providerId: row.provider_id,
      category: row.category,
      skillArea: row.skill_area,
      duration: row.duration,
      priceBeforeSubsidy: parseFloat(row.price_before_subsidy),
      priceAfterSubsidy: parseFloat(row.price_after_subsidy),
      subsidyPercentage: parseFloat(row.subsidy_percentage),
      availableSeats: row.available_seats,
      totalSeats: row.total_seats,
      startDate: row.start_date,
      endDate: row.end_date,
      registrationDeadline: row.registration_deadline,
      frequency: row.frequency,
      mode: row.mode,
      location: row.location,
      prerequisites: row.prerequisites,
      learningOutcomes: row.learning_outcomes,
      sourceUrl: row.source_url,
      lastUpdated: row.last_updated,
      createdAt: row.created_at,
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}