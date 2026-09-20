# Portal de integraciones de StaffPass

[![Validate documentation](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml/badge.svg)](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml) · [StaffPass](https://staffpass.app/) · [Apache-2.0](LICENSE)

Repositorio público del portal Mintlify para documentar la futura API Enterprise
y el estado verificable de integraciones. El sitio web todavía no está desplegado
y no contiene endpoints externos operativos.

## Decisiones de seguridad

- La API se describe como no disponible porque el backend no contiene plan
  Enterprise, `api_enabled`, tokens de integración ni un guard para esos tokens.
- Las sesiones Firebase del panel no se documentan como credenciales externas.
- `api-reference/openapi.json` usa OpenAPI 3.1.0 con `paths: {}`.
- Las rutas administrativas existentes no se copian al portal.
- La visibilidad acordada para las guías es pública. La referencia ejecutable
  seguirá ausente hasta implementar los gates Enterprise.

## Evidencia auditada

La preparación se basó en:

- `src/auth/firebase-auth.strategy.ts`
- `src/auth/authenticated-user.ts`
- `src/config/http-exception.filter.ts`
- `src/config/rate-limit.ts`
- `src/attendance-integrations/`
- `src/payroll/integrations/`, `src/payroll/sipe/`, `src/payroll/dgi/` y
  `src/payroll/bank/`
- `prisma/schema.prisma`
- `docs/attendance-integrations/` y `docs/payroll-integrations/`

## Validación local

Desde la raíz de este repositorio:

```sh
node validate.mjs
```

La validación oficial se comprobó de forma efímera con `mint` 4.2.909 y Node
24.20.0: `mintlify validate` y `openapi-check` pasaron. No se recomienda instalar
esa CLI como dependencia persistente por ahora: el audit de su árbol temporal
reportó 15 vulnerabilidades altas, dos moderadas y dependencias deprecadas. La
CLI no se agregó a este repositorio ni a su lockfile. Revisar un preview tampoco
autoriza publicación, DNS ni conexión del repositorio con Mintlify.

## Mintlify Starter

Al 20 de septiembre de 2026, la página oficial de precios muestra Starter a
USD 0/mes, sin tarjeta, con cinco editores, dominio personalizado,
autenticación, Git sync y API playground. Las condiciones pueden cambiar y se
deben verificar de nuevo antes de activar el sitio.

La documentación privada automática puede evaluarse con la autenticación de
Mintlify incluida en Starter. Si sus condiciones cambian o no cubren el control
requerido, la alternativa sin costo de licencia es servir Scalar abierto dentro
del portal existente, una vez que exista un OpenAPI externo real.
