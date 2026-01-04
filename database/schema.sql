-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Roadmaps Table (Stores the generated JSON tree)
create table roadmaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  topic text not null,
  roadmap_data jsonb not null, -- The full dependency tree
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Nodes Table (Tracks progress for each specific subtopic/node in a roadmap)
create table nodes (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id uuid references roadmaps(id) not null,
  node_id text not null, -- The ID from the JSON tree (e.g., "1.2")
  title text not null,
  status text check (status in ('locked', 'unlocked', 'completed', 'mastered')) default 'locked',
  current_difficulty text check (current_difficulty in ('easy', 'medium', 'hard')) default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz Results Table
create table quiz_results (
  id uuid default uuid_generate_v4() primary key,
  node_id uuid references nodes(id) not null,
  score integer not null, -- Percentage (0-100)
  total_questions integer not null,
  correct_answers integer not null,
  time_taken_seconds integer,
  feedback_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
