const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://nuxdoykhaqeyovsjmdhb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const buckets = ["board-images", "feed-images"];

async function listFiles(bucket, prefix = "") {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prefix,
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    }),
  });

  if (!res.ok) {
    console.log(`❌ list failed ${bucket}/${prefix}:`, await res.text());
    return [];
  }

  return await res.json();
}

async function downloadFile(bucket, filePath) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.log(`❌ Failed file: ${bucket}/${filePath}`, res.status);
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const savePath = path.join("storage-backup", bucket, filePath);

  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, buffer);

  console.log(`✅ ${bucket}/${filePath}`);
}

async function walk(bucket, prefix = "") {
  const items = await listFiles(bucket, prefix);

  for (const item of items) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.metadata === null) {
      await walk(bucket, fullPath);
    } else {
      await downloadFile(bucket, fullPath);
    }
  }
}

async function main() {
  for (const bucket of buckets) {
    console.log(`\n📦 Backing up bucket: ${bucket}`);
    await walk(bucket);
  }
}

main();