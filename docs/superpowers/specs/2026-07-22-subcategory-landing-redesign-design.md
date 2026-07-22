# Subcategory-first landing redesign

**Date:** 2026-07-22
**Status:** Approved by user, ready for implementation planning

## Goal

Family pages (`/lab-equipment`, `/petit-outillage`, `/chemicals`) currently open on a flat
product grid with a chip nav for subcategories. User wants them to open on a subcategory
(or subcategory-group) card grid instead — the same visual pattern already used on `/shop`
(image + title + description card, linking deeper).

## Scope

- **`chimie`** (12 subcategories): flat card grid, no grouping layer — same pattern as `/shop` today.
- **`equipements`** (57 subcategories) and **`petit-outillage`** (81 subcategories): too many
  subcategories for a flat grid, so they get an intermediate **group** layer — ~10 named
  groups per family, each rendered as a card; clicking a group opens a page listing that
  group's subcategories as cards; clicking a subcategory opens the existing
  `[subcategory]/page.tsx` (unchanged).
- **`glassware` (`verrerie`) is retired.** Investigation found `/fr/glassware` routes to the
  `verrerie` category, which has 0 subcategories and 0 products — dead since an earlier merge
  (`merge-glassware-into-outillage-verrerie.mjs`) moved all real glassware content into
  `petit-outillage`. All 81 `petit-outillage` subcategories trace back to the same Humeau
  scrape source ("petit matériel verrerie plastique"), so there is no clean glass-vs-tools
  split in the data — user chose to drop the split rather than guess at 81 categorizations.
  `/fr/glassware/*` routes redirect to `/fr/petit-outillage/*`; the `verrerie` category row is
  left untouched in the DB (orphaned, not deleted).

## Data model

New columns on `categories`:

```sql
alter table categories add column group_key text;
alter table categories add column group_label jsonb; -- {"fr": "...", "en": "..."}
```

- `chimie` subcategories: `group_key` stays `null` (flat).
- `equipements` / `petit-outillage` subcategories: `group_key` set per the mapping below via a
  one-off script (`app/scripts/assign-category-groups.mjs`).
- `getChildCategoriesGrouped(parentId)` added to `queries.ts`, returns
  `{ groupKey, groupLabel, categories: Category[] }[]`, ordered by group `position` then
  category `position`. Any subcategory with `group_key = null` in a grouped family is a data
  bug (should not happen after the assignment script runs) — surfaced as an "Autres" bucket
  rather than silently dropped, so it's visible if it happens.

## Routes

- `/fr/lab-equipment` and `/fr/petit-outillage`: root page changes from product-grid+chips to
  a card grid of the family's 10 groups (reuses `/shop`'s `cat-grid` markup/CSS).
- `/fr/lab-equipment/groupe/[group]/page.tsx` (new) and `/fr/petit-outillage/groupe/[group]/page.tsx`
  (new): lists the group's subcategories as cards. `groupe/` segment avoids collision with
  existing subcategory/product slugs living directly under the family root.
- `/fr/lab-equipment/[subcategory]/page.tsx` and `/fr/petit-outillage/[subcategory]/page.tsx`:
  unchanged.
- `/fr/chemicals`: root page changes from product-grid+chips to a flat 12-card subcategory
  grid (no group layer). `/fr/chemicals/[subcategory]/page.tsx` unchanged.
- `/fr/glassware/**`: redirected to the equivalent `/fr/petit-outillage/**` path. Nav link
  in `Header.tsx` updated to point at `/fr/petit-outillage`.

## Images

32 Unsplash photos sourced and saved as `.webp` (via Unsplash's `fm=webp` CDN param, no local
conversion step needed) under `app/public/images/groups/{equipements,petit-outillage,chimie}/<slug>.webp`.
Chosen for visual recognizability per category, not exact-instrument matching (mirrors the
"placeholder now, real photos later" pattern already used for product images).

## Groups — équipements (57 subcategories → 10 groups)

| group_key | Label | Subcategories |
|---|---|---|
| `chauffage-sechage-etuves` | Chauffage, séchage & étuves | bains, block-heaters, drying-cabinets, furnaces, hotplates, ovens, incubators, stirrers |
| `refrigeration-cryogenie` | Réfrigération & cryogénie | chillers, cryostats, freeze-dryers, ice-machines, refrigeration |
| `pesee-mesure-physique` | Pesée & mesure physique | balances, hydrometers, density-meters, viscometers, refractometres, rheometers |
| `ph-conductivite-eau` | pH, conductivité & qualité de l'eau | conductivity-meters, ph-meters, dissolved-oxygen-meters, multichannel-meters, turbidity-meters, osmometers, water-purification, hygrometers |
| `spectro-chromato-analyse` | Spectro, chromato & analyse | spectrophotometers, colorimeters, flame-photometers, hplc, lc-ms, nmr, mass-spectrometry-supplies, melting-point-apparatus, titrators |
| `agitation-melange-centrifugation` | Agitation, mélange & centrifugation | mixers, homogenisers, sieve-shakers, centrifuges, rotary-evaporators |
| `microscopie-comptage` | Microscopie & comptage | microscopes, microtomes, colony-counters, microplate-readers, laveurs-microplaques |
| `securite-confinement` | Sécurité & confinement | biological-safety-cabinets, fume-cupboards, laminar-flow-cabinets, glove-boxes, autoclaves, glass-washers |
| `biologie-moleculaire` | Biologie moléculaire | thermal-cyclers, electroporators |
| `instruments-consommables-divers` | Instruments & consommables divers | pipettes, thermometers, pumps |

## Groups — petit-outillage (81 subcategories → 10 groups)

| group_key | Label | Subcategories |
|---|---|---|
| `verrerie-generale-contenants` | Verrerie générale & contenants | outillage-verrerie, bonbonne, creusets, cristallisoir-capsule, cuvette-bac-plateau, verre-de-montre, bille, dessiccateur, mortier |
| `flacons-flaconnage` | Flacons & flaconnage | pissette, flacon-de-culture, flacon-plastique, flacon-verre, flacon-pycnometre, flacon-laveur, flacon-aluminium, flacon-mesureur-a-renversement, flacon-pulverisateur |
| `montage-verrerie-raccords` | Montage de verrerie & raccords | montage-verrerie-refrigerant, raccord-plastique-montage-verrerie, raccord-montage-verrerie, robinet-montage-verrerie, support-statif-montage-verrerie, tuyau-montage-verrerie, tube-montage-verrerie, noix-de-serrage, anneau-de-lestage, extracteur-soxhlet, allonge-montage-verrerie, collier-de-serrage, raccord-verre-montage-verrerie, trompe-a-eau-montage-verrerie |
| `lames-lamelles-microscopie` | Lames, lamelles & microscopie | cellule-numeration-lame-lamelle, couvre-objet-lame-lamelle, accessoires-lame-lamelle, porte-objet-lame-lamelle |
| `pesee-metrologie` | Pesée & métrologie | butyrometre, densimetre-areometre, pied-a-coulisse, poids-de-calibration, vase-sabot-nacelle-pesee, barometre-pluviometre-psychrometre, manometre, consistometre |
| `instruments-chronometrage` | Instruments de mesure & chronométrage | thermometre, minuterie, chronometre, loupe |
| `prelevement-transfert-agitation` | Prélèvement, transfert & agitation | cones, petit-materiel-d-agitation, seringue, sonde-de-prelevement, spatule-cuillere, louche, pince |
| `rangement-transport-protection` | Rangement, transport & protection | boite, chariot, glaciere-accumulateur-de-froid, portoir, seau, panier, elevateur-de-laboratoire, jarre-anaerobie, plateau |
| `nettoyage-entretien` | Nettoyage & entretien | bistouri, egouttoirs, essuyage-lingettes, goupillon, ciseaux, couteau, parafilm, coton, coupe-tube |
| `consommables-fournitures` | Consommables & fournitures | etiquettes, papier-d-emballage, becs, crayon-de-laboratoire, piles, papier-pour-imprimante, cahier-de-laboratoire, gabarits |

## Chimie (12 subcategories, flat — no grouping)

oils-and-greases, labelling-reagents, genomic-dna, microbiology-media,
density-gradient-centrifugation-media, bioreagents, enzymes, nucleotides-nucleosides,
proteins-and-peptides, antibiotics, biocides, cell-solutions

## Out of scope

- Inner group→subcategory listing pages stay text/chip-style — no per-subcategory images
  (138 subcategories inside groups, user chose to bound scope to the 32 top-level cards).
- No backfill of images for subcategory pages themselves.
- No changes to product detail pages, admin, or checkout flow.
