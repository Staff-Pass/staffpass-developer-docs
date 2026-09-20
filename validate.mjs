import { readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const failures = [];

function collectPages(value, pages = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectPages(item, pages);
    return pages;
  }
  if (!value || typeof value !== 'object') return pages;
  for (const [key, item] of Object.entries(value)) {
    if (key === 'pages' && Array.isArray(item)) {
      for (const page of item) {
        if (typeof page === 'string') pages.push(page);
        else collectPages(page, pages);
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

const openapiPath = join(root, 'api-reference/openapi.json');
const openapi = JSON.parse(await readFile(openapiPath, 'utf8'));
if (openapi.openapi !== '3.1.0') {
  failures.push('openapi.json: se esperaba OpenAPI 3.1.0');
}
if (!openapi.paths || Object.keys(openapi.paths).length !== 0) {
  failures.push('openapi.json: no se permiten operaciones hasta implementar los gates Enterprise');
}
if (Array.isArray(openapi.servers) && openapi.servers.length > 0) {
  failures.push('openapi.json: no se permite un servidor mientras la API no esté disponible');
}

const corpus = await Promise.all(
  pages.map((page) => readFile(join(root, `${page}.mdx`), 'utf8')),
);
const requiredStatements = [
  'Enterprise',
  'api_enabled',
  'token de integración',
  'Firebase',
  'No disponible',
];
const text = corpus.join('\n');
for (const statement of requiredStatements) {
  if (!text.includes(statement)) {
    failures.push(`contenido: falta la declaración obligatoria ${statement}`);
  }
}

const forbiddenInternalRoutes = [
  '/attendance-integrations',
  '/payroll/sipe',
  '/payroll/dgi',
  '/payroll/bank',
  '/internal/notifications',
];
for (const route of forbiddenInternalRoutes) {
  if (JSON.stringify(openapi.paths).includes(route)) {
    failures.push(`openapi.json: ruta interna expuesta ${route}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Portal válido: ${pages.length} páginas y 0 operaciones públicas.`);
}
