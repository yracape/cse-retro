export interface Transaction {
  id: number
  date: string
  libelle: string
  budget: 'Fonctionnement' | 'ASC'
  type: 'Dépense' | 'Recette'
  montant: number
}

export interface Offre {
  id: number
  titre: string
  categorie: string
  prixPublic: number
  prixCSE: number
  stock: number
  icone: string
}

export interface Beneficiaire {
  id: number
  nom: string
  prenom: string
  service: string
  anciennete: number
  quotient: 'Q1' | 'Q2' | 'Q3'
  points: number
}

export interface Subvention {
  id: number
  demandeur: string
  motif: string
  montant: number
  date: string
  statut: 'En attente' | 'Approuvée' | 'Refusée'
}

export interface Reunion {
  id: number
  date: string
  heure: string
  titre: string
  lieu: string
  ordre: string[]
  uid?: string
}

export interface Annonce {
  id: number
  titre: string
  texte: string
  date: string
  tag: string
}

export interface Budgets {
  fonctionnement: { alloue: number; depense: number }
  asc: { alloue: number; depense: number }
}

export interface Settings {
  nom: string
  annee: string
  email?: string
  icalUrl?: string
}

export const settingsInit: Settings = {
  nom: 'Établissements Mécano-Précision',
  annee: '1968',
  email: '',
  icalUrl: '',
}

export const budgetsInit: Budgets = {
  fonctionnement: { alloue: 18500, depense: 11240 },
  asc: { alloue: 62000, depense: 38950 },
}

export const depensesMensuelles = [
  { mois: 'Jan', fonctionnement: 1200, asc: 3100 },
  { mois: 'Fév', fonctionnement: 950, asc: 2800 },
  { mois: 'Mar', fonctionnement: 1400, asc: 4200 },
  { mois: 'Avr', fonctionnement: 1100, asc: 3600 },
  { mois: 'Mai', fonctionnement: 1650, asc: 5100 },
  { mois: 'Juin', fonctionnement: 1300, asc: 6800 },
  { mois: 'Juil', fonctionnement: 800, asc: 5900 },
  { mois: 'Août', fonctionnement: 640, asc: 3450 },
  { mois: 'Sep', fonctionnement: 2200, asc: 4000 },
]

export const repartitionASC = [
  { name: 'Billetterie', value: 14200, fill: '#E8641C' },
  { name: 'Voyages', value: 9800, fill: '#E9A319' },
  { name: 'Sport', value: 6100, fill: '#7A8B3F' },
  { name: 'Culture', value: 4850, fill: '#EE8F6B' },
  { name: 'Noël enfants', value: 4000, fill: '#C24E0F' },
]

export const transactionsInit: Transaction[] = [
  { id: 1, date: '1968-09-20', libelle: 'Subvention employeur ASC', budget: 'ASC', type: 'Recette', montant: 15500 },
  { id: 2, date: '1968-09-18', libelle: 'Billets cinéma Le Balzac (x200)', budget: 'ASC', type: 'Dépense', montant: 840 },
  { id: 3, date: '1968-09-15', libelle: 'Location salle des fêtes — kermesse', budget: 'ASC', type: 'Dépense', montant: 350 },
  { id: 4, date: '1968-09-12', libelle: 'Fournitures de bureau', budget: 'Fonctionnement', type: 'Dépense', montant: 96 },
  { id: 5, date: '1968-09-10', libelle: 'Vente billetterie septembre', budget: 'ASC', type: 'Recette', montant: 1210 },
  { id: 6, date: '1968-09-08', libelle: 'Honoraires expert-comptable', budget: 'Fonctionnement', type: 'Dépense', montant: 480 },
  { id: 7, date: '1968-09-05', libelle: 'Chèques cadeaux rentrée (x80)', budget: 'ASC', type: 'Dépense', montant: 2400 },
  { id: 8, date: '1968-09-02', libelle: 'Subvention employeur fonctionnement', budget: 'Fonctionnement', type: 'Recette', montant: 4625 },
]

export const offresInit: Offre[] = [
  { id: 1, titre: 'Cinéma Le Balzac', categorie: 'Culture', prixPublic: 8.5, prixCSE: 4.2, stock: 146, icone: 'clapperboard' },
  { id: 2, titre: 'Parc Astérix', categorie: 'Loisirs', prixPublic: 51, prixCSE: 29, stock: 38, icone: 'ferris-wheel' },
  { id: 3, titre: 'Forfait ski Chamonix', categorie: 'Sport', prixPublic: 62, prixCSE: 41, stock: 22, icone: 'mountain-snow' },
  { id: 4, titre: 'Musée du Louvre', categorie: 'Culture', prixPublic: 17, prixCSE: 9, stock: 74, icone: 'landmark' },
  { id: 5, titre: 'Piscine municipale (x10)', categorie: 'Sport', prixPublic: 35, prixCSE: 18, stock: 51, icone: 'waves' },
  { id: 6, titre: 'Cirque Bouglione', categorie: 'Spectacle', prixPublic: 28, prixCSE: 15, stock: 12, icone: 'tent' },
]

export const beneficiairesInit: Beneficiaire[] = [
  { id: 1, nom: 'Dubois', prenom: 'Simone', service: 'Comptabilité', anciennete: 12, quotient: 'Q2', points: 420 },
  { id: 2, nom: 'Moreau', prenom: 'Jean-Paul', service: 'Atelier', anciennete: 8, quotient: 'Q1', points: 380 },
  { id: 3, nom: 'Lefèvre', prenom: 'Monique', service: 'Secrétariat', anciennete: 15, quotient: 'Q3', points: 500 },
  { id: 4, nom: 'Girard', prenom: 'Marcel', service: 'Logistique', anciennete: 4, quotient: 'Q1', points: 290 },
  { id: 5, nom: 'Perrin', prenom: 'Claudine', service: 'Commercial', anciennete: 6, quotient: 'Q2', points: 350 },
  { id: 6, nom: 'Roche', prenom: 'Georges', service: 'Atelier', anciennete: 21, quotient: 'Q2', points: 445 },
  { id: 7, nom: 'Faure', prenom: 'Yvette', service: 'Accueil', anciennete: 2, quotient: 'Q1', points: 210 },
  { id: 8, nom: 'Blanchard', prenom: 'Henri', service: 'Informatique', anciennete: 9, quotient: 'Q3', points: 470 },
]

export const subventionsInit: Subvention[] = [
  { id: 1, demandeur: 'Simone Dubois', motif: 'Colonie de vacances — 2 enfants', montant: 280, date: '1968-09-19', statut: 'En attente' },
  { id: 2, demandeur: 'Marcel Girard', motif: 'Licence club de football', montant: 65, date: '1968-09-17', statut: 'En attente' },
  { id: 3, demandeur: 'Monique Lefèvre', motif: 'Cours de piano — conservatoire', montant: 120, date: '1968-09-14', statut: 'Approuvée' },
  { id: 4, demandeur: 'Georges Roche', motif: 'Achat vélo — transport doux', montant: 150, date: '1968-09-11', statut: 'Approuvée' },
  { id: 5, demandeur: 'Yvette Faure', motif: 'Abonnement piscine annuel', montant: 90, date: '1968-09-09', statut: 'Refusée' },
  { id: 6, demandeur: 'Henri Blanchard', motif: 'Stage théâtre amateur', montant: 110, date: '1968-09-21', statut: 'En attente' },
]

export const reunionsInit: Reunion[] = [
  {
    id: 1, date: '1968-09-30', heure: '14h00', titre: 'Réunion ordinaire de septembre', lieu: 'Salle des délégués',
    ordre: ['Budget ASC — point trimestriel', 'Préparation du voyage à Venise', 'Arbre de Noël 1968', 'Questions diverses'],
  },
  {
    id: 2, date: '1968-10-14', heure: '10h30', titre: 'Réunion extraordinaire — subventions', lieu: 'Bureau du CSE',
    ordre: ['Révision du barème quotient familial', 'Vote des subventions exceptionnelles'],
  },
  {
    id: 3, date: '1968-10-28', heure: '14h00', titre: 'Réunion ordinaire d’octobre', lieu: 'Salle des délégués',
    ordre: ['Compte rendu kermesse', 'Billetterie hiver', 'Commande calendriers 1969'],
  },
]

export const annoncesInit: Annonce[] = [
  { id: 1, titre: 'Voyage à Venise — printemps 1969', texte: 'Les inscriptions au voyage de 4 jours à Venise ouvrent lundi au bureau du CSE. Arrhes : 150 €. Places limitées à 45 personnes !', date: '1968-09-22', tag: 'Voyage' },
  { id: 2, titre: 'Nouvelle billetterie cinéma', texte: 'Le CSE a négocié un tarif préférentiel au cinéma Le Balzac : 4,20 € au lieu de 8,50 € sur présentation de la carte CSE.', date: '1968-09-18', tag: 'Billetterie' },
  { id: 3, titre: 'Kermesse du personnel — merci !', texte: 'Grâce à vous, la kermesse a réuni plus de 300 personnes. Le bénéfice de 1 240 € sera reversé au budget colonies de vacances.', date: '1968-09-16', tag: 'Événement' },
]

export const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .replace(/[  ]/g, ' ') + ' €'

export const fmtDate = (iso: string) => {
  const texte = new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}
