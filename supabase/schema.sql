-- LOGOUT — DB 스키마 (Legacy locations/records + LOGOUT visits)
-- Supabase SQL Editor에서 그대로 실행

create extension if not exists "pgcrypto";

-- 철봉 장소
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  description text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists locations_lat_lng_idx on locations (lat, lng);

-- 기록
-- record_type: pullup(풀업), chinup(친업), muscleup(머슬업), hang(데드행 초)
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 12),
  record_type text not null check (record_type in ('pullup','chinup','muscleup','hang')),
  value integer not null check (value > 0 and value < 100000),
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists records_location_type_idx on records (location_id, record_type, value desc);
create index if not exists records_created_at_idx on records (created_at desc);

-- RLS
alter table locations enable row level security;
alter table records enable row level security;

-- 모두 읽기 허용
drop policy if exists "locations are viewable by everyone" on locations;
create policy "locations are viewable by everyone"
  on locations for select using (true);

drop policy if exists "records are viewable by everyone" on records;
create policy "records are viewable by everyone"
  on records for select using (true);

-- 누구나 등록 가능 (MVP: 익명 닉네임 기반)
drop policy if exists "anyone can insert locations" on locations;
create policy "anyone can insert locations"
  on locations for insert with check (true);

drop policy if exists "anyone can insert records" on records;
create policy "anyone can insert records"
  on records for insert with check (true);

-- 샘플 데이터 (서울 일부 공원)
insert into locations (name, address, description, lat, lng) values
  ('한강공원 뚝섬 철봉', '서울 광진구 자양동', '한강 보면서 운동하는 명소', 37.5314, 127.0666),
  ('올림픽공원 평화광장', '서울 송파구 방이동', '철봉 3개, 평행봉 1개', 37.5202, 127.1218),
  ('서울숲 운동기구존', '서울 성동구 성수동1가', '나무 그늘 아래 철봉', 37.5446, 127.0378),
  ('남산 야외운동기구', '서울 중구 회현동1가', '계단 옆 철봉, 높이 적당', 37.5519, 126.9810),
  ('보라매공원 헬스존', '서울 동작구 신대방동', '동네 고수들 모이는 곳', 37.4936, 126.9197)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- 시드 import 지원 — 외부 데이터 출처 추적 + 공간 dedup
-- ─────────────────────────────────────────────────────────────

alter table locations add column if not exists source text;
-- 'public_data' | 'osm' | 'manual' | 'user'
alter table locations add column if not exists external_id text;
-- 원본 데이터셋에서의 식별자 (재import 시 dedup)
alter table locations add column if not exists verified boolean not null default false;
-- 큐레이션 완료 여부 (이름·설명 톤 입혔는지)

create unique index if not exists locations_source_external_id_uniq
  on locations (source, external_id)
  where source is not null and external_id is not null;

-- 두 좌표 사이 거리 N미터 이내인 기존 location 조회 (Haversine).
-- import 스크립트가 30m dedup에 사용.
create or replace function locations_within(
  in_lat double precision,
  in_lng double precision,
  in_meters double precision
)
returns setof locations
language sql stable as $$
  select * from locations
  where 6371000 * 2 * asin(sqrt(
    power(sin(radians((lat - in_lat) / 2)), 2) +
    cos(radians(in_lat)) * cos(radians(lat)) *
    power(sin(radians((lng - in_lng) / 2)), 2)
  )) <= in_meters;
$$;

-- ─────────────────────────────────────────────────────────────
-- LOGOUT 핵심 루프 — 방문(visit) · 출석(streak)
--   · 식별: Supabase 익명 인증 (auth.uid())
--   · 인증: GPS 반경 — record_visit() 가 서버에서 거리 검증
--   · 기록(records)/랭킹은 Legacy — 그대로 유지, 신규 개발 중단
-- ─────────────────────────────────────────────────────────────

-- 방문 기록 (streak 은 "밖에 나간 날"의 연속으로 계산)
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  nickname text,
  lat double precision,
  lng double precision,
  distance_m double precision,           -- 인증 시점 철봉과의 거리(검증 기록)
  visit_date date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);

-- 같은 사람 · 같은 장소 · 하루 1회 (중복 탭 방지 + 멱등)
create unique index if not exists visits_user_loc_day_uniq
  on visits (user_id, location_id, visit_date);
create index if not exists visits_user_date_idx
  on visits (user_id, visit_date desc);

alter table visits enable row level security;

-- 본인 방문만 조회 (streak 계산용; 타인 방문은 노출 불필요)
drop policy if exists "users read own visits" on visits;
create policy "users read own visits"
  on visits for select using (auth.uid() = user_id);
-- 직접 insert 정책 없음 → record_visit()(SECURITY DEFINER)로만 기록 = 거리 검증 강제

-- 방문 인증: 서버에서 Haversine 거리 검증 후 기록 (반경 밖이면 거부)
create or replace function record_visit(
  in_location_id uuid,
  in_lat double precision,
  in_lng double precision,
  in_nickname text default null,
  in_radius_m double precision default 100
)
returns visits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_loc  locations;
  v_dist double precision;
  v_row  visits;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_loc from locations where id = in_location_id;
  if not found then
    raise exception 'LOCATION_NOT_FOUND';
  end if;

  v_dist := 6371000 * 2 * asin(sqrt(
    power(sin(radians((v_loc.lat - in_lat) / 2)), 2) +
    cos(radians(in_lat)) * cos(radians(v_loc.lat)) *
    power(sin(radians((v_loc.lng - in_lng) / 2)), 2)
  ));

  if v_dist > in_radius_m then
    raise exception 'TOO_FAR:%', round(v_dist)::int;
  end if;

  insert into visits (user_id, location_id, nickname, lat, lng, distance_m)
  values (v_uid, in_location_id, in_nickname, in_lat, in_lng, v_dist)
  on conflict (user_id, location_id, visit_date) do update
    set lat = excluded.lat,
        lng = excluded.lng,
        distance_m = excluded.distance_m,
        nickname = coalesce(excluded.nickname, visits.nickname)
  returning * into v_row;

  return v_row;
end;
$$;

-- 내 출석 통계 — 연속 출석(streak) · 총 방문 · 오늘 방문 여부
create or replace function my_streak()
returns table (
  current_streak  int,
  longest_streak  int,
  total_visits    bigint,
  distinct_days   bigint,
  today_visited   boolean,
  last_visit_date date
)
language sql
security definer
set search_path = public
stable
as $$
  with v as (
    select * from visits where user_id = auth.uid()
  ),
  days as (
    select distinct visit_date as d from v
  ),
  ordered as (
    select d, row_number() over (order by d)::int as rn from days
  ),
  -- gaps-and-islands: 연속된 날짜는 (d - rn) 이 같은 값으로 묶인다
  islands as (
    select (d - rn) as grp, count(*)::int as len, max(d) as end_d
    from ordered
    group by (d - rn)
  ),
  t as (select (now() at time zone 'Asia/Seoul')::date as today)
  select
    coalesce((
      select i.len from islands i, t
      where i.end_d >= t.today - 1            -- 오늘 또는 어제까지 이어진 것만 "현재"
      order by i.end_d desc limit 1
    ), 0)                                                    as current_streak,
    coalesce((select max(len) from islands), 0)             as longest_streak,
    (select count(*) from v)                                as total_visits,
    (select count(*) from days)                             as distinct_days,
    (select exists(select 1 from days, t where d = t.today)) as today_visited,
    (select max(d) from days)                               as last_visit_date;
$$;

grant execute on function record_visit(uuid, double precision, double precision, text, double precision)
  to anon, authenticated;
grant execute on function my_streak() to anon, authenticated;
