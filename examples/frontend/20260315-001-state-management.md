---
id: "20260315-001"
title: "Use Zustand for client state management"
date: 2026-03-15
sprint: sprint2
category: tech-selection
deciders:
  - Bob
  - Eve
status: accepted
summary: "Adopted Zustand for lightweight client-side state management"
---

# Use Zustand for client state management

## Background

React Server Components handle most data fetching, but some client-side state is needed for UI interactions, form state, and optimistic updates.

## Decision

Use Zustand for client state. It is lightweight (~1KB), has no boilerplate, and integrates well with React.

## Why not Redux/Jotai?

- Redux: Too much boilerplate for our scale
- Jotai: Atomic model is powerful but unnecessary complexity for simple UI state
