export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type VulnerabilityStatus = "open" | "fixed" | "in-review" | "ignored";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  status: VulnerabilityStatus;
  application: string;
  endpoint: string;
  cwe: string;
  owasp: string;
  description: string;
  evidence: string;
  impact: string;
  remediation: string;
  safeExample: string;
  discoveredAt: string;
  hasLearnModule: boolean;
}

export const severityConfig: Record<
  Severity,
  { label: string; badge: "critical" | "danger" | "warning" | "success" | "secondary" }
> = {
  critical: { label: "Crítico", badge: "critical" },
  high: { label: "Alto", badge: "danger" },
  medium: { label: "Médio", badge: "warning" },
  low: { label: "Baixo", badge: "success" },
  info: { label: "Info", badge: "secondary" },
};

export const statusConfig: Record<
  VulnerabilityStatus,
  { label: string; badge: "critical" | "success" | "warning" | "secondary" }
> = {
  open: { label: "Em aberto", badge: "critical" },
  fixed: { label: "Corrigido", badge: "success" },
  "in-review": { label: "Em revisão", badge: "warning" },
  ignored: { label: "Ignorado", badge: "secondary" },
};

export const vulnerabilities: Vulnerability[] = [
  {
    id: "VULN-001",
    title: "Cookie de sessão sem flag HttpOnly",
    severity: "high",
    category: "Configuração de Segurança",
    status: "open",
    application: "E-commerce Platform",
    endpoint: "POST /api/auth/login",
    cwe: "CWE-1004",
    owasp: "A05:2021 — Security Misconfiguration",
    description:
      "O cookie de sessão enviado após autenticação não possui a flag HttpOnly, permitindo que scripts do lado do cliente acessem seu valor via document.cookie.",
    evidence:
      "Set-Cookie: session_id=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...; Path=/; Secure",
    impact:
      "Um atacante que conseguir injetar JavaScript na página (XSS) pode roubar o cookie de sessão e sequestrar a sessão do usuário, assumindo total controle da conta sem precisar de credenciais.",
    remediation:
      "Adicione a flag HttpOnly ao header Set-Cookie para impedir acesso via JavaScript. Idealmente combine com Secure e SameSite=Strict.",
    safeExample:
      "Set-Cookie: session_id=eyJhbGciOiJIUzI1NiJ9...; Path=/; HttpOnly; Secure; SameSite=Strict",
    discoveredAt: "2026-08-12",
    hasLearnModule: true,
  },
  {
    id: "VULN-002",
    title: "Injeção de SQL no endpoint de busca",
    severity: "critical",
    category: "Injeção",
    status: "open",
    application: "API Gateway",
    endpoint: "GET /api/products?q=",
    cwe: "CWE-89",
    owasp: "A03:2021 — Injection",
    description:
      "O parâmetro de busca 'q' é concatenado diretamente em uma query SQL sem sanitização, permitindo injeção de comandos maliciosos.",
    evidence:
      "GET /api/products?q=test' UNION SELECT username,password FROM users-- -",
    impact:
      "Um atacante pode extrair dados sensíveis do banco de dados, contornar autenticação, modificar ou apagar registros e, em casos extremos, obter acesso ao sistema operacional do servidor.",
    remediation:
      "Use queries parametrizadas (prepared statements) ou ORMs que façam binding automático de parâmetros. Nunca concatene strings em SQL.",
    safeExample:
      "SELECT * FROM products WHERE name ILIKE $1 -- usando parameterized query",
    discoveredAt: "2026-08-14",
    hasLearnModule: true,
  },
  {
    id: "VULN-003",
    title: "CORS permitindo origens arbitrárias",
    severity: "medium",
    category: "Configuração de Segurança",
    status: "in-review",
    application: "Payment Service",
    endpoint: "OPTIONS /api/payments",
    cwe: "CWE-942",
    owasp: "A05:2021 — Security Misconfiguration",
    description:
      "O header Access-Control-Allow-Origin está configurado com '*' em conjunto com credenciais, expondo a API a leitura de dados por sites de terceiros.",
    evidence:
      "Access-Control-Allow-Origin: * | Access-Control-Allow-Credentials: true",
    impact:
      "Qualquer site pode fazer requisições autenticadas à API em nome do usuário, permitindo exfiltração de dados sensíveis sem o consentimento do usuário.",
    remediation:
      "Configure uma lista de origens permitidas (allowlist) e nunca combine Access-Control-Allow-Origin: * com Access-Control-Allow-Credentials: true.",
    safeExample:
      "Access-Control-Allow-Origin: https://app.cyberlens.dev (apenas origens confiáveis)",
    discoveredAt: "2026-08-10",
    hasLearnModule: false,
  },
  {
    id: "VULN-004",
    title: "XSS refletido na página de erro",
    severity: "high",
    category: "Cross-Site Scripting (XSS)",
    status: "open",
    application: "Marketing Site",
    endpoint: "GET /error?msg=",
    cwe: "CWE-79",
    owasp: "A03:2021 — Injection",
    description:
      "O parâmetro 'msg' da página de erro é exibido sem escaping no HTML, permitindo injeção e execução de scripts no navegador da vítima.",
    evidence: "GET /error?msg=<script>alert(document.cookie)</script>",
    impact:
      "Um atacante pode induzir um usuário a clicar em um link malicioso que executa JavaScript no contexto da aplicação, roubando cookies, redirecionando a vítima ou adulterando conteúdo.",
    remediation:
      "Sempre faça escaping de HTML ao exibir conteúdo fornecido pelo usuário. Use frameworks que escapam por padrão (React, Angular) e evite dangerouslySetInnerHTML.",
    safeExample:
      ".textContent = userInput  // em vez de .innerHTML = userInput",
    discoveredAt: "2026-08-13",
    hasLearnModule: true,
  },
  {
    id: "VULN-005",
    title: "JWT com algoritmo 'none'",
    severity: "critical",
    category: "Autenticação",
    status: "open",
    application: "Auth Service",
    endpoint: "POST /api/auth/verify",
    cwe: "CWE-327",
    owasp: "A02:2021 — Cryptographic Failures",
    description:
      "O servidor de autenticação aceita tokens JWT com algoritmo 'none', permitindo que tokens sem assinatura sejam considerados válidos.",
    evidence:
      'Header: {"alg":"none","typ":"JWT"} | Payload: {"sub":"admin","role":"admin"}',
    impact:
      "Qualquer pessoa pode forjar um token JWT válido com qualquer conteúdo (inclusive privilégios de administrador) e acessar a aplicação sem qualquer credencial.",
    remediation:
      "Restrinja explicitamente os algoritmos aceitos (ex: HS256, RS256) e rejeite 'none'. Use bibliotecas atualizadas que impedem esse ataque por padrão.",
    safeExample:
      'jwt.verify(token, secret, { algorithms: ["HS256"] })',
    discoveredAt: "2026-08-15",
    hasLearnModule: true,
  },
  {
    id: "VULN-006",
    title: "Rate limiting ausente no endpoint de login",
    severity: "medium",
    category: "Controle de Acesso",
    status: "ignored",
    application: "E-commerce Platform",
    endpoint: "POST /api/auth/login",
    cwe: "CWE-307",
    owasp: "A07:2021 — Identification and Authentication Failures",
    description:
      "O endpoint de login não implementa limite de tentativas, permitindo ataques de força bruta e credential stuffing.",
    evidence:
      "POST /api/auth/login enviado 1000x em 10s sem bloqueio de IP ou captcha.",
    impact:
      "Atacantes podem testar milhares de combinações de usuário e senha, comprometendo contas com credenciais fracas ou vazadas em outras plataformas.",
    remediation:
      "Implemente rate limiting por IP e por conta (ex: 5 tentativas por minuto), combine com CAPTCHA após tentativas falhas e adicione delay exponencial.",
    safeExample:
      "rateLimit({ windowMs: 60_000, max: 5, keyGenerator: (req) => req.ip })",
    discoveredAt: "2026-08-08",
    hasLearnModule: false,
  },
  {
    id: "VULN-007",
    title: "Dependência com vulnerabilidade conhecida (log4j 2.14)",
    severity: "high",
    category: "Dependências",
    status: "fixed",
    application: "Backend Services",
    endpoint: "—",
    cwe: "CWE-1104",
    owasp: "A06:2021 — Vulnerable and Outdated Components",
    description:
      "A dependência log4j na versão 2.14.1 contém a vulnerabilidade CVE-2021-44228 (Log4Shell), permitindo RCE remoto.",
    evidence: "log4j-core-2.14.1.jar encontrado em /lib",
    impact:
      "Um atacante pode explorar Log4Shell para executar código remotamente no servidor, obtendo controle total do sistema e potencialmente da rede inteira.",
    remediation:
      "Atualize log4j para a versão 2.17.1 ou superior. Revise todas as dependências periodicamente com ferramentas como OWASP Dependency-Check.",
    safeExample: "implementation 'org.apache.logging.log4j:log4j-core:2.17.1'",
    discoveredAt: "2026-08-01",
    hasLearnModule: true,
  },
  {
    id: "VULN-008",
    title: "Senhas com hash MD5 sem salt",
    severity: "high",
    category: "Criptografia",
    status: "in-review",
    application: "Legacy Auth",
    endpoint: "—",
    cwe: "CWE-327",
    owasp: "A02:2021 — Cryptographic Failures",
    description:
      "As senhas dos usuários são armazenadas usando o algoritmo MD5, que é criptograficamente fraco e não utiliza salt único por usuário.",
    evidence: "SELECT password FROM users WHERE id=1 → '5f4dcc3b5aa765d61d8327deb882cf99'",
    impact:
      "Em caso de vazamento do banco de dados, as senhas podem ser facilmente recuperadas usando rainbow tables ou ataques de dicionário, mesmo sem acesso à aplicação.",
    remediation:
      "Use funções de derivação de chave projetadas para senhas como Argon2id, bcrypt ou scrypt. Cada senha deve ter um salt único.",
    safeExample:
      "argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536 })",
    discoveredAt: "2026-08-05",
    hasLearnModule: false,
  },
  {
    id: "VULN-009",
    title: "Diretório exposto sem autenticação",
    severity: "low",
    category: "Controle de Acesso",
    status: "fixed",
    application: "File Server",
    endpoint: "GET /uploads/",
    cwe: "CWE-538",
    owasp: "A01:2021 — Broken Access Control",
    description:
      "O diretório /uploads permite listagem de arquivos sem qualquer autenticação, expondo arquivos internos.",
    evidence: "GET /uploads/ → lista completa de arquivos disponíveis",
    impact:
      "Atacantes podem descobrir e baixar arquivos sensíveis (backups, documentos internos) que não deveriam ser públicos, facilitando ataques mais dirigidos.",
    remediation:
      "Desative a listagem de diretórios no servidor web. Restrinja acesso a arquivos internos com autenticação e autorização adequadas.",
    safeExample: "Nginx: autoindex off;",
    discoveredAt: "2026-08-03",
    hasLearnModule: false,
  },
  {
    id: "VULN-010",
    title: "Informações sensíveis em headers de resposta",
    severity: "info",
    category: "Informação Exposta",
    status: "open",
    application: "All Services",
    endpoint: "GET /",
    cwe: "CWE-209",
    owasp: "A05:2021 — Security Misconfiguration",
    description:
      "Os headers de resposta expõem a versão do servidor web e do framework, facilitando ataques direcionados a vulnerabilidades conhecidas.",
    evidence: "Server: nginx/1.18.0 | X-Powered-By: Express/4.17.1",
    impact:
      "Atacantes podem usar essas informações para identificar vulnerabilidades específicas da versão e direcionar explorações com precisão.",
    remediation:
      "Remova headers que expõem versões e tecnologias (Server, X-Powered-By). Configure o servidor para omitir essas informações.",
    safeExample: "app.disable('x-powered-by')",
    discoveredAt: "2026-08-14",
    hasLearnModule: false,
  },
];
