# JobTrackr

A local-first job tracker for managing applications, follow-ups, interview progression, and evidence-based career decisions.

Most job trackers measure activity. Track Record is designed to show what can still change an outcome: a follow-up that is due, an application that has gone cold, weak evidence of fit, or a decision that needs making.

<img width="1297" height="981" alt="Screenshot 2026-09-27 211342" src="https://github.com/user-attachments/assets/ed0414a6-6f24-4c62-bb58-1ffe91b92c31" />


## The problem

A job hunt quickly becomes a messy mixture of bookmarks, recruiter emails, interview notes, spreadsheets, and roles that quietly disappear.

Counting applications is not useful on its own. The useful questions are:

- Which opportunities need action now?
- Which application sources actually lead to interviews?
- Where does the process break down?
- Which roles are genuinely evidence-led matches versus speculative applications?
- What have I learned from each interview, rejection, or withdrawn process?

## What it does

- Tracks applications by current state, current stage, and closed outcome
- Store Watchlist jobs and companies you hope to apply to
- Maintains a dated activity timeline for every application
- Highlights follow-ups due, stale applications, and opportunities without a next action
- Records evidence of fit, risks, learning, and interview notes
- Separates active applications from a watchlist of roles and companies worth monitoring
- Exports data as JSON for backup and portability to other AI tools

<img width="1277" height="393" alt="Screenshot 2026-09-27 211548" src="https://github.com/user-attachments/assets/80ba4d98-0cf5-4431-babf-c821380c1c02" />


## Product principles

### Activity is not progress

A large application count can hide a weak pipeline. The dashboard prioritises actions, outcomes, and conversion signals over volume.

### Evidence over optimism

Each role includes an evidence-of-fit assessment. This makes it easier to distinguish a strong match from an interesting but speculative application.

### History matters

An application is not one status. It is a sequence of decisions, conversations, interviews, and outcomes. The activity timeline keeps that context intact.

### Private by default

Application notes are stored locally in the browser. No account, database, or third-party data storage is required.

## Built with

- Next.js
- React
- TypeScript
- LocalStorage

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Status

This is an active product experiment exploring how better information design can make a job search more deliberate, less emotionally noisy, and easier to learn from.
