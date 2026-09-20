# StaffPass Developer Documentation

[![Validate documentation](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml/badge.svg)](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml) · [StaffPass](https://staffpass.app/) · [Apache-2.0](LICENSE)

Documentación pública para integradores que conectarán sistemas externos con la
futura API Enterprise de StaffPass. El sitio web todavía no está desplegado y
no contiene endpoints operativos.

## Decisiones de seguridad

- La API se describe como no disponible porque el backend no contiene plan
  Enterprise, `api_enabled`, tokens de integración ni un guard para esos tokens.
- Las sesiones Firebase del panel no se documentan como credenciales externas.
- `api-reference/openapi.json` usa OpenAPI 3.1.0 con `paths: {}`.
- Las rutas administrativas existentes no se copian al portal.
- La visibilidad acordada para las guías es pública. La referencia ejecutable
  seguirá ausente hasta implementar los gates Enterprise.

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
