---
id: "20260310-001"
title: "Adopt monorepo with Turborepo"
date: 2026-03-10
sprint: sprint1
category: architecture
deciders:
  - Alice
  - Diana
status: accepted
summary: "Organize codebase as a monorepo using Turborepo for build orchestration"
---

# Adopt monorepo with Turborepo

## Background

Multiple packages (web app, API, shared utils) need coordinated development and deployment.

## Decision

Use a pnpm workspace monorepo with Turborepo for caching and task orchestration.

## Structure

```
packages/
  web/        # Next.js frontend
  api/        # Express API server
  shared/     # Shared types and utilities
```
