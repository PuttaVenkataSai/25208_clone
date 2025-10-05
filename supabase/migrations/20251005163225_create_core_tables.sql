/*
  # Core Database Schema for Logistics Platform

  ## Overview
  This migration creates the foundational tables for a logistics management system including user profiles, plants, inventories, orders, rakes (trains), and planning data.

  ## New Tables

  ### 1. `user_profiles`
  Extended user information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `email` (text, unique)
  - `phone` (text)
  - `role` (text) - user role in the system
  - `avatar_url` (text)
  - `preferences` (jsonb) - user preferences and settings
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `plants`
  Manufacturing plants and warehouses
  - `id` (uuid, primary key)
  - `name` (text) - plant name
  - `location` (text) - address/location description
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `plant_type` (text) - manufacturing, warehouse, distribution center
  - `capacity` (integer) - storage capacity
  - `status` (text) - active, inactive
  - `contact_info` (jsonb) - contact details
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `inventories`
  Inventory tracking for each plant
  - `id` (uuid, primary key)
  - `plant_id` (uuid, references plants)
  - `product_name` (text)
  - `product_sku` (text)
  - `quantity` (integer)
  - `unit` (text) - tons, pieces, etc.
  - `min_threshold` (integer) - minimum stock level
  - `max_capacity` (integer) - maximum stock level
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. `orders`
  Customer orders and shipments
  - `id` (uuid, primary key)
  - `order_number` (text, unique)
  - `customer_name` (text)
  - `origin_plant_id` (uuid, references plants)
  - `destination` (text)
  - `destination_lat` (numeric)
  - `destination_lng` (numeric)
  - `product_name` (text)
  - `quantity` (integer)
  - `unit` (text)
  - `status` (text) - pending, in_transit, delivered, cancelled
  - `priority` (text) - low, medium, high, urgent
  - `order_date` (timestamptz)
  - `expected_delivery` (timestamptz)
  - `actual_delivery` (timestamptz)
  - `assigned_rake_id` (uuid, references rakes)
  - `notes` (text)
  - `created_by` (uuid, references auth.users)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `rakes`
  Railway rake (train) details
  - `id` (uuid, primary key)
  - `rake_number` (text, unique)
  - `rake_type` (text) - freight, express, special
  - `capacity` (integer) - in tons
  - `current_location` (text)
  - `current_lat` (numeric)
  - `current_lng` (numeric)
  - `status` (text) - available, in_transit, maintenance, loading, unloading
  - `assigned_route` (text)
  - `operator` (text)
  - `last_maintenance` (timestamptz)
  - `next_maintenance` (timestamptz)
  - `specifications` (jsonb) - technical specs
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `generated_plans`
  AI-generated logistics plans
  - `id` (uuid, primary key)
  - `plan_name` (text)
  - `plan_type` (text) - route_optimization, inventory_allocation, demand_forecast
  - `parameters` (jsonb) - input parameters used
  - `results` (jsonb) - plan output and recommendations
  - `status` (text) - draft, approved, executed, archived
  - `confidence_score` (numeric) - AI confidence level
  - `created_by` (uuid, references auth.users)
  - `approved_by` (uuid, references auth.users)
  - `execution_date` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Authenticated users can read all data
  - Users can update their own profiles
  - Only authenticated users can create/update operational data
  - Plans require authentication for creation and updates

  ## Indexes
  Created for frequently queried columns to optimize performance
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text DEFAULT 'user',
  avatar_url text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  plant_type text DEFAULT 'warehouse',
  capacity integer DEFAULT 0,
  status text DEFAULT 'active',
  contact_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventories table
CREATE TABLE IF NOT EXISTS inventories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity integer DEFAULT 0,
  unit text DEFAULT 'tons',
  min_threshold integer DEFAULT 0,
  max_capacity integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(plant_id, product_sku)
);

-- Create rakes table
CREATE TABLE IF NOT EXISTS rakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rake_number text UNIQUE NOT NULL,
  rake_type text DEFAULT 'freight',
  capacity integer DEFAULT 0,
  current_location text,
  current_lat numeric,
  current_lng numeric,
  status text DEFAULT 'available',
  assigned_route text,
  operator text,
  last_maintenance timestamptz,
  next_maintenance timestamptz,
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  origin_plant_id uuid REFERENCES plants(id),
  destination text NOT NULL,
  destination_lat numeric,
  destination_lng numeric,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit text DEFAULT 'tons',
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  order_date timestamptz DEFAULT now(),
  expected_delivery timestamptz,
  actual_delivery timestamptz,
  assigned_rake_id uuid REFERENCES rakes(id),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create generated_plans table
CREATE TABLE IF NOT EXISTS generated_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  plan_type text NOT NULL,
  parameters jsonb DEFAULT '{}'::jsonb,
  results jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft',
  confidence_score numeric,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  execution_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventories_plant_id ON inventories(plant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_origin_plant ON orders(origin_plant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_rake ON orders(assigned_rake_id);
CREATE INDEX IF NOT EXISTS idx_rakes_status ON rakes(status);
CREATE INDEX IF NOT EXISTS idx_plans_created_by ON generated_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_plans_status ON generated_plans(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for plants
CREATE POLICY "Authenticated users can view plants"
  ON plants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create plants"
  ON plants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update plants"
  ON plants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for inventories
CREATE POLICY "Authenticated users can view inventories"
  ON inventories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create inventories"
  ON inventories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventories"
  ON inventories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for orders
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for rakes
CREATE POLICY "Authenticated users can view rakes"
  ON rakes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rakes"
  ON rakes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rakes"
  ON rakes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for generated_plans
CREATE POLICY "Authenticated users can view plans"
  ON generated_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create plans"
  ON generated_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own plans"
  ON generated_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own plans"
  ON generated_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);