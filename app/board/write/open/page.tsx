import { Suspense } from "react";
import OpenWriteNotice from "@/components/OpenWriteNotice";
import WritePageClient from "../WritePageClient";

export default async function OpenWritePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const kind = params.category === "review" ? "review" : "qa";

  return (
    <main className="min-h-dvh bg-[#fff4f8] text-[#4f3a4f]">
      <div className="mx-auto w-[92%] max-w-3xl py-8">
        <OpenWriteNotice kind={kind} />
        <Suspense fallback={<p className="text-sm text-[#9b7892]">Loading...</p>}>
          <WritePageClient />
        </Suspense>
      </div>
    </main>
  );
}
