UPDATE public.resellers
SET is_enabled = true, is_suspended = false, status = 'live', updated_at = now()
WHERE id = '37643642-dd86-49c2-82f5-031a0b7651d2';

INSERT INTO public.reseller_leagues (reseller_id, league, is_enabled)
VALUES ('37643642-dd86-49c2-82f5-031a0b7651d2', 'MLB', true)
ON CONFLICT DO NOTHING;