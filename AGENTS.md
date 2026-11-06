# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project overview

Автономная HTML-экспозиция «Эволюция Веба 1991→2026»: один файл, 4 встроенных вариативных шрифта, ноль внешних запросов. Правила аккаунта — в rtynbirf/repo-doctrine.

## Commands

Пересборка артефакта из клона: `python3 tools/squeeze_build.py` (нужны fonttools+brotli и node с lightningcss/@swc/core).
Верификация рендера: `python3 tools/probe_weights.py evolution-web-1991-2026.html` (playwright).

## Conventions

- Keep changes minimal and focused; one logical change per commit.
- Never commit secrets, tokens, or credentials.
- Артефакт evolution-web-1991-2026.html — самодостаточный: любые правки идут через src/ + tools/, не руками в артефакте.
- После изменений — повторная верификация (fonts.check, консоль, размер).
