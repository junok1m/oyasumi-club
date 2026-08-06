import { Suspense } from "react";
import WritePageClient from "./WritePageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WritePageClient />
    </Suspense>
  );
}