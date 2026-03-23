-- Delete tickets for away Blue Jays games
DELETE FROM tickets WHERE event_id IN (
  '172ef179-94ee-4e75-b94f-d28044a8f9c5',
  'be262d77-5bed-4ec1-b2bf-d503bd454784',
  '43660a45-07dc-4ba5-a3e4-ef9433f9973f',
  '4dcf3494-4437-45e3-8152-24c96b1fd539',
  '64276a4f-83e8-46f1-8288-efa7445a38d2',
  '7d8fb4a9-e757-4225-b07c-b55b5293014e'
);

-- Delete the away game events themselves
DELETE FROM events WHERE id IN (
  '172ef179-94ee-4e75-b94f-d28044a8f9c5',
  'be262d77-5bed-4ec1-b2bf-d503bd454784',
  '43660a45-07dc-4ba5-a3e4-ef9433f9973f',
  '4dcf3494-4437-45e3-8152-24c96b1fd539',
  '64276a4f-83e8-46f1-8288-efa7445a38d2',
  '7d8fb4a9-e757-4225-b07c-b55b5293014e'
);