-- Make Luke a portal admin. Paste all of this into Supabase → SQL Editor → Run.
-- It finds your account by email in the sign-ups list, so sign in at
-- minshallgroup.com/portal once first. One row back = done.
insert into public.admins (user_id, note)
select user_id, 'Luke' from public.signups
where lower(email) = 'luke.minshall@knexu.co.uk'
on conflict do nothing
returning user_id;
