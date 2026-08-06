const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function uploadFile(bucket, relativePath, fullPath) {
  const fileBuffer = fs.readFileSync(fullPath);

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${relativePath}`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "image/webp",
        "x-upsert": "true",
      },
      body: fileBuffer,
    }
  );

  if (!res.ok) {
    console.log(`❌ ${relativePath}`, await res.text());
    return;
  }

  console.log(`✅ ${relativePath}`);
}

async function walk(bucket, currentDir, baseDir) {
  const items = fs.readdirSync(currentDir);

  for (const item of items) {
    const fullPath = path.join(currentDir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await walk(bucket, fullPath, baseDir);
    } else {
      const relativePath = path
        .relative(baseDir, fullPath)
        .replace(/\\/g, "/");

      await uploadFile(bucket, relativePath, fullPath);
    }
  }
}

async function main() {
  const root = path.join(__dirname, "storage-backup");

  for (const bucket of ["board-images", "feed-images"]) {
    const bucketDir = path.join(root, bucket);

    if (fs.existsSync(bucketDir)) {
      console.log(`\n📦 Restoring ${bucket}`);
      await walk(bucket, bucketDir, bucketDir);
    }
  }
}

main();


