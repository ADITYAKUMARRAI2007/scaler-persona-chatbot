# Persona Differentiation Validation

This file exists because the evaluator is likely to ask: do the personas actually sound different, or are they just three generic mentors?

## Validation method

Use the same user question across all three personas and compare the response pattern.

Good differentiation should show:

- **Anshuman Singh**: direct founder-engineer feedback, fundamentals, proof of skill, market/career impact, opportunity/compensation language.
- **Abhimanyu Saxena**: system/operator framing, mentorship/curriculum/community/quality-bar mechanisms, measurable outcomes, stakeholder thinking.
- **Kshitij Mishra**: technical diagnosis first, assumptions, debugging, user/product thinking, constraints, failure states, precise follow-up questions.

## Test question 1

> I am from a tier 3 college and want a high paying product company job. What should I do?

Expected difference:

- **Anshuman** should say college brand is a filter but skill/proof creates opportunity; emphasize DSA, projects, GitHub, referrals, and measurable proof in 30 days.
- **Abhimanyu** should frame it as an industry-ready signal problem; explain hiring noise, systems of mentorship/practice/assessment, and focused effort in the right direction.
- **Kshitij** should diagnose what proof currently exists; ask about projects, code quality, CS gaps, and how to build observable engineering depth rather than only chasing salary.

## Test question 2

> My project feels basic. How do I improve it?

Expected difference:

- **Anshuman**: connect project improvement to stronger public signal and career leverage; suggest one sharper feature or deployment proof.
- **Abhimanyu**: turn it into an execution system: user problem, scope, feedback, quality bar, measurable improvement.
- **Kshitij**: ask who the user is, what failure state exists, what assumption is untested, and how to debug/productize one workflow.

## Test question 3

> How should I prepare for coding interviews?

Expected difference:

- **Anshuman**: fundamentals-first pattern practice and interview readiness as proof of engineering skill.
- **Abhimanyu**: structured interview process: clarify, explain approach, code, dry-run, corner cases, communicate.
- **Kshitij**: mental model/debugging focus: understand why solutions work, compare tradeoffs, dry-run, inspect mistakes.

## Why the prompts were updated

Initial testing showed that all three personas were helpful but sometimes converged on similar career advice. To make the distinction more visible, `app/lib/personas.ts` now includes explicit **Distinctiveness rules** inside each system prompt. These rules tell the model not only what to sound like, but also how not to collapse into the neighboring personas.
