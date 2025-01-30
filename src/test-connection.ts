import { supabase } from './lib/supabase';

export async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    const { data, error } = await supabase.from('marketing_channels').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase Connection Error:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log('📊 Test query result:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected connection error:', err);
    return false;
  }
} 