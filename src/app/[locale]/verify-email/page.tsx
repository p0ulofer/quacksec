"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useResendCountdown } from "@/lib/use-resend-countdown";
import { api, ApiError, isConnectionError } from "@/lib/api";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromQuery = searchParams.get("email") ?? "";
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { secondsLeft, start } = useResendCountdown();
  const defaultEmail = emailFromQuery || user?.pendingEmail || user?.email || "";

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    token ? null : t("emailVerification.missingToken")
  );
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    const confirm = async () => {
      try {
        const result = await api.verifyEmail(token);
        setVerifiedEmail(result.email);
        setStatus("success");
        await refreshUser();
        toast.success(t("emailVerification.verifiedToast"));
      } catch (err) {
        setStatus("error");
        if (err instanceof ApiError && err.status === 429) {
          setErrorMessage(t("emailVerification.verifyRateLimited"));
        } else if (isConnectionError(err)) {
          setErrorMessage(t("emailVerification.connectionError"));
        } else if (err instanceof ApiError && err.status === 400) {
          setErrorMessage(t("emailVerification.invalidToken"));
        } else {
          setErrorMessage(t("emailVerification.verifyError"));
        }
      }
    };

    void confirm();
  }, [token, refreshUser, t]);

  const emailValue = email || defaultEmail;

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    setVerifyingCode(true);

    try {
      const result = await api.verifyEmailCode(emailValue.trim(), code);
      setVerifiedEmail(result.email);
      setStatus("success");
      await refreshUser();
      toast.success(t("emailVerification.verifiedToast"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCodeError(t("emailVerification.rateLimited"));
      } else if (isConnectionError(err)) {
        setCodeError(t("emailVerification.connectionError"));
      } else if (err instanceof ApiError && err.status === 400) {
        setCodeError(t("emailVerification.invalidCode"));
      } else {
        setCodeError(t("emailVerification.verifyError"));
      }
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const result = await api.resendVerification(
        isAuthenticated ? undefined : emailValue.trim()
      );
      start(result.retryAfterSeconds ?? 60);
      toast.success(t("emailVerification.resent"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        start(err.retryAfterSeconds ?? 60);
        toast.error(t("emailVerification.rateLimited"));
      } else if (isConnectionError(err)) {
        toast.error(t("emailVerification.connectionError"));
      } else {
        toast.error(t("emailVerification.resendError"));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
            <ShieldCheck className="h-8 w-8 text-primary" strokeWidth={1.8} />
            <span className="font-serif text-2xl tracking-tight">QuackSec</span>
          </Link>
        </div>

        {status === "verifying" && (
          <div className="flex flex-col items-center py-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-semibold">
              {t("emailVerification.verifyingTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("emailVerification.verifyingDescription")}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">
              {t("emailVerification.successTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("emailVerification.successDescription", {
                email: verifiedEmail ?? "",
              })}
            </p>
            <div className="mt-6 flex w-full flex-col gap-2">
              <Button asChild className="w-full gap-2">
                <Link href={`/${locale}/dashboard`}>
                  <MailCheck className="h-4 w-4" />
                  {t("emailVerification.goToDashboard")}
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/${locale}/login`}>
                    {t("emailVerification.goToLogin")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-2">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="mt-4 text-xl font-semibold">
                {t("emailVerification.errorTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </div>

            <form onSubmit={handleVerifyCode} className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium">
                  {t("emailVerification.codeTitle")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("emailVerification.codeDescription")}
                </p>
              </div>
              <div>
                <label
                  htmlFor="verify-email-address"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {t("emailVerification.emailLabel")}
                </label>
                <input
                  id="verify-email-address"
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailVerification.emailPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="verify-email-code"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {t("emailVerification.codeLabel")}
                </label>
                <input
                  id="verify-email-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder={t("emailVerification.codePlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] placeholder:tracking-[0.4em] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              {codeError && <p className="text-sm text-red-500">{codeError}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  verifyingCode || code.length !== 6 || !emailValue.trim()
                }
              >
                {verifyingCode && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("emailVerification.verifyCodeButton")}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-4">
              <p className="text-center text-xs text-muted-foreground">
                {t("emailVerification.resendHint")}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleResend}
                disabled={sending || secondsLeft > 0 || !emailValue.trim()}
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                {secondsLeft > 0
                  ? t("emailVerification.resendIn", { seconds: secondsLeft })
                  : t("emailVerification.resend")}
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-center text-sm text-muted-foreground">
              <Link href={`/${locale}/login`} className="text-primary hover:underline">
                {t("emailVerification.goToLogin")}
              </Link>
              <Link href={`/${locale}/register`} className="hover:underline">
                {t("emailVerification.goToRegister")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
