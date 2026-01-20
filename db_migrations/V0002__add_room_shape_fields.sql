-- Add width, height and polygon columns to rooms table
ALTER TABLE rooms 
  ADD COLUMN width INTEGER,
  ADD COLUMN height INTEGER,
  ADD COLUMN polygon TEXT;