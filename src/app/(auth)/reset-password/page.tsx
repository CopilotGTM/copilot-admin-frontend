"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordCard } from "@/modules/auth/components";

export default function ResetPassword() {
  const searchParams = useSearchParams();

  const tokenHash = searchParams.get("token_hash") || "";
  const forceChange = searchParams.get("force_change") === "true";
  return <ResetPasswordCard tokenHash={tokenHash} forceChange={forceChange} />;
}
