# ZigLab

A friendly lab for learning Zig in the browser: [ziglab.org](https://ziglab.org).

This is an independent community project. Zig is developed at [ziglang.org](https://ziglang.org/).

## Product spec

Implementation follows [docs/full-requirement.md](docs/full-requirement.md), one phase at a time ([docs/phases/](docs/phases/README.md)).

## Stack (phase 01)

- Next.js 16.3.5, React 19.3.0, TypeScript
- Tailwind CSS 4, shadcn/ui CLI v4
- pnpm

## Develop

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm lint
pnpm typecheck
```

No environment variables are required. Site URLs live in `src/config/site.ts`.

## License

The application is MIT. Lesson prose will be CC BY-SA 4.0 when those files land.
