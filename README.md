# GestCashier

Application de caisse et de gestion de stock pour Windows (Tauri + Vue 3 + SQLite).
Cash register and stock-management desktop app.

## Fonctionnalités / Features

- **Caisse (Ventes)** : catalogue par catégorie, recherche (nom / code / code-barres), scan code-barres, remise avec contrôle de la marge de négociation, alerte stock insuffisant, **montant reçu → rendu**, **ticket 80 mm imprimable**, historique des ventes (réimpression, annulation avec remise en stock).
- Stock, clients, fournisseurs, factures (vente / achat), bons de livraison, paiements, charges.
- Tableau de bord (chiffre d'affaires, marges, charges).
- Connexion sécurisée (mots de passe hachés avec bcrypt), base SQLite locale.

### Raccourcis de la caisse / POS shortcuts

| Touche | Action |
| ------ | ------ |
| `F2`   | Rechercher un article |
| `F9`   | Valider la vente |
| `Échap`| Vider le panier |

## Développement / Development

Prérequis : [Node.js](https://nodejs.org), [Rust](https://rustup.rs) et les [prérequis Tauri v1](https://tauri.app/v1/guides/getting-started/prerequisites).

```bash
npm install
npm run tauri dev      # lancer en développement
npm run tauri build    # générer l'installeur Windows
```

La base `cashier.db` est créée au premier lancement (migrations dans `src-tauri/src/main.rs`).
`scripts/import_excel.py` est un outil facultatif d'import depuis un fichier Excel.

## Stack

Tauri 1 · Vue 3 · TypeScript · PrimeVue 4 · Tailwind · SQLite (`tauri-plugin-sql`)

## Licence

Voir [LICENSE](LICENSE).
