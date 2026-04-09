import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54] flex items-center justify-center px-6">
      <Suspense fallback={<p>Verifying...</p>}>
        <VerifyEmailClient />
      </Suspense>
    </main>
  );
}