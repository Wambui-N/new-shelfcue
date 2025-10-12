// Test script to directly test database insertion
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
  console.log('Testing database insertion...');
  
  const testData = {
    user_id: '7f8ed574-9527-42e7-ac35-5242014a63da',
    access_token: 'test_token',
    refresh_token: 'test_refresh',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now in seconds
    updated_at: new Date().toISOString()
  };
  
  console.log('Test data:', testData);
  
  try {
    const { data, error } = await supabase
      .from('user_google_tokens')
      .upsert(testData)
      .select();
    
    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log('✅ Success! Inserted:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testInsert();
