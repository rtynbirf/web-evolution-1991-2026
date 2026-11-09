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

## Гигиена агента (Волна ×10, 2026-11-10)

Канон: repo-doctrine → `21-гигиена-уведомлений-и-красного-CI-2026-11-09.md`. Вход по закону: `github-runbook#10` (РЕЕСТР НЕДОДЕЛАННОГО · закон §5) + РЕЕСТР-КОСЯКОВ-ИИ + АНАТОМИЯ-КОСЯКОВ-ИИ (polimat-hub) — читать ДО первого действия.

1. Красный CI от твоего коммита — твой долг: живой зелёный прогон до конца сессии (rerun/диспатч/лат). Честный красный (внешний блок) — пломбой в github-runbook#10, не прятать.
2. Новые файлы — в манифесты тем же коммитом: SPDX/REUSE.toml, MANIFEST/portability.json, геном cell-swarm/swarm.json (пин следит за телом).
3. Не плодить уведомления: свой прогон доведи до зелёного; входящие треды разобрать и пометить прочитанными; UNREAD=0 — норма.
4. Пуш-гигиена: `pull --rebase` перед пушем; force-push запрещён; чужие волны и авто-коммиты (§3 реестра) не трогать; дубль снят честно = нет дубля.
