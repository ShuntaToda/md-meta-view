---
id: "20260305-001"
title: "Use Amazon Cognito for authentication"
date: 2026-03-05
sprint: sprint1
category: tech-selection
deciders:
  - Bob
  - Charlie
status: accepted
summary: "Chose Cognito as managed auth provider for user authentication"
---

# Use Amazon Cognito for authentication

## Background

The application requires user sign-up, sign-in, and token-based authentication. We evaluated self-hosted vs managed solutions.

## Decision

Use Amazon Cognito User Pools with hosted UI for authentication flows.

## Rationale

- **Managed service**: No need to maintain auth infrastructure
- **AWS integration**: Works seamlessly with API Gateway and Lambda
- **Cost**: Free tier covers up to 50,000 MAU
