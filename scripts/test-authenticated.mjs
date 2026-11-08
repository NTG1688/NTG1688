import { createClient } from '@supabase/supabase-js';

const url = 'https://flcqouvjmuhfuemybokk.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY3FvdXZqbXVoZnVlbXlib2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTQ0MzIsImV4cCI6MjEwOTczMDQzMn0.dcbkiDMt04w4M_e1Jplzz7lS_VqJsgfz9200AG2MpgM';

const supabase = createClient(url, anonKey);

async function testAuthQueries() {
  console.log("=== TESTING AUTHENTICATED ACCESS ===");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer.test@namtrunglog.com',
    password: 'NamTrungLog@2026',
  });

  if (authError) {
    console.error("Sign in failed:", authError.message);
    return;
  }

  const user = authData.user;
  console.log("Logged in user:", user.id, user.email);

  // 1. Create Profile if not exists
  const { data: profile, error: errProfile } = await supabase.from('profiles').upsert({
    id: user.id,
    user_code: 'NT9999',
    username: 'khachhangtest',
    full_name: 'Khách Hàng Thử Nghiệm',
    email: user.email,
    role: 'customer',
    level_id: 1,
    wallet_balance: 50000000,
  }).select();

  console.log("Profile upsert:", errProfile ? errProfile.message : profile);

  // 2. Query Orders for this customer
  const { data: orders, error: errOrders } = await supabase.from('orders').select('*');
  console.log("Orders count for this customer:", errOrders ? errOrders.message : orders.length);

  // 3. Insert a sample order
  const { data: newOrder, error: errNewOrder } = await supabase.from('orders').insert({
    order_code: 'NTG-ORD-202611-TEST',
    customer_id: user.id,
    status: 1,
    order_type: 'order',
    exchange_rate: 4015,
    total_cny: 500,
    total_vnd: 2007500,
    deposit_amount: 1405250,
    min_deposit_amount: 1405250,
    remaining_amount: 602250,
    contract_type: 'Chính ngạch',
    shop_name: 'Taobao Store Test',
  }).select();

  console.log("New order insert:", errNewOrder ? errNewOrder.message : newOrder);
}

testAuthQueries();
