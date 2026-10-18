-- Only needed if the portal still has no "Admin" tab.
-- Lists every account with its email, whether it is an admin, and how many projects it owns.
select s.user_id, s.email, s.created_at,
       exists (select 1 from public.admins a where a.user_id = s.user_id) as is_admin,
       (select count(*) from public.clients c where c.owner_id = s.user_id) as projects
from public.signups s
union all
select c.owner_id, c.owner_email, min(c.created_at), exists (select 1 from public.admins a where a.user_id = c.owner_id), count(*)
from public.clients c where c.owner_id not in (select user_id from public.signups)
group by c.owner_id, c.owner_email
order by 3;
