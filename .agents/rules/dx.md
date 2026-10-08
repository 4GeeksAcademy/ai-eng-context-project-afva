# Developer Experience

**Aplicación sugerida:** Agent Requested.

- Instala el frontend con `npm ci` y conserva `package-lock.json` versionado. **Evidencia:** `frontend/Dockerfile` usa `npm ci` y `frontend/package.json` declara las tareas de build, lint y test.
- Mantén las dependencias Python directas en `backend/requirements.in` y regenera el lock completo con hashes usando `pip-tools==7.6.2` bajo Python 3.13. **Evidencia:** `backend/Dockerfile` usa Python 3.13 y `pip install --require-hashes -r requirements.txt`.
- Usa Docker Compose como ruta de ejecución full-stack documentada y preserva el proxy de `/api` hacia `backend:8000`. **Evidencia:** `docker-compose.yml` declara `frontend` y `backend`; `frontend/vite.config.ts` define ese proxy.
- Habilita depuración remota solo bajo demanda, usando el override documentado. **Evidencia:** `docker-compose.debug.yml` activa debugpy sin exponer el puerto en el Compose predeterminado.
- No subas secretos ni archivos `.env`; actualiza `.env.example` cuando agregues variables necesarias. **Evidencia:** `.gitignore` excluye `.env*` pero permite `.env.example`, que se documenta en `readme.4geeks.md`.