USE santap;
-- Inspect duplicates first. Resolve them explicitly before adding the constraint.
SELECT nim, served_date, period_id, COUNT(*) AS duplicate_count
FROM meal_records GROUP BY nim, served_date, period_id HAVING COUNT(*) > 1;
ALTER TABLE meal_periods ADD COLUMN paused_date DATE NULL;
ALTER TABLE meal_records ADD UNIQUE KEY unique_retrieval (nim, served_date, period_id);
-- Serving times are display metadata. The shared schedule also handles Friday/Saturday.
UPDATE meal_periods SET serving_time = '05:30-08:00' WHERE id = 'morning';
UPDATE meal_periods SET serving_time = '11:30-13:00' WHERE id = 'afternoon';
UPDATE meal_periods SET serving_time = '17:00-18:30' WHERE id = 'evening';
