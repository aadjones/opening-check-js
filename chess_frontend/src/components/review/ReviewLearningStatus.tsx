import React from 'react';
import { useReviewSchedule } from '../../hooks/useReviewSchedule';
import { useLearningStats } from '../../hooks/useLearningStats';
import styles from './ReviewLearningStatus.module.css';

const ReviewLearningStatus: React.FC = () => {
  const { stats: learningStats, loading: learningLoading, error: learningError } = useLearningStats();
  const { schedule, loading: scheduleLoading, error: scheduleError } = useReviewSchedule();

  const loading = learningLoading || scheduleLoading;
  const error = learningError || scheduleError;

  // Calculate reviews due in different time periods using real data
  const getReviewsDue = () => {
    if (!schedule || schedule.length === 0) {
      return { tomorrow: 0, dayAfter: 0, oneWeek: 0 };
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];
    
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const oneWeekStr = oneWeekFromNow.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const tomorrowEntry = schedule.find(entry => entry.date === tomorrowStr);
    const dayAfterEntry = schedule.find(entry => entry.date === dayAfterStr);
    
    // For one week, sum all reviews from tomorrow until then
    const oneWeekCount = schedule
      .filter(entry => entry.date > todayStr && entry.date <= oneWeekStr)
      .reduce((sum, entry) => sum + entry.count, 0);

    return {
      tomorrow: tomorrowEntry?.count || 0,
      dayAfter: dayAfterEntry?.count || 0,
      oneWeek: oneWeekCount
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Study Progress</h3>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Study Progress</h3>
        <div className={styles.error}>Failed to load progress</div>
      </div>
    );
  }

  const reviewsDue = getReviewsDue();

  // Get real learning counts from the database
  const learningCount = learningStats?.learningCount || 0;
  const matureCount = learningStats?.matureCount || 0;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Study Progress</h3>
      
      {/* Learning Progress Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Learning Status</h4>
        <div className={styles.progressGrid}>
          <div className={styles.progressItem}>
            <span className={styles.progressLabel}>Learning</span>
            <span className={styles.progressCount} style={{ color: '#3b82f6' }}>
              {learningCount}
            </span>
          </div>
          <div className={styles.progressItem}>
            <span className={styles.progressLabel}>Mature</span>
            <span className={styles.progressCount} style={{ color: '#10b981' }}>
              {matureCount}
            </span>
          </div>
        </div>
      </div>

      {/* Review Schedule Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Reviews Due</h4>
        <div className={styles.reviewSchedule}>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Tomorrow</span>
            <span className={styles.scheduleCount}>{reviewsDue.tomorrow}</span>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Day After</span>
            <span className={styles.scheduleCount}>{reviewsDue.dayAfter}</span>
          </div>
          <div className={styles.scheduleItem}>
            <span className={styles.scheduleLabel}>Next Week</span>
            <span className={styles.scheduleCount}>{reviewsDue.oneWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewLearningStatus; 