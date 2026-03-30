---
id: "20260312-001"
title: "Build design system with shadcn/ui"
date: 2026-03-12
sprint: sprint2
category: tech-selection
deciders:
  - Alice
  - Eve
status: accepted
summary: "Use shadcn/ui as the base component library for the design system"
---

# Build design system with shadcn/ui

## Background

We need a consistent UI component library that allows customization without fighting against framework defaults.

## Decision

Use shadcn/ui with Tailwind CSS v4. Components are copied into the codebase rather than installed as a dependency.

## Benefits

- Full ownership of component code
- Easy to customize and extend
- Accessible by default (Radix primitives)
