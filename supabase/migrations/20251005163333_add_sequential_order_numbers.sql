/*
  # Add Sequential Order Numbers

  ## Overview
  This migration adds a sequential order numbering system to replace random order numbers.

  ## Changes
  1. Add a new sequence for order numbers
  2. Update the order_number column to use sequential numbers
  3. Add a function to automatically generate order numbers
  4. Create a trigger to auto-populate order numbers on insert

  ## Notes
  - Order numbers will be formatted as "ORD-000001", "ORD-000002", etc.
  - Existing orders will keep their current order numbers
  - New orders will automatically get sequential numbers
*/

-- Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  next_id bigint;
BEGIN
  next_id := nextval('order_number_seq');
  RETURN 'ORD-' || LPAD(next_id::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set order number on insert
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();