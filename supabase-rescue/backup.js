const SUPABASE_URL = "https://nuxdoykhaqeyovsjmdhb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const tables = [
  "profiles",
  "board_posts",
  "feed_posts",
  "saved_posts",
  "contact_messages",
];

async function backupTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    console.log(`❌ ${table}:`, res.status, await res.text());
    return;
  }

  const data = await res.json();
  await require("fs").promises.writeFile(
    `${table}.json`,
    JSON.stringify(data, null, 2)
  );

  console.log(`✅ ${table}: ${data.length} rows`);
}

async function main() {
  for (const table of tables) {
    await backupTable(table);
  }
}

main();