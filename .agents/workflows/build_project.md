# Build Project Workflow

This workflow details the commands required to install dependencies, typecheck, and compile the Next.js project on Windows or other platforms.

## Steps

### 1. Install Dependencies
Run the package installation. On Windows PowerShell, use `npm.cmd` to bypass execution policy restrictions:
```powershell
npm.cmd install
```
*(On macOS/Linux, run `npm install`)*

### 2. Typecheck Code
Run the TypeScript compiler static analysis check:
```powershell
npm.cmd run typecheck
```
*(On macOS/Linux, run `npm run typecheck`)*

### 3. Build Web Application
Compile the production-optimized Next.js bundle:
```powershell
npm.cmd run build
```
*(On macOS/Linux, run `npm run build`)*
