<!-- prettier-ignore-start -->
<!-- omit in toc -->
# PowerBI Search Engine

`PowerBI Search Engine` est un logiciel pour extraire des données des rapports et tableaux de bord Microsoft Power BI et effectuer des recherches sur ces données.  
Son objectif est de faciliter la recherche de contenu, tout en permettant d'exporter les données utilisées, pour les partager, ou construire des applications plus complexes les exploitant.  
Il vient ainsi remplacer le système de recherche par défaut de Power BI, uniquement basé sur le nom des contenus.

Il possède de nombreuses fonctionnalités :

-   **Workspace Discovery** : liste les espaces de travail disponibles
-   **Workspace crawling** : liste les contenus disponibles dans un espace de travail
-   **Content scraping** : extraire des données d'une page et déterminer les tags
-   **Content screenshot** : prendre une capture d'écran d'une page
-   **Data exporter** : exporter toutes les données collectées sous forme de fichier JSON (peut être utilisé avec Microsoft 365)
-   **Data explorer** : consulter les données collectées avec possibilité de recherche par mot-clefs et espace de travail

<!-- omit in toc -->
# Sommaire

- [Installation](#installation)
  - [Installer](#installer)
  - [Depuis la source](#depuis-la-source)
- [Utilisation](#utilisation)
- [Crédits](#crédits)

<!-- prettier-ignore-end -->

# Installation

## Installer

⚠️ _L'installer de `PowerBI Search Engine` est uniquement disponible pour Windows_

1. Téléchargez l'installer depuis la page `Releases`.
2. Lancez l'installer
3. Après l'installation, `PowerBI Search Engine` devrait démarrer automatiquement.

## Depuis la source

1. Clonez ou téléchargez ce dépôt.
2. Faites `npm i` ou `npm ci` (ou équivalent) pour installer les dépendances.
3. Faites `npm run electron:serve` pour démarrer le projet en mode dev.
4. Faites `npm run electron:build` pour faire un build du projet.

# Utilisation

_Bientôt_

# Crédits

Projet développé par :

-   <img width="25px" src="docs/img/onix.png"> [@NeoOniX](https://github.com/NeoOniX)

Fonctionne grâce à :

-   <img width="25px" src="docs/img/electron.png"> [Electron](https://www.electronjs.org/)
-   <img width="25px" src="docs/img/react.png"> [React](https://reactjs.org/).
-   <img width="25px" height="25px" src="docs/img/puppeteer.png"> [Puppeteer](https://pptr.dev/).
-   <img width="25px" src="docs/img/node.png"> [NodeJS](https://nodejs.org/).

Fait spécialement pour :

-   <img width="25px" src="docs/img/sncf.png"> [SNCF](https://powerbi.microsoft.com/).
-   <img width="25px" src="docs/img/pbi.png"> [PowerBI](https://powerbi.microsoft.com/).
