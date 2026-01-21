-- Add new units to measurement_unit enum for length measurements
ALTER TYPE measurement_unit ADD VALUE IF NOT EXISTS 'm';
ALTER TYPE measurement_unit ADD VALUE IF NOT EXISTS 'cm';