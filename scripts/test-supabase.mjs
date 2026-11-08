import { createClient } from '@supabase/supabase-js';

const url = 'https://flcqouvjmuhfuemybokk.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY3FvdXZqbXVoZnVlbXlib2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTQ0MzIsImV4cCI6MjEwOTczMDQzMn0.dcbkiDMt04w4M_e1Jplzz7lS_VqJsgfz9200AG2MpgM';

const supabase = createClient(url, anonKey);

async function testConnection() {
  console.log("=== TESTING SUPABASE CONNECTION ===");
  try {
    // Check system_settings
    const { data: settings, error: errSettings } = await supabase.from('system_settings').select('*');
    if (errSettings) {
      console.log("system_settings status:", errSettings.message, `(${errSettings.code})`);
    } else {
      console.log("system_settings count:", settings.length);
    }

    // Check warehouses
    const { data: wh, error: errWh } = await supabase.from('warehouses').select('*');
    if (errWh) {
      console.log("warehouses status:", errWh.message, `(${errWh.code})`);
    } else {
      console.log("warehouses count:", wh.length, wh);
    }

    // Check orders
    const { data: orders, error: errOrders } = await supabase.from('orders').select('id, order_code, status').limit(5);
    if (errOrders) {
      console.log("orders status:", errOrders.message, `(${errOrders.code})`);
    } else {
      console.log("orders count:", orders.length);
    }
  } catch (err) {
    console.error("Test error:", err);
  }
}

testConnection();
