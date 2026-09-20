import { readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const failures = [];
const generatedOperation = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \/\S+$/;

function collectPages(value, pages = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectPages(item, pages);
    return pages;
  }
  if (!value || typeof value !== 'object') return pages;
  for (const [key, item] of Object.entries(value)) {
    if (key === 'pages' && Array.isArray(item)) {
      for (const page of item) {
        if (typeof page === 'string' && !generatedOperation.test(page)) pages.push(page);
        else if (typeof page !== 'string') collectPages(page, pages);
      }
    } else {
      collectPages(item, pages);
    }
  }
  return pages;
}

const config = JSON.parse(await readFile(join(root, 'docs.json'), 'utf8'));
for (const field of ['theme', 'name', 'colors', 'navigation']) {
  if (!config[field]) failures.push(`docs.json: falta ${field}`);
}

const pages = collectPages(config.navigation);
if (new Set(pages).size !== pages.length) {
  failures.push('docs.json: hay páginas duplicadas en navegación');
}

for (const page of pages) {
  const path = join(root, `${page}.mdx`);
  try {
    await stat(path);
    const source = await readFile(path, 'utf8');
    if (!source.startsWith('---\n') || !/^title:\s*.+$/m.test(source)) {
      failures.push(`${relative(root, path)}: frontmatter inválido`);
    }
  } catch {
    failures.push(`${page}: archivo MDX ausente`);
  }
}

const openapi = JSON.parse(await readFile(join(root, 'api-reference/openapi.json'), 'utf8'));
if (openapi.openapi !== '3.1.0') failures.push('openapi.json: se esperaba OpenAPI 3.1.0');

const expectedRoutes = [
  '/integrations/v1/employees',
  '/integrations/v1/employees/{id}',
];
const actualRoutes = Object.keys(openapi.paths || {}).sort();
if (JSON.stringify(actualRoutes) !== JSON.stringify([...expectedRoutes].sort())) {
  failures.push('openapi.json: las rutas públicas no coinciden con el contrato Enterprise v1');
}
for (const route of expectedRoutes) {
  const operation = openapi.paths?.[route]?.get;
  if (!operation) failures.push(`openapi.json: falta GET ${route}`);
  if (!operation?.security?.some((item) => 'integrationBearer' in item)) {
    failures.push(`openapi.json: falta seguridad bearer en GET ${route}`);
  }
}
if (openapi.servers?.[0]?.url !== 'https://api.staffpass.app') {
  failures.push('openapi.json: base URL pública incorrecta');
}
const bearer = openapi.components?.securitySchemes?.integrationBearer;
if (bearer?.type !== 'http' || bearer?.scheme !== 'bearer') {
  failures.push('openapi.json: esquema bearer ausente');
}
if (openapi['x-staffpass-availability']?.publicOperations !== 2) {
  failures.push('openapi.json: conteo de operaciones públicas incorrecto');
}

const corpus = await Promise.all(pages.map((page) => readFile(join(root, `${page}.mdx`), 'utf8')));
const text = corpus.join('\n');
for (const statement of ['Enterprise', 'api_enabled', 'token de integración', 'Firebase', 'employees:read', 'api.staffpass.app']) {
  if (!text.includes(statement)) failures.push(`contenido: falta la declaración obligatoria ${statement}`);
}

for (const route of ['/attendance-integrations','/payroll/sipe','/payroll/dgi','/payroll/bank','/internal/notifications']) {
  if (JSON.stringify(openapi.paths).includes(route)) failures.push(`openapi.json: ruta interna expuesta ${route}`);
}

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Portal válido: ${pages.length} páginas y ${actualRoutes.length} operaciones públicas.`);
}
