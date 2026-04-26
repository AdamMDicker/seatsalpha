DELETE FROM tickets WHERE event_id IN (
  SELECT id FROM events
  WHERE title ILIKE '%blue jays%'
    AND (title ILIKE '%Angles%' OR title ILIKE '%A''s vs%')
);

DELETE FROM events
WHERE title ILIKE '%blue jays%'
  AND (title ILIKE '%Angles%' OR title ILIKE '%A''s vs%');