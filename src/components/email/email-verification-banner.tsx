"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, Loader2, MailWarning, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useResendCountdown } from "@/lib/use-resend-countdown";
import {
  api,
  ApiError,
  EMAIL_NOT_VERIFIED_EVENT,
  isConnectionError,
} from "@/lib/api";
import { Button } from "@/components/ui/button";

/**
 * Aviso persistente para contas cujo e-mail ainda não foi confirmado.
 * Além de reenviar o link, escuta o evento global emitido pela API quando
 * uma ação é bloqueada com EMAIL_NOT_VERIFIED (tratamento centralizado).
 */
export function EmailVerificationBanner({ className }: { className?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const { user, refreshUser } = useAuth();
  const { secondsLeft, start } = useResendCountdown();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const onBlocked = () => {
      toast.warning(t("emailVerification.blocked"));
    };
    window.addEventListener(EMAIL_NOT_VERIFIED_EVENT, onBlocked);
    return () => window.removeEventListener(EMAIL_NOT_VERIFIED_EVENT, onBlocked);
  }, [t]);

  if (!user || user.emailVerified) return null;

  const target = user.pendingEmail ?? user.email;

  const handleResend = async () => {
    setSending(true);
    try {
      const result = await api.resendVerification();
      start(result.retryAfterSeconds ?? 60);
      setResent(true);
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

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      role="status"
      className={`rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-100 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">{t("emailVerification.title")}</p>
            <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/90">
              {user.pendingEmail
                ? t("emailVerification.pendingEmailDescription", { email: target })
                : t("emailVerification.description", { email: target })}
            </p>
            <p className="mt-1 text-xs text-amber-800/70 dark:text-amber-200/70">
              {resent
                ? t("emailVerification.checkSpam", { email: target })
                : t("emailVerification.hint")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 border-amber-600/40 bg-transparent text-amber-900 hover:bg-amber-500/20 dark:text-amber-100"
            onClick={handleResend}
            disabled={sending || secondsLeft > 0}
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {secondsLeft > 0
              ? t("emailVerification.resendIn", { seconds: secondsLeft })
              : t("emailVerification.resend")}
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="gap-1.5 border-amber-600/40 bg-transparent text-amber-900 hover:bg-amber-500/20 dark:text-amber-100"
          >
            <Link
              href={`/${locale}/verify-email?email=${encodeURIComponent(target)}`}
            >
              {t("emailVerification.enterCode")}
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5 text-amber-900 hover:bg-amber-500/20 dark:text-amber-100"
            onClick={handleCheck}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {t("emailVerification.alreadyConfirmed")}
          </Button>
        </div>
      </div>
    </div>
  );
}
