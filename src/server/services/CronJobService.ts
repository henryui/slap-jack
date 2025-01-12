import { CronJob } from 'cron';

const SYSTEM_TZ = 'America/Toronto';

class CronJobService {
  public startCronJob(time: string, fcn: () => void) {
    new CronJob(time, fcn, null, true, SYSTEM_TZ);
  }
}

export default new CronJobService();
