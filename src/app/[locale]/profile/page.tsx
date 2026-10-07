"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError, isConnectionError } from "@/lib/api";
import {
  AlertTriangle,
  Loader2,
  Lock,
  Mail,
  Save,
  Trash2,
  User,
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (isConnectionError(err)) return fallback;
  if (err instanceof ApiError) return err.message || fallback;
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [profilePassword, setProfilePassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const name = nameDraft ?? user?.name ?? "";
  const email = emailDraft ?? user?.email ?? "";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, locale, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      await api.updateProfile({
        name: name.trim(),
        email: email.trim(),
        password: profilePassword,
      });
      setNameDraft(null);
      setEmailDraft(null);
      setProfilePassword("");
      await refreshUser();
      toast.success(t("profile.updateSuccess"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setProfileError(t("profile.invalidPassword"));
      } else if (err instanceof ApiError && err.status === 409) {
        toast.error(t("profile.emailTaken"));
      } else {
        toast.error(apiErrorMessage(err, t("profile.genericError")));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t("profile.passwordChanged"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error(t("profile.invalidPassword"));
      } else {
        toast.error(apiErrorMessage(err, t("profile.genericError")));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteAccount(deletePassword);
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "refresh_token=; path=/; max-age=0";
      toast.success(t("profile.deleteSuccess"));
      router.push(`/${locale}/login`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setDeleteError(t("profile.invalidPassword"));
      } else {
        setDeleteError(apiErrorMessage(err, t("profile.genericError")));
      }
      setDeleting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl tracking-tight">{t("profile.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("profile.description")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Reveal>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h2 className="text-xl">{t("profile.infoTitle")}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t("profile.infoDescription")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">{t("profile.name")}</Label>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className={inputClass}
                      minLength={2}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">{t("profile.email")}</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmailDraft(e.target.value)}
                        className={`${inputClass} pl-9`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-confirm-password">
                      {t("profile.currentPassword")}
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="profile-confirm-password"
                        type="password"
                        value={profilePassword}
                        onChange={(e) => {
                          setProfilePassword(e.target.value);
                          setProfileError(null);
                        }}
                        className={`${inputClass} pl-9`}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.passwordHint")}
                    </p>
                    {profileError && (
                      <p className="text-sm text-red-500">{profileError}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      className="gap-2"
                      disabled={
                        savingProfile ||
                        !name.trim() ||
                        !email.trim() ||
                        !profilePassword ||
                        (name.trim() === user?.name && email.trim() === user?.email)
                      }
                    >
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {t("profile.saveChanges")}
                    </Button>
                  </div>
                </form>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h2 className="text-xl">{t("profile.passwordTitle")}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t("profile.passwordDescription")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="current-password">
                      {t("profile.currentPassword")}
                    </Label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm-password">
                        {t("profile.confirmPassword")}
                      </Label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      className="gap-2"
                      disabled={
                        savingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword
                      }
                    >
                      {savingPassword && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t("profile.passwordTitle")}
                    </Button>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-6 dark:border-red-900 dark:bg-red-950/20">
              <h2 className="flex items-center gap-2 text-lg font-medium text-red-700 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                {t("profile.dangerTitle")}
              </h2>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
                {t("profile.dangerDescription")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2 border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400"
                onClick={() => {
                  setDeletePassword("");
                  setDeleteError(null);
                  setShowDeleteDialog(true);
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                {t("profile.deleteButton")}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open && !deleting) setShowDeleteDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("profile.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("profile.deleteDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t("profile.deletePasswordPlaceholder")}
              className={inputClass}
              required
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="gap-2"
                disabled={deleting || !deletePassword}
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("profile.deleteConfirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
