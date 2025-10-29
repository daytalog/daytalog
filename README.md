# Daytalog Open Core

Open-core repository of the **Daytalog** desktop app (Electron + Vite + React).

> ⚠️ **Not for general use.**  
> Download the official app from [daytalog.com](https://daytalog.com).  
> This repository is for development only — some features are disabled or missing.

---

## Requirements

- macOS 12 or later, keep up to date to maintain Electron compatibility.
  > Prebuilt binaries are **not included** in this open-core repo.

---

## Quick Start

```bash
npm install
npm run dev
```

This launches the Electron app along with Vite dev servers for the main, preload, and renderer processes.

---

## Project Structure

| Directory       | Description                                  |
| --------------- | -------------------------------------------- |
| `src/main/`     | Electron main process                        |
| `src/preload/`  | Preload scripts                              |
| `src/renderer/` | Frontend                                     |
| `src/shared/`   | Shared types and utilities between processes |
| `resources/`    | App assets (icons, templates)                |

---

## Binaries

### FFprobe

`ffprobe` is required for extracting audio metadata and proxies.  
It is **not included** in this repository — the app runs without it, but related features will silently fail.  
To enable these features, place a valid `ffprobe` binary in the `resources/` folder.

---

## Adapters and Stubs

This project uses **npm** for simpler build compatibility.  
Adapters are used for non-core packages, and missing features are stubbed where necessary.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit with clear messages. Mark commits with `[fix]`, `[feat]`,`[chore]`, or similar.
4. Open a pull request targeting the contrib branch.

**Guidelines:**

- For significant features or architectural changes, please open an issue or discussion first to align on design and scope before starting development. You can also [contact me](https://daytalog.com/contact) directly if you prefer.
- Do **not** include binaries in PRs - if your feature requires compiled components, include the source code and add a build script instead.
- Keep changes focused.

---

## License

MIT License
