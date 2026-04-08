import VerifyEmailPanel from "@/components/auth/verify-email-panel";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPanel />
    </Suspense>
  );
}
