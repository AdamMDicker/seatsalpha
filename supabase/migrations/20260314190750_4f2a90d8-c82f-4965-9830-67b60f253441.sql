UPDATE events 
SET event_date = event_date + INTERVAL '4 hours'
WHERE title LIKE '%Toronto Blue Jays vs%' 
AND venue = 'Rogers Centre';