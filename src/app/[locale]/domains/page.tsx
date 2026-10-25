"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Loader2,
  FileText,
  Server,
  Info,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  api,
  ApiError,
  DomainResponse,
  DomainVerificationMethod,
  DomainVerificationStatus,
  isConnectionError,
} from "@/lib/api";

function extractHostname(input: string): string {
  const trimmed = input.trim();
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `http://${trimmed.replace(/^\/\//, "")}`;
    const url = new URL(withScheme);
    return url.hostname;
  } catch {
    return trimmed;
  }
}

export default function DomainsPage() {
  const t = useTranslations();
  const [domains, setDomains] = useState<DomainResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [hostnameInput, setHostnameInput] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [addingDomain, setAddingDomain] = useState(false);

  // Verify dialog states
  const [verifyTarget, setVerifyTarget] = useState<DomainResponse | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<DomainVerificationMethod>("dns");
  const [verifying, setVerifying] = useState(false);

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState<DomainResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Copy feedback tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const data = await api.getDomains();
      setDomains(data);
    } catch (err) {
      if (isConnectionError(err)) {
        toast.error(t("scans.serverBusy"));
      } else {
        toast.error(t("domains.errors.notFound"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDomains();
        setDomains(data);
      } catch (err) {
        if (isConnectionError(err)) {
          toast.error(t("scans.serverBusy"));
        } else {
          toast.error(t("domains.errors.notFound"));
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [t]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(t("domains.copied"));
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHost = extractHostname(hostnameInput);
    if (!cleanHost) return;

    if (!disclaimerChecked) {
      toast.error(t("domains.disclaimer"));
      return;
    }

    setAddingDomain(true);
    try {
      await api.createDomain(cleanHost);
      toast.success(t("domains.errors.addSuccess"));
      setHostnameInput("");
      setDisclaimerChecked(false);
      await fetchDomains();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          toast.error(t("domains.errors.limitReached"));
        } else if (err.status === 400) {
          toast.error(err.message || t("domains.errors.invalidHost"));
        } else if (isConnectionError(err)) {
          toast.error(t("scans.serverBusy"));
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error(t("domains.errors.invalidHost"));
      }
    } finally {
      setAddingDomain(false);
    }
  };

  const handleOpenVerify = (domain: DomainResponse) => {
    setVerifyTarget(domain);
    // Se não tiver DNS disponível (ex: sufixo privado), seleciona file automaticamente
    if (!domain.instructions.dns) {
      setVerifyMethod("file");
    } else {
      setVerifyMethod("dns");
    }
  };

  const handleConfirmVerify = async () => {
    if (!verifyTarget) return;

    setVerifying(true);
    try {
      const updated = await api.verifyDomain(verifyTarget.id, verifyMethod);
      if (updated.status === "verified") {
        toast.success(t("domains.errors.verifySuccess"));
      } else {
        toast.error(updated.lastError || t("domains.errors.verifyFailed"));
      }
      setVerifyTarget(null);
      await fetchDomains();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          toast.error(t("domains.errors.rateLimited"));
        } else if (err.status === 400) {
          toast.error(err.message || t("domains.errors.verifyFailed"));
        } else if (isConnectionError(err)) {
          toast.error(t("scans.serverBusy"));
        } else {
          toast.error(err.message || t("domains.errors.verifyFailed"));
        }
      } else {
        toast.error(t("domains.errors.verifyFailed"));
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.deleteDomain(deleteTarget.id);
      toast.success(t("domains.errors.removeSuccess"));
      setDeleteTarget(null);
      await fetchDomains();
    } catch (err) {
      if (isConnectionError(err)) {
        toast.error(t("scans.serverBusy"));
      } else {
        toast.error(t("domains.errors.notFound"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const renderStatusBadge = (status: DomainVerificationStatus) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="success" className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("domains.statusVerified")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {t("domains.statusPending")}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="danger" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {t("domains.statusFailed")}
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="critical" className="gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            {t("domains.statusExpired")}
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                {t("domains.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:text-base">
                {t("domains.description")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchDomains()}
              disabled={loading}
              className="gap-2 self-start"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("dashboard.refresh")}
            </Button>
          </div>

          {/* Add Domain Form Card */}
          <Reveal className="mt-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
                <Plus className="h-5 w-5 text-primary" />
                {t("domains.addDomain")}
              </h2>

              <form onSubmit={handleAddDomain} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("domains.hostname")}
                    </label>
                    <input
                      type="text"
                      value={hostnameInput}
                      onChange={(e) => setHostnameInput(e.target.value)}
                      placeholder={t("domains.hostnamePlaceholder")}
                      disabled={addingDomain}
                      required
                      className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={addingDomain || !hostnameInput.trim() || !disclaimerChecked}
                      className="w-full gap-2"
                    >
                      {addingDomain ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("domains.adding")}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          {t("domains.addButton")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Termo de responsabilidade (Checkbox) */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="disclaimer-checkbox"
                    checked={disclaimerChecked}
                    onChange={(e) => setDisclaimerChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="disclaimer-checkbox"
                    className="cursor-pointer text-xs text-muted-foreground select-none"
                  >
                    {t("domains.disclaimer")}
                  </label>
                </div>
              </form>
            </div>
          </Reveal>

          {/* Educational Notices Card */}
          <Reveal className="mt-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("domains.notices.title")}
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{t("domains.notices.dnsPropagation")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{t("domains.notices.publicSuffix")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{t("domains.notices.coverage")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>{t("domains.notices.expiration")}</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Domains List */}
          <div className="mt-8 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm">{t("common.loading")}</p>
              </div>
            ) : domains.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 font-serif text-lg font-medium">
                  {t("domains.emptyTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("domains.emptyDescription")}
                </p>
              </div>
            ) : (
              domains.map((dom) => (
                <div
                  key={dom.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-mono text-lg font-bold text-foreground">
                          {dom.hostname}
                        </span>
                        {renderStatusBadge(dom.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {dom.verifiedAt && (
                          <span>
                            {t("domains.verifiedAt")}:{" "}
                            {new Date(dom.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                        {dom.expiresAt && (
                          <span>
                            {t("domains.expiresAt")}:{" "}
                            {new Date(dom.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        {dom.lastCheckedAt && (
                          <span>
                            {t("domains.lastCheckedAt")}:{" "}
                            {new Date(dom.lastCheckedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenVerify(dom)}
                        className="gap-1.5"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {t("domains.verifyButton")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(dom)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Error feedback if any */}
                  {dom.lastError && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{t("domains.lastError")} </span>
                        <span>{dom.lastError}</span>
                      </div>
                    </div>
                  )}

                  {/* Instructions Tabs */}
                  <div className="mt-6 border-t border-border pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("domains.instructions")}
                    </h4>

                    <Tabs
                      defaultValue={dom.instructions.dns ? "dns" : "file"}
                      className="mt-3"
                    >
                      <TabsList className="grid w-full grid-cols-2 max-w-xs">
                        <TabsTrigger
                          value="dns"
                          disabled={!dom.instructions.dns}
                          className="gap-2"
                        >
                          <Server className="h-3.5 w-3.5" />
                          DNS (TXT)
                        </TabsTrigger>
                        <TabsTrigger value="file" className="gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Arquivo (.well-known)
                        </TabsTrigger>
                      </TabsList>

                      {/* DNS Instructions */}
                      {dom.instructions.dns && (
                        <TabsContent value="dns" className="space-y-3 pt-3">
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {t("domains.dnsHostLabel")}
                            </span>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                                {dom.instructions.dns.name}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCopy(
                                    dom.instructions.dns!.name,
                                    `${dom.id}-dns-name`
                                  )
                                }
                                className="h-7 px-2.5 gap-1 text-xs"
                              >
                                {copiedKey === `${dom.id}-dns-name` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedKey === `${dom.id}-dns-name`
                                  ? t("domains.copied")
                                  : t("domains.copy")}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {t("domains.dnsValueLabel")}
                            </span>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 truncate rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                                {dom.instructions.dns.value}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCopy(
                                    dom.instructions.dns!.value,
                                    `${dom.id}-dns-val`
                                  )
                                }
                                className="h-7 px-2.5 gap-1 text-xs"
                              >
                                {copiedKey === `${dom.id}-dns-val` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                                {copiedKey === `${dom.id}-dns-val`
                                  ? t("domains.copied")
                                  : t("domains.copy")}
                              </Button>
                            </div>
                          </div>

                          {dom.instructions.dns.apexName && (
                            <p className="text-xs text-muted-foreground">
                              💡{" "}
                              {t("domains.apexNote", {
                                apex: dom.instructions.dns.apexName,
                              })}
                            </p>
                          )}
                        </TabsContent>
                      )}

                      {/* File Instructions */}
                      <TabsContent value="file" className="space-y-3 pt-3">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {t("domains.filePathLabel")}
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                              {dom.instructions.file.path}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopy(
                                  dom.instructions.file.path,
                                  `${dom.id}-file-path`
                                )
                              }
                              className="h-7 px-2.5 gap-1 text-xs"
                            >
                              {copiedKey === `${dom.id}-file-path` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              {copiedKey === `${dom.id}-file-path`
                                ? t("domains.copied")
                                : t("domains.copy")}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {t("domains.fileContentLabel")}
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 truncate rounded border border-border bg-muted px-2.5 py-1 font-mono text-xs text-foreground">
                              {dom.instructions.file.content}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopy(
                                  dom.instructions.file.content,
                                  `${dom.id}-file-content`
                                )
                              }
                              className="h-7 px-2.5 gap-1 text-xs"
                            >
                              {copiedKey === `${dom.id}-file-content` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              {copiedKey === `${dom.id}-file-content`
                                ? t("domains.copied")
                                : t("domains.copy")}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Verify Dialog */}
      <Dialog
        open={!!verifyTarget}
        onOpenChange={(open) => {
          if (!open && !verifying) setVerifyTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("domains.verifyMethodTitle")}</DialogTitle>
            <DialogDescription>
              {t("domains.verifyMethodDescription")}
            </DialogDescription>
          </DialogHeader>

          {verifyTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm font-semibold">
                {verifyTarget.hostname}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Método de verificação:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!verifyTarget.instructions.dns}
                    onClick={() => setVerifyMethod("dns")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all ${
                      verifyMethod === "dns"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    } ${!verifyTarget.instructions.dns ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <Server className="h-5 w-5" />
                    DNS (TXT)
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyMethod("file")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all ${
                      verifyMethod === "file"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    Arquivo (.well-known)
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setVerifyTarget(null)}
              disabled={verifying}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmVerify} disabled={verifying}>
              {verifying && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {t("domains.confirmVerify")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("domains.removeTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTarget &&
                t("domains.removeDescription", {
                  hostname: deleteTarget.hostname,
                })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {t("domains.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
