# Security

**Aplicación sugerida:** Agent Requested. La regla sobre secretos es candidata a Always/global si la herramienta permite ese alcance.

- No añadas secretos a ejemplos ni a archivos versionados; documenta solo nombres de variables y valores inocuos. **Evidencia:** `.gitignore` ignora `.env` y `.env.*`, con una excepción explícita para `.env.example`.
- Permite solo orígenes CORS explícitos y habilita credenciales únicamente si el flujo las necesita. **Evidencia:** `backend/app/main.py` lee `CORS_ALLOW_ORIGINS`, cuyo valor predeterminado es vacío, y desactiva credenciales.
- Mantén la depuración remota desactivada por defecto; cuando se solicite en desarrollo, enlaza el puerto solo a loopback. **Evidencia:** el comando normal en `backend/Dockerfile` no inicia debugpy; `docker-compose.debug.yml` es opt-in y enlaza `5678` a `127.0.0.1`.