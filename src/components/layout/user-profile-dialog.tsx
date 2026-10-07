"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { User, Mail, Lock, Loader2, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError, isConnectionError } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (isConnectionError(err)) return fallback;
  if (err instanceof ApiError) return err.message || fallback;
  return err instanceof Error && err.message ? err.message : fallback;
}

export function UserProfileDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "delete">("view");
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profilePassword, setProfilePassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const name = nameDraft ?? user?.name ?? "";
  const email = emailDraft ?? user?.email ?? "";
  const dirty = name.trim() !== (user?.name ?? "") || email.trim() !== (user?.email ?? "");

  const reset = () => {
    setMode("view");
    setNameDraft(null);
    setEmailDraft(null);
    setProfilePassword("");
    setProfileError(null);
    setDeletePassword("");
    setDeleteError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            {t("profile.title")}
          </DialogTitle>
          <DialogDescription>{t("profile.dialogDescription")}</DialogDescription>
        </DialogHeader>

        {mode === "view" ? (
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-name" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                {t("profile.name")}
              </Label>
              <input
                id="dialog-name"
                type="text"
                value={name}
                onChange={(e) => setNameDraft(e.target.value)}
                className={inputClass}
                minLength={2}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dialog-email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {t("profile.email")}
              </Label>
              <input
                id="dialog-email"
                type="email"
                value={email}
                onChange={(e) => setEmailDraft(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dialog-profile-password" className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                {t("profile.currentPassword")}
              </Label>
              <input
                id="dialog-profile-password"
                type="password"
                value={profilePassword}
                onChange={(e) => {
                  setProfilePassword(e.target.value);
                  setProfileError(null);
                }}
                className={inputClass}
                autoComplete="current-password"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.passwordHint")}
              </p>
              {profileError && (
                <p className="text-xs text-red-500">{profileError}</p>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => setMode("delete")}
              >
                <Trash2 className="h-4 w-4" />
                {t("profile.deleteButton")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="gap-2"
                disabled={
                  saving ||
                  !dirty ||
                  !name.trim() ||
                  !email.trim() ||
                  !profilePassword
                }
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t("profile.saveChanges")}
              </Button>
            </DialogFooter>
            <Link
              href={`/${locale}/profile`}
              onClick={() => handleOpenChange(false)}
              className="block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("profile.passwordTitle")}
            </Link>
          </form>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4 py-2">
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {t("profile.deleteTitle")}
              </p>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                {t("profile.deleteDescription")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dialog-delete-password">
                {t("profile.deletePasswordPlaceholder")}
              </Label>
              <input
                id="dialog-delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={inputClass}
                placeholder={t("profile.deletePasswordPlaceholder")}
                required
                autoFocus
              />
              {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  reset();
                }}
                disabled={deleting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={deleting || !deletePassword}
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("profile.deleteConfirm")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
