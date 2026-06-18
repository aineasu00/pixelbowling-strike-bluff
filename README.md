# Strike & Bluff

Jeu de cartes collectif pass-and-play pour tablette, conçu pour Pixel Bowling. Toutes les cartes et informations sont publiques : le bluff repose sur la déclaration orale.

## Jouer

1. Ouvrir `index.html` via un serveur statique.
2. Ajouter 2 à 9 joueurs.
3. Le meneur choisit la valeur cible.
4. À son tour, chaque joueur sélectionne 1 à 3 cartes visibles, annonce oralement qu’elles correspondent à la cible, puis les pose.
5. N’importe quel autre joueur peut toucher **BLUFF !** et s’identifier comme accusateur.
6. Le premier joueur à gagner 3 manches remporte la partie.

## Développement local

```powershell
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Architecture

- HTML5 / CSS3 / JavaScript ES6 vanilla
- 60 cartes : 52 standards, 4 Jokers, 4 Kingpins
- sauvegarde automatique `localStorage`
- service worker offline
- aucun backend, framework, canvas, WebGL ou appel API

## GitHub Pages

Le site est statique et se déploie depuis la branche `main`, dossier racine.
