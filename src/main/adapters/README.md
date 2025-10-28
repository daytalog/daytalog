# Adapter Layer for Features not included.

This directory contains adapters that provide a unified API for int features that are not present in the open core repo.

## How It Works

1. **Build-time resolution**: `electron.vite.config.ts` checks if the `src/main/int` directory exists
2. **Single alias**: Vite configures a single `@int` alias that points to either:
   - `src/main/int/index.ts` - Real implementations (when directory exists)
   - `src/main/adapters/stubs.ts` - Stub implementations (when directory missing)
3. **Tree-shaking**: The bundler eliminates dead code paths, ensuring zero runtime overhead

## Stub Behavior

When int directory is missing:

- Stub functions log a warning.
- Stub functions return safe defaults (null, false, empty arrays, etc.)
- No errors are thrown; functionality gracefully degrades
