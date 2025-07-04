import React from 'react';
import { useReviewSchedule } from '../../hooks/useReviewSchedule';
import styles from './ReviewTimePlanner.module.css';

const ReviewTimePlanner: React.FC = () => {
  const { schedule, loading, error } = useReviewSchedule();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Check if it's within a week
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }

    // Fallback to formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'Low':
        return '#10b981';
      case 'Normal':
        return '#3b82f6';
      case 'High':
        return '#f59e0b';
      case 'Extreme':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Review Schedule</h3>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Review Schedule</h3>
        <div className={styles.error}>Failed to load schedule</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Review Schedule</h3>
      
      {schedule.length === 0 ? (
        <div className={styles.noSchedule}>No reviews scheduled</div>
      ) : (
        <div className={styles.scheduleList}>
          {schedule.slice(0, 5).map((entry) => (
            <div key={entry.date} className={styles.scheduleItem}>
              <span className={styles.dateLabel}>
                {formatDate(entry.date)}
              </span>
              <div className={styles.reviewInfo}>
                <span className={styles.countBadge}>
                  {entry.count}
                </span>
                <span 
                  className={styles.workloadIndicator}
                  style={{ backgroundColor: getWorkloadColor(entry.workload) }}
                  title={entry.workload}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewTimePlanner; 