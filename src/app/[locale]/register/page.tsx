"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useResendCountdown } from "@/lib/use-resend-countdown";
import { api, ApiError, isConnectionError } from "@/lib/api";

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { secondsLeft, start } = useResendCountdown();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      setRegisteredEmail(email.trim().toLowerCase());
      start(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const result = await api.resendVerification();
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
              <ShieldCheck className="h-8 w-8 text-primary" strokeWidth={1.8} />
              <span className="font-serif text-2xl tracking-tight">QuackSec</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("register.title")}
            </p>
          </div>

          {registeredEmail ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <MailCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">
                {t("emailVerification.registeredTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("emailVerification.registeredDescription", {
                  email: registeredEmail,
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("emailVerification.checkSpam", { email: registeredEmail })}
              </p>

              <div className="mt-6 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleResend}
                  disabled={sending || secondsLeft > 0}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {secondsLeft > 0
                    ? t("emailVerification.resendIn", { seconds: secondsLeft })
                    : t("emailVerification.resend")}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={`/${locale}/verify-email?email=${encodeURIComponent(
                      registeredEmail
                    )}`}
                  >
                    {t("emailVerification.enterCode")}
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href={`/${locale}/dashboard`}>
                    {t("emailVerification.goToDashboard")}
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                {t("emailVerification.wrongAddress")}{" "}
                <Link
                  href={`/${locale}/profile`}
                  className="font-medium text-primary hover:underline"
                >
                  {t("emailVerification.updateEmail")}
                </Link>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    {t("register.name")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("register.namePlaceholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    {t("register.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("register.emailPlaceholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                    {t("register.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("register.passwordPlaceholder")}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    minLength={6}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("register.button")
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("register.hasAccount")}{" "}
                <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
                  {t("register.loginLink")}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
