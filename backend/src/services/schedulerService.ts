import cron from 'node-cron';
import { ScrapingService } from './scrapingService';

export class SchedulerService {
  static start(): void {
    console.log('Starting scheduler service...');

    // Run course data scraping every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running scheduled course data scraping...');
      try {
        await ScrapingService.runAllScrapers();
        console.log('Scheduled scraping completed successfully');
      } catch (error) {
        console.error('Scheduled scraping failed:', error);
      }
    });

    // Run initial scraping on startup (after 1 minute)
    setTimeout(async () => {
      console.log('Running initial course data scraping...');
      try {
        await ScrapingService.runAllScrapers();
        console.log('Initial scraping completed successfully');
      } catch (error) {
        console.error('Initial scraping failed:', error);
      }
    }, 60000); // 1 minute delay

    console.log('Scheduler service started');
  }
}