import type { Vulnerability } from "./api";
import { SEVERITY_ORDER, extractStatusCode } from "./vulnerability-config";

export interface VulnerabilityGroup {
  id: string;
  baseTitle: string;
  severity: Vulnerability["severity"];
  statusCode: number | null;
  source: string | null;
  items: Vulnerability[];
}

const TITLE_PATTERNS: RegExp[] = [
  /^(.*?): \/.*$/,
  /^(CVE potencialmente aplicável): .*$/,
  /^(TLS): .*$/,
  /^(Credenciais expostas em) .*$/,
  /^(Header X-Powered-By expõe tecnologia): .*$/,
  /^(Header Server expõe informação): .*$/,
  /^(Servidor com versão desatualizada \(EOL\)): .*$/,
  /^(Biblioteca detectada sem versão identificada): .*$/,
];

export function titleBase(title: string): string {
  const trimmed = title.trim();
  for (const pattern of TITLE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return match[1].trim();
  }
  const methodMatch = trimmed.match(
    /^(Método HTTP) [A-Z]+ (habilitado desnecessariamente)$/,
  );
  if (methodMatch) return `${methodMatch[1]} ${methodMatch[2]}`;
  return trimmed;
}

function severityRank(severity: Vulnerability["severity"]): number {
  return SEVERITY_ORDER.indexOf(severity);
}

export function groupVulnerabilities(
  vulnerabilities: Vulnerability[],
): VulnerabilityGroup[] {
  const groups = new Map<string, VulnerabilityGroup>();

  for (const vuln of vulnerabilities) {
    const baseTitle = titleBase(vuln.title);
    const statusCode = extractStatusCode(vuln.evidence);
    const key = `${baseTitle}||${vuln.severity}||${statusCode ?? ""}||${vuln.source ?? ""}`;

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(vuln);
    } else {
      groups.set(key, {
        id: key,
        baseTitle,
        severity: vuln.severity,
        statusCode,
        source: vuln.source ?? null,
        items: [vuln],
      });
    }
  }

  return [...groups.values()].sort((a, b) => {
    const rankDiff = severityRank(a.severity) - severityRank(b.severity);
    if (rankDiff !== 0) return rankDiff;
    return b.items.length - a.items.length;
  });
}