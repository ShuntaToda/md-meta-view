---
id: "20260322-001"
title: "CI/CD pipeline with GitHub Actions"
date: 2026-03-22
sprint: sprint2
category: operations
deciders:
  - Diana
  - Eve
status: accepted
summary: "Set up CI/CD using GitHub Actions with staging and production environments"
---

# CI/CD pipeline with GitHub Actions

## Background

Need automated testing, building, and deployment for all packages in the monorepo.

## Pipeline

1. **On PR**: Lint, type-check, test, build
2. **On merge to main**: Deploy to staging
3. **On tag (v*)**: Deploy to production

## Environments

| Environment | Branch/Trigger | URL |
|-------------|---------------|-----|
| Preview | PR | `pr-{number}.preview.example.com` |
| Staging | main | `staging.example.com` |
| Production | v* tag | `example.com` |
