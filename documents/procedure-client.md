# Procédure : un nouveau client, du premier message à la mise en ligne

Version simple, pour Nasser. Claude fait toute la partie technique.

## Pour lancer

Écris simplement : **Nouveau client : [nom du client]**
(ou tape `/nouveau-client [nom]`)

Ajoute ce que tu sais déjà, même en vrac : métier, ville, numéro WhatsApp, lien Instagram, ce qu'il veut. Tu peux aussi coller ses réponses au questionnaire ou envoyer ses fichiers (logo, photos).

Pour reprendre un client plus tard : **Client [nom] : on continue**

## Ce qui se passe ensuite

| Étape | Toi | Claude |
|---|---|---|
| 1. Brief | Tu envoies le questionnaire au client (`documents/pdf/brief-client.pdf`) et tu me transmets ses réponses. | Je crée sa fiche et sa liste de choses à faire, je repère ce qui manque et je te pose les questions en une seule fois. |
| 2. Logo (si besoin) | Tu montres les pistes au client et tu me dis laquelle il choisit. | Je dessine 2 ou 3 pistes avec leur animation, puis les fichiers finaux et la mini-charte. |
| 3. Démo | Tu crées un dépôt GitHub privé vide (je te dis le nom à utiliser) et tu me le donnes. | Je construis le site complet à ses couleurs, je le mets en ligne sur une adresse provisoire non référencée, je teste et je t'envoie les captures. |
| 4. Retouches | Tu me transmets les demandes du client. | Je fais les retouches et je t'envoie les nouvelles captures. |
| 5. Mise en ligne | Tu choisis la formule avec le client, tu fais signer le devis ou le contrat. | Je vérifie les mentions légales, je branche le nom de domaine, j'active le référencement. |
| 6. Remise | Tu envoies la fiche de remise et ta facture. | Je prépare la fiche de remise. |

## Les règles qui ne bougent jamais

- Pas de faux : pas de faux avis, pas de faux chiffres, pas de photo de banque d'images présentée comme une réalisation.
- Uniquement des photos, logos et textes dont le client a les droits.
- Aucun label ou agrément affiché sans preuve.
- Mentions légales et politique de confidentialité au nom du client avant la mise en ligne.
- Les devis et contrats sont des brouillons : à faire relire par un juriste ou un comptable.

## Où sont rangées les choses

- `clients/[nom]/fiche.md` : tout ce qu'on sait du client (réponses, choix, retouches).
- `clients/[nom]/todo.md` : la liste de choses à faire, cochée au fur et à mesure.
- Le site du client : dans son propre dépôt GitHub privé.
