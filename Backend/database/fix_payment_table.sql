-- Fix Payment table schema
-- Make slip_file column nullable since we're using slip_file_path instead

USE sit_portal;

-- Check if slip_file column exists and modify it to be nullable
ALTER TABLE payments MODIFY COLUMN slip_file VARCHAR(500) NULL;

-- Alternatively, if you want to remove the column entirely (recommended):
-- ALTER TABLE payments DROP COLUMN slip_file;

-- Verify the change
DESCRIBE payments;

