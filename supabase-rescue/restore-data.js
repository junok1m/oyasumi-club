const fs = require("fs");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const OLD_URL = "https://nuxdoykhaqeyovsjmdhb.supabase.co";
const NEW_URL = SUPABASE_URL;

const tables = ["saved_posts"];

async function insertTable(table) {
  let rows = JSON.parse(fs.readFileSync(`${table}.json`, "utf8"));

  rows = rows.map((row) => {
    const fixed = { ...row };

    for (const key of ["thumbnail_url", "thumbnail_small_url", "image_url"]) {
      if (typeof fixed[key] === "string") {
        fixed[key] = fixed[key].replaceAll(OLD_URL, NEW_URL);
      }
    }

    return fixed;
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    console.log(`❌ ${table}:`, res.status, await res.text());
    return;
  }

  console.log(`✅ ${table}: ${rows.length} rows`);
}

async function main() {
  for (const table of tables) {
    await insertTable(table);
  }
}

main();