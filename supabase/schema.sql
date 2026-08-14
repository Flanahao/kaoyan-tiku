begin;

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id text not null,
  data_type text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id, data_type),
  constraint user_progress_data_type_check check (
    data_type in (
      'status',
      'questionBad',
      'solutionBad',
      'notes',
      'lastPosition',
      'reviewPlan',
      'englishVocabulary',
      'sm2',
      'annot'
    )
  )
);

-- 兼容已部署的旧表：更新允许同步的数据类型。
alter table public.user_progress
  drop constraint if exists user_progress_data_type_check;
alter table public.user_progress
  add constraint user_progress_data_type_check check (
    data_type in ('status', 'questionBad', 'solutionBad', 'notes', 'lastPosition', 'reviewPlan', 'englishVocabulary', 'sm2', 'annot')
  );

alter table public.user_progress enable row level security;

revoke all on table public.user_progress from anon;
revoke all on table public.user_progress from public;
grant select, insert, update, delete
  on table public.user_progress
  to authenticated;

drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;
drop policy if exists "user_progress_delete_own" on public.user_progress;

create policy "user_progress_select_own"
on public.user_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "user_progress_insert_own"
on public.user_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "user_progress_update_own"
on public.user_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "user_progress_delete_own"
on public.user_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists user_progress_user_updated_idx
  on public.user_progress (user_id, updated_at desc);

commit;
