# Tests Automatizados

Este proyecto incluye una suite completa de tests automatizados.

## Estructura de Tests

```
tests/
├── setup.ts                 # Configuración global de tests
├── unit/                    # Tests unitarios
│   ├── lib/                # Tests de utilidades
│   └── components/         # Tests de componentes
├── e2e/                    # Tests end-to-end
│   ├── home.spec.ts
│   ├── appointments.spec.ts
│   └── admin.spec.ts
├── visual.spec.ts          # Tests visuales
├── a11y.spec.ts            # Tests de accesibilidad
└── security.test.ts        # Tests de seguridad
```

## Comandos Disponibles

### Tests Unitarios
```bash
npm test              # Ejecutar todos los tests
npm run test:unit    # Tests unitarios (Vitest)
npm run test:watch   # Modo watch
npm run test:ui      # Interfaz visual de Vitest
```

### Tests E2E
```bash
npm run test:e2e           # Tests E2E (Playwright)
npm run test:e2e:ui        # Modo UI interactivo
npm run test:install       # Instalar navegadores
```

### Tests Especializados
```bash
npm run test:performance   # Tests de performance (Lighthouse)
npm run test:visual       # Tests visuales (screenshots)
npm run test:seo          # Tests de SEO
npm run test:a11y         # Tests de accesibilidad (Pa11y)
npm run test:security     # Tests de seguridad (npm audit)
```

## Configuración

### Variables de Entorno para Tests

Crea un archivo `.env.test` con:
```env
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=test123
JWT_SECRET=test-secret
```

## Ejecutar Tests

1. **Instalar dependencias y navegadores:**
   ```bash
   npm install
   npm run test:install
   ```

2. **Ejecutar todos los tests:**
   ```bash
   npm test
   ```

3. **Ejecutar tests específicos:**
   ```bash
   npm run test:unit
   npm run test:e2e
   ```

## Cobertura

Para ver la cobertura de código:
```bash
npm run test -- --coverage
```

La cobertura se genera en `/coverage`

