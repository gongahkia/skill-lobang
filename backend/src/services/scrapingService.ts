import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { Course, ScrapingJob } from '@/types';
import { CourseModel } from '@/models/Course';
import { pool } from '@/database/connection';

export class ScrapingService {
  private static readonly DELAY_BETWEEN_REQUESTS = parseInt(process.env.SCRAPING_DELAY || '1000');
  private static readonly MAX_CONCURRENT_REQUESTS = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5');

  static async createScrapingJob(source: string): Promise<string> {
    const query = `
      INSERT INTO scraping_jobs (source, status)
      VALUES ($1, 'pending')
      RETURNING id
    `;
    const result = await pool.query(query, [source]);
    return result.rows[0].id;
  }

  static async updateScrapingJob(
    id: string,
    updates: Partial<ScrapingJob>
  ): Promise<void> {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbColumn = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        setClause.push(`${dbColumn} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (setClause.length === 0) return;

    values.push(id);
    const query = `
      UPDATE scraping_jobs SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
    `;

    await pool.query(query, values);
  }

  static async scrapeSkillsFutureDirectory(): Promise<void> {
    const jobId = await this.createScrapingJob('skillsfuture_directory');

    try {
      await this.updateScrapingJob(jobId, { status: 'running' });

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      let coursesFound = 0;
      let coursesUpdated = 0;
      const errors: string[] = [];

      try {
        const baseUrl = 'https://www.skillsfuture.gov.sg/skills-framework/courses';

        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        await page.waitForSelector('.course-item', { timeout: 10000 });

        const courseElements = await page.$$('.course-item');
        coursesFound = courseElements.length;

        for (let i = 0; i < courseElements.length; i++) {
          try {
            const courseElement = courseElements[i];

            const title = await courseElement.$eval('.course-title', el => el.textContent?.trim() || '');
            const provider = await courseElement.$eval('.course-provider', el => el.textContent?.trim() || '');
            const priceText = await courseElement.$eval('.course-price', el => el.textContent?.trim() || '');
            const description = await courseElement.$eval('.course-description', el => el.textContent?.trim() || '');

            const priceMatch = priceText.match(/\$([0-9,]+\.?\d*)/);
            const priceAfterSubsidy = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

            const subsidyMatch = priceText.match(/(\d+)%\s*subsidy/i);
            const subsidyPercentage = subsidyMatch ? parseInt(subsidyMatch[1]) : 0;

            const priceBeforeSubsidy = subsidyPercentage > 0
              ? priceAfterSubsidy / (1 - subsidyPercentage / 100)
              : priceAfterSubsidy;

            const courseData: Omit<Course, 'id' | 'createdAt'> = {
              title,
              description,
              provider,
              providerId: '', // Will be set after provider lookup
              category: 'General',
              skillArea: 'General',
              duration: 40, // Default duration
              priceBeforeSubsidy,
              priceAfterSubsidy,
              subsidyPercentage,
              availableSeats: 20,
              totalSeats: 20,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              frequency: 'weekday',
              mode: 'in-person',
              location: 'Singapore',
              prerequisites: [],
              learningOutcomes: ['Complete the course objectives'],
              sourceUrl: baseUrl,
              lastUpdated: new Date(),
            };

            await CourseModel.create(courseData);
            coursesUpdated++;

            await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));

          } catch (error) {
            errors.push(`Error processing course ${i}: ${error}`);
          }
        }

      } catch (error) {
        errors.push(`Main scraping error: ${error}`);
      } finally {
        await browser.close();
      }

      await this.updateScrapingJob(jobId, {
        status: 'completed',
        coursesFound,
        coursesUpdated,
        errors: errors.length > 0 ? errors : undefined,
        completedAt: new Date(),
      });

    } catch (error) {
      await this.updateScrapingJob(jobId, {
        status: 'failed',
        errors: [`Job failed: ${error}`],
        completedAt: new Date(),
      });
    }
  }

  static async scrapeSampleProvider(): Promise<void> {
    const jobId = await this.createScrapingJob('sample_provider');

    try {
      await this.updateScrapingJob(jobId, { status: 'running' });

      const sampleCourses = [
        {
          title: 'Data Analytics Fundamentals',
          description: 'Learn the basics of data analytics including Excel, SQL, and data visualization techniques.',
          provider: 'TechSkills Institute',
          category: 'Data & Analytics',
          skillArea: 'Data Science',
          duration: 40,
          priceBeforeSubsidy: 800,
          priceAfterSubsidy: 160,
          subsidyPercentage: 80,
          availableSeats: 15,
          totalSeats: 20,
          frequency: 'weekend' as const,
          mode: 'hybrid' as const,
          location: 'Singapore',
          prerequisites: ['Basic computer skills'],
          learningOutcomes: [
            'Master Excel for data analysis',
            'Write basic SQL queries',
            'Create effective data visualizations'
          ],
        },
        {
          title: 'Digital Marketing Essentials',
          description: 'Comprehensive course covering social media marketing, SEO, and Google Analytics.',
          provider: 'Marketing Pro Academy',
          category: 'Marketing & Communications',
          skillArea: 'Digital Marketing',
          duration: 32,
          priceBeforeSubsidy: 600,
          priceAfterSubsidy: 120,
          subsidyPercentage: 80,
          availableSeats: 25,
          totalSeats: 30,
          frequency: 'evening' as const,
          mode: 'online' as const,
          location: 'Online',
          prerequisites: [],
          learningOutcomes: [
            'Develop social media strategies',
            'Optimize websites for search engines',
            'Analyze marketing performance with Google Analytics'
          ],
        },
        {
          title: 'Python Programming for Beginners',
          description: 'Introduction to Python programming with hands-on projects and real-world applications.',
          provider: 'Code Academy Singapore',
          category: 'Information Technology',
          skillArea: 'Programming',
          duration: 60,
          priceBeforeSubsidy: 1200,
          priceAfterSubsidy: 240,
          subsidyPercentage: 80,
          availableSeats: 12,
          totalSeats: 15,
          frequency: 'weekday' as const,
          mode: 'in-person' as const,
          location: 'Singapore',
          prerequisites: ['Basic computer literacy'],
          learningOutcomes: [
            'Write Python programs',
            'Understand programming fundamentals',
            'Build simple applications'
          ],
        },
      ];

      let coursesUpdated = 0;

      for (const sampleCourse of sampleCourses) {
        const courseData: Omit<Course, 'id' | 'createdAt'> = {
          ...sampleCourse,
          providerId: '',
          startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random start in next 30 days
          endDate: new Date(Date.now() + (30 + sampleCourse.duration / 8) * 24 * 60 * 60 * 1000),
          registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          sourceUrl: 'https://sample-provider.com',
          lastUpdated: new Date(),
        };

        await CourseModel.create(courseData);
        coursesUpdated++;
      }

      await this.updateScrapingJob(jobId, {
        status: 'completed',
        coursesFound: sampleCourses.length,
        coursesUpdated,
        completedAt: new Date(),
      });

    } catch (error) {
      await this.updateScrapingJob(jobId, {
        status: 'failed',
        errors: [`Job failed: ${error}`],
        completedAt: new Date(),
      });
    }
  }

  static async runAllScrapers(): Promise<void> {
    console.log('Starting course data aggregation...');

    try {
      await this.scrapeSampleProvider();
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

      // Uncomment when ready to scrape real data
      // await this.scrapeSkillsFutureDirectory();

      console.log('Course data aggregation completed');
    } catch (error) {
      console.error('Error in course aggregation:', error);
    }
  }
}