# Documentation

**Aplicación sugerida:** Auto Attached.

- Mantén las instrucciones de usuario alineadas en español e inglés. **Evidencia:** `readme.4geeks.md` y `README.md` mantienen las instrucciones generales en ambos idiomas, mientras `readme.afva.md` documenta esta implementación.
- Documenta si una fecha es fija o relativa al día actual, y mantén esa explicación sincronizada con la interfaz. **Evidencia:** `backend/app/routes.py` usa `date.today()` para construir el año de los movimientos y `frontend/src/App.tsx` presenta el periodo calculado a partir de ellos.
- Cuando cambie el flujo para ejecutar o instalar el proyecto, actualiza los README junto con Docker y los lockfiles. **Evidencia:** ambos README documentan `docker compose up --build`, y Compose construye las imágenes desde sus respectivos Dockerfiles.