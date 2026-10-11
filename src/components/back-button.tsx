"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4">
      <ArrowLeft />
      Back
    </Button>
  );
}