# T001 — Ignorer les captures de test

Statut : à faire
Story : hygiène du dépôt · Exigences : —
Dépend de : aucune
Parallélisable : non
Exécutant : workflow:executor

## Objectif

Les captures et instantanés écrits par l'outil de test navigateur dans `.playwright-mcp/` n'apparaissent plus dans `git status`.

## Fichiers à lire

- `.gitignore` — structure actuelle (blocs commentés).

## Fichiers cibles

| Fichier | Action | Ce qui change |
|---|---|---|
| `.gitignore` | modifier | ajout d'un bloc en fin de fichier |

## Étapes

1. À la fin de `.gitignore`, ajouter exactement ces trois lignes (ligne vide avant le commentaire) :

```

# Captures des tests navigateur (Playwright MCP)
.playwright-mcp/
```

2. Le fichier est en fins de ligne CRLF (Windows) : les lignes ajoutées doivent l'être aussi (vérifier avec `file .gitignore` : « with CRLF line terminators », sans mention de LF mixte). Garder la ligne vide avant le commentaire.

3. Ne rien modifier d'autre dans le fichier.

## Critères d'acceptation

- [ ] AC-01 : `git check-ignore .playwright-mcp/test.png` affiche `.playwright-mcp/test.png`.
- [ ] AC-02 : `git diff .gitignore` ne montre que trois lignes ajoutées (une vide, le commentaire, la règle).
- [ ] AC-03 : `file .gitignore` indique « with CRLF line terminators » uniquement.

## Vérification

```bash
git check-ignore .playwright-mcp/test.png
git diff --stat
```

Vérification navigateur : aucune (pas d'impact visible).

## Hors périmètre

- Toute autre règle du `.gitignore`.
- Suppression de fichiers.

## Notes d'exécution
