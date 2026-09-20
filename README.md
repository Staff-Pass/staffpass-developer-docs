# StaffPass Developer Documentation

[![Validate documentation](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml/badge.svg)](https://github.com/Staff-Pass/staffpass-developer-docs/actions/workflows/validate.yml) · [StaffPass](https://staffpass.app/) · [Apache-2.0](LICENSE)

Documentación pública para integradores que conectan sistemas externos con StaffPass. El sitio está publicado en [staff-pass.mintlify.site](https://staff-pass.mintlify.site) y su MCP público está disponible en [staff-pass.mintlify.site/mcp](https://staff-pass.mintlify.site/mcp).

## Estado

- API Enterprise v1 disponible en `https://api.staffpass.app`.
- Primer recurso público: empleados en modo de solo lectura.
- Autenticación mediante tokens de integración dedicados; las sesiones Firebase del panel no son credenciales de integración.
- Activación cerrada por defecto: plan Enterprise vigente, `api_enabled = true` y token válido con el scope `employees:read`.
- Conector oficial gratuito para Odoo 19 y Odoo 18.

No se publican credenciales de prueba compartidas. StaffPass activa una empresa concreta y entrega el secreto del token una sola vez.

## Validación

La rama `main` se valida con GitHub Actions mediante:

```sh
node validate.mjs
```

El contrato público está en `api-reference/openapi.json`. Las rutas administrativas, móviles, de dispositivos y de proveedores quedan fuera del OpenAPI externo.
