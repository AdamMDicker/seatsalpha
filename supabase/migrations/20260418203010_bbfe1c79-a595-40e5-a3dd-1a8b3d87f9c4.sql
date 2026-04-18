-- Reset Carole's Red Sox transfer back to pending so Sim is forced to redo the
-- transfer through Ticketmaster. The previous "verified" status was incorrectly
-- set because the screenshot passed AI checks but the actual TM transfer email
-- never reached our inbound alias.
UPDATE public.order_transfers
SET status = 'pending',
    confirmed_at = NULL,
    transfer_image_url = NULL,
    uploaded_at = NULL,
    verification_result = NULL,
    seller_reminder_sent_at = NULL
WHERE id = '07f0b480-8964-4b3a-be0f-9edd8fa7cad6';

-- Notify Sim in-app to take action
INSERT INTO public.notifications (user_id, type, title, body, metadata)
VALUES (
  'dbe89545-087e-4404-89b0-715e116ff522',
  'transfer_proof_required',
  'Action required — Send transfer to inbound alias',
  'Your Red Sox transfer was reset. Please initiate the Ticketmaster transfer to order-oodmxpvaoh@inbound.seats.ca so the buyer can receive their tickets. Then upload your screenshot proof.',
  jsonb_build_object(
    'transfer_id', '07f0b480-8964-4b3a-be0f-9edd8fa7cad6',
    'transfer_email_alias', 'order-oodmxpvaoh@inbound.seats.ca',
    'event_title', 'Toronto Blue Jays vs Red Sox'
  )
);