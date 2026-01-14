"use client";

import AuthContainer from "@/components/auth/AuthContainer";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "OAuthCallback") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("Email used was not registered.");
      setTimeout(() => {
        setErrorMsg(null);
        router.replace("/auth");
      }, 2500);
    } else if (error === "AccessDenied") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("Sign-up first to continue.");
      setTimeout(() => {
        setErrorMsg(null);
        router.replace("/auth");
      }, 2500);
    }
  }, [searchParams, router]);

  return (
    <>
      {errorMsg && (
        <div className="auth-notification-popup">
          <span className="auth-notification-icon">&#9888;</span>
          <span>{errorMsg}</span>
        </div>
      )}
      <AuthContainer />
    </>
  );
}
