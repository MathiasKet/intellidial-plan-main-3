import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Test the database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.rpc('version');
    
    if (error) throw error;
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    return false;
  }
};

// Execute a raw SQL query (use with caution)
export const query = async (sql, params = []) => {
  try {
    const { data, error } = await supabase.rpc('exec', { 
      query: sql,
      params
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Database query error: ${error.message}`, { sql });
    throw error;
  }
};

// Helper to handle pagination
export const paginate = (queryBuilder, { page = 1, pageSize = 10 }) => {
  const offset = (page - 1) * pageSize;
  return queryBuilder.range(offset, offset + pageSize - 1);
};

// Helper to handle common CRUD operations
export const createRecord = async (table, data) => {
  const { data: record, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();
    
  if (error) {
    logger.error(`Error creating record in ${table}:`, error);
    throw error;
  }
  
  return record;
};

export const updateRecord = async (table, id, data) => {
  const { data: record, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    logger.error(`Error updating record in ${table}:`, error);
    throw error;
  }
  
  return record;
};

export const deleteRecord = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
    
  if (error) {
    logger.error(`Error deleting record from ${table}:`, error);
    throw error;
  }
  
  return true;
};

export const findRecord = async (table, conditions) => {
  let query = supabase.from(table).select('*');
  
  // Add conditions
  Object.entries(conditions).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  const { data, error } = await query.single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    logger.error(`Error finding record in ${table}:`, error);
    throw error;
  }
  
  return data || null;
};

export const findRecords = async (table, conditions = {}, { page, pageSize } = {}) => {
  let query = supabase.from(table).select('*', { count: 'exact' });
  
  // Add conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });
  
  // Apply pagination if provided
  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);
  }
  
  const { data, count, error } = await query;
  
  if (error) {
    logger.error(`Error finding records in ${table}:`, error);
    throw error;
  }
  
  return {
    data,
    count: count || 0,
    page: page || 1,
    pageSize: pageSize || data.length,
    totalPages: pageSize ? Math.ceil((count || 0) / pageSize) : 1,
  };
};
