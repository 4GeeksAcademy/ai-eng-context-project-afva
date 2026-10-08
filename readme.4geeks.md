# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

_English instructions are available in [README.md](./README.md). Para la guía específica de esta versión del proyecto, consulta [readme.afva.md](./readme.afva.md)._

**Antes de empezar**: [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
./.agents
├── rules/
│   └── <nombre-regla>.md
└── skills/
    └── <nombre-skill>/
        └── SKILL.md
```

## Cómo ejecutar en local

```bash
docker compose up --build
```

El frontend usa por defecto el proxy de Vite para `/api`, así que no necesitas variables de entorno extra ni en desarrollo local ni en Codespaces. Para apuntar a otro backend, configura `VITE_API_BASE_URL` según `frontend/.env.example`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs

Consulta [readme.afva.md](./readme.afva.md) para la arquitectura, los endpoints, las pruebas y las convenciones de contribución de esta versión.

---

Este y muchos otros proyectos son construidos por estudiantes de 4Geeks Academy. Encuentra más acerca de los [programas de 4Geeks](https://4geeksacademy.com/).