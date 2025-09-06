# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `ng serve` - Start development server (http://localhost:4200)
- `npm run build` or `ng build` - Build the application for production
- `npm run watch` or `ng build --watch --configuration development` - Build in watch mode for development
- `npm test` or `ng test` - Run unit tests with Karma
- `npm run serve:ssr:confluence-clone` - Serve the SSR build

## Project Architecture

This is an Angular 19 application with Server-Side Rendering (SSR) support, designed as a Confluence clone.

### Key Configuration
- **Framework**: Angular 19.2.0 with SSR
- **Styling**: SCSS (configured as default component style)
- **Testing**: Jasmine + Karma for unit tests
- **Build Tool**: Angular CLI with esbuild
- **Server**: Express.js for SSR

### Project Structure
- `src/app/` - Main application code
  - `app.component.*` - Root component
  - `app.config.ts` - Client-side app configuration  
  - `app.config.server.ts` - Server-side app configuration
  - `app.routes.ts` - Client routing configuration
  - `app.routes.server.ts` - Server routing configuration
- `src/main.ts` - Client-side application bootstrap
- `src/main.server.ts` - Server-side application bootstrap  
- `src/server.ts` - Express server entry point
- `src/styles.scss` - Global styles
- `public/` - Static assets
- `dist/` - Build output directory

### Component Generation
Use Angular CLI schematics for consistent component generation:
- `ng generate component component-name` - Generate new component with SCSS
- `ng generate --help` - See all available schematics

### Build Configuration
- Production builds are optimized with budgets (500kB initial warning, 1MB error)
- Component styles have a 4kB warning, 8kB error limit
- Development builds include source maps and skip optimization

## Development Rules
You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.
### TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
### Angular Best Practices
- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
### Components
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead
### State Management
- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
### Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
### Services
- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
