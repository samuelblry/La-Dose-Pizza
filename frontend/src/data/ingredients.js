export const INGREDIENTS_PAR_CATEGORIE = [
  {
    label: 'Bases',
    items: ['Sauce tomate', 'Crème fraîche', "Huile d'olive"],
  },
  {
    label: 'Fromages',
    items: ['Mozzarella', 'Burrata', 'Gorgonzola', 'Parmesan', 'Ricotta', 'Chèvre', 'Emmental'],
  },
  {
    label: 'Viandes & Poissons',
    items: ['Jambon', 'Pepperoni', 'Chorizo', 'Lardons', 'Poulet', 'Bœuf haché', 'Merguez', 'Anchois', 'Thon', 'Crevettes'],
  },
  {
    label: 'Légumes',
    items: ['Tomates cerises', 'Poivrons', 'Champignons', 'Oignons rouges', 'Roquette', 'Épinards', 'Courgette', 'Aubergine', 'Maïs', 'Olives noires', 'Olives vertes', 'Artichauts', 'Câpres'],
  },
  {
    label: 'Herbes & Épices',
    items: ['Basilic frais', 'Origan', 'Ail', 'Piment'],
  },
  {
    label: 'Autres',
    items: ['Œuf', 'Truffe'],
  },
]

export const TOUS_INGREDIENTS = INGREDIENTS_PAR_CATEGORIE.flatMap((c) => c.items)

// Mapping ingrédient → allergènes (EU-14)
export const ALLERGENES_PAR_INGREDIENT = {
  'Crème fraîche': ['Lactose'],
  'Mozzarella': ['Lactose'],
  'Burrata': ['Lactose'],
  'Gorgonzola': ['Lactose'],
  'Parmesan': ['Lactose'],
  'Ricotta': ['Lactose'],
  'Chèvre': ['Lactose'],
  'Emmental': ['Lactose'],
  'Pepperoni': ['Gluten'],
  'Chorizo': ['Gluten'],
  'Merguez': ['Gluten'],
  'Anchois': ['Poisson'],
  'Thon': ['Poisson'],
  'Crevettes': ['Crustacés'],
  'Œuf': ['Œufs'],
}

// Tous les allergènes possibles dédoublonnés et triés
export const TOUS_ALLERGENES = [
  ...new Set(Object.values(ALLERGENES_PAR_INGREDIENT).flat()),
].sort((a, b) => a.localeCompare(b))
