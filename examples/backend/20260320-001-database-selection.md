---
id: "20260320-001"
title: "Use PostgreSQL with Prisma ORM"
date: 2026-03-20
sprint: sprint2
category: tech-selection
deciders:
  - Alice
  - Bob
  - Charlie
status: accepted
summary: "Selected PostgreSQL as primary database with Prisma as the ORM layer"
---

# Use PostgreSQL with Prisma ORM

## Background

The application requires a relational database for structured data with complex queries.

## Decision

- **Database**: PostgreSQL 16 on Amazon RDS
- **ORM**: Prisma for type-safe database access

## Rationale

- PostgreSQL: Robust, open-source, excellent JSON support
- Prisma: Auto-generated types from schema, great migration tooling
- RDS: Managed backups, read replicas, Multi-AZ for HA
