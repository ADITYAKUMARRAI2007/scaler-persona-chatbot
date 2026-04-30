# YouTube Transcript Style Analysis

This file documents the additional public YouTube transcript pass used to improve persona style. Transcripts were collected from public YouTube captions/auto-captions where available. Some videos include hosts and multiple speakers, so these notes are used as style signals, not as exact private speech replicas.

## Method

1. Search public YouTube for each person + Scaler/interview/podcast terms.
2. Use public captions/auto-captions where available.
3. Clean VTT captions into plain text.
4. Look for repeated words, answer structure, topics, examples, and conversational habits.
5. Translate those into prompt instructions without copying long quotes or claiming exact impersonation.

## Anshuman Singh

Public videos found/used:

- `dj3nGS_IM1o` — Raj Shamani interview
- `h17h92ccQ2M` — BeerBiceps / Ranveer Show episode
- `ibqBuhVtACk` — Love Babbar interview
- `kZXwFtAHSq8` — LearnApp / Prateek Singh conversation

Observed transcript signals:

- Conversational and founder-pragmatic rather than overly polished.
- Frequently explains by moving from a broad problem to a concrete example.
- Repeated framing around people, education, coding, companies, impact, Facebook, India, money, and careers.
- Uses natural spoken connectors like “right,” “yeah,” “I mean,” “actually,” and “okay” in long-form conversations.
- Often converts motivational topics into practical economics: skill → impact → opportunity → career outcome.
- Comfortable discussing tradeoffs, money, work ethic, and why education quality matters.

Prompt update implication:

Anshuman should sound like a practical founder-mentor: direct, conversational, first-principles, and outcome-aware. He can use short spoken transitions, but the chatbot should not overdo filler words.

## Abhimanyu Saxena

Public videos found/used:

- `hHKM5jQEz68` — Building the University of the Future
- `Jiit1yVb2oY` — Scaler School of Technology Answer Hour
- `LxsYSvUcI8M` — Education/podcast conversation

Caption access was strongest for `Jiit1yVb2oY`; other analysis is supported by public interview transcripts/articles already documented.

Observed transcript signals:

- Structured Q&A style: receives student/parent concerns and answers with institutional clarity.
- Repeated themes: students, campus, curriculum, industry, quality, technology, four-year program, outcomes.
- Tone is explanatory, assurance-building, and operations-oriented.
- Uses “make sure” style framing: how the institution ensures quality, industry relevance, mentoring, and student outcomes.
- Less punchy than a motivational influencer; more like a founder explaining a system and why it is designed that way.

Prompt update implication:

Abhimanyu should answer with cause-effect reasoning and institutional/product thinking: what problem exists, what system solves it, and how the learner should act inside that system.

## Kshitij Mishra

Public videos found/used:

- `63lrERP7JmE` — Almost Engineers conversation with Kshitij Mishra & Saurabh Saxena (caption download hit rate limits)
- `g4OcDTdCeIA` — SDE interview mistakes video on Kshitij Mishra channel

Important caveat: the available `g4OcDTdCeIA` captions include multiple speakers and appear to include Kshitij in a host/interviewer role rather than as the only speaker. Therefore these are weaker style signals.

Observed transcript signals:

- Interview/mentor style uses follow-up questions and structured prompts: asking about mistakes, experience, companies, coding, Java, interviews, and practical decision points.
- Repeated spoken markers include “right,” “yeah,” “let’s,” “basically,” “good,” and “point.”
- Focus is not abstract motivation; it is practical interview learning, mistakes to avoid, and extracting lessons from industry experience.
- Combined with public LinkedIn/Scaler signals, the persona should feel teacherly, reflective, and technical.

Prompt update implication:

Kshitij should ask diagnostic follow-ups, break down mistakes, and connect technical work to product/user thinking and long-term growth.

## Limits

- Auto-captions can be inaccurate, especially for Indian English/Hindi mixed speech.
- Videos often include hosts, so word-frequency alone is not enough.
- The app should remain a respectful educational simulation, not exact impersonation or voice mimicry.
