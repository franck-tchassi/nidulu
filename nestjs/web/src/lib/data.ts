import { Order, Product } from "../../types";


export const INITIAL_MOCK_PRODUCTS: Product[] = [
  { 
    id: 'v1', 
    name: 'DOUDOUNE LONGUE À CAPUCHE BLEUE', 
    price: 24.99, 
    category: 'Vêtements', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Doudoune chaude avec doublure polaire pour affronter l'hiver. Idéale pour les journées froides, elle assure confort et protection. Fabriquée avec des matériaux doux et hypoallergéniques pour la peau sensible de bébé.", 
  },
  { 
    id: 'v2', 
    name: 'PARKA CHAUDE DÉPERLANTE AVEC CAPUCHE', 
    price: 39.59, 
    category: 'Vêtements', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'],
    sizes: ['4A', '6A', '8A'],
    description: "Parka imperméable idéale pour la pluie et le vent. Son tissu déperlant garde votre enfant au sec, tandis que sa doublure chaude offre une protection optimale contre le froid. Design moderne et pratique pour toutes les aventures.", 
  },
  { 
    id: 'v3', 
    name: 'LOT DE 5 BOXERS EN JERSEY GARÇON', 
    price: 10.79, 
    category: 'Vêtements', 
    subCategory: 'Sous-vêtements', 
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Lot de 5 boxers confortables en coton doux. Parfaits pour le quotidien, ils offrent une grande liberté de mouvement et un confort optimal. Les motifs variés ajoutent une touche de fantaisie.", 
  },
  { 
    id: 'v4', 
    name: 'JOGGING EN MOLLETON GRIS GARÇON', 
    price: 9.99, 
    category: 'Vêtements', 
    subCategory: 'Pantalons', 
    image: 'https://images.unsplash.com/photo-1519234131113-50791652430b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1519234131113-50791652430b?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Pantalon de jogging confortable pour le sport ou la maison. Fabriqué en molleton doux, il est idéal pour les activités intérieures et extérieures. La taille élastiquée assure un ajustement parfait.", 
  },
  { 
    id: 'v5', 
    name: 'PANTALON JOGGER EN TOILE BLEU MARINE', 
    price: 7.99, 
    category: 'Vêtements', 
    subCategory: 'Pantalons', 
    image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=800'],
    sizes: ['4A', '6A', '8A'],
    description: "Pantalon en toile léger et résistant. Parfait pour les journées ensoleillées, il offre un style décontracté et une grande durabilité. Facile à entretenir et agréable à porter.", 
  },
  { 
    id: 'v6', 
    name: 'SWEAT-SHIRT BLEU MOTIF OURS GARÇON', 
    price: 13.79, 
    category: 'Vêtements', 
    subCategory: 'Sweats', 
    image: 'https://images.unsplash.com/photo-1621454523226-eb4f392ce907?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1621454523226-eb4f392ce907?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Sweat-shirt à col montant avec motif brodé. Idéal pour les mi-saisons, il apporte une touche de chaleur et de style. Le motif ours est adorable et plaît beaucoup aux enfants.", 
  },
  { 
    id: 'v7', 
    name: 'ROBE FLEURIE EN COTON FILLE', 
    price: 18.99, 
    category: 'Vêtements', 
    subCategory: 'Robes', 
    image: 'https://images.unsplash.com/photo-1589932691364-46707761ad6f?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1589932691364-46707761ad6f?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Robe légère et confortable en coton avec un joli motif fleuri. Parfaite pour les beaux jours, elle est douce et agréable à porter. Idéale pour toutes les occasions, des jeux au parc aux fêtes de famille.", 
  },
  { 
    id: 'v8', 
    name: 'ENSEMBLE PYJAMA BÉBÉ OURSON', 
    price: 15.49, 
    category: 'Vêtements', 
    subCategory: 'Pyjamas', 
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc9ff00?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc9ff00?auto=format&fit=crop&q=80&w=800'],
    sizes: ['0-3M', '3-6M', '6-9M'],
    description: "Pyjama doux et confortable pour bébé avec un adorable motif ourson. Fabriqué en coton biologique, il assure des nuits paisibles et douces. Facile à enfiler grâce à ses boutons-pression.", 
  },
  { 
    id: 'a1', 
    name: 'DOUDOUNE LONGUE À CAPUCHE BLEUE', 
    price: 24.99, 
    category: 'Accessoires & Puériculture', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Doudoune chaude avec doublure polaire pour affronter l'hiver. Idéale pour les journées froides, elle assure confort et protection. Fabriquée avec des matériaux doux et hypoallergéniques pour la peau sensible de bébé.", 
  },
  { 
    id: 'a2', 
    name: 'PARKA CHAUDE DÉPERLANTE AVEC CAPUCHE', 
    price: 39.59, 
    category: 'Accessoires & Puériculture', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'],
    sizes: ['4A', '6A', '8A'],
    description: "Parka imperméable idéale pour la pluie et le vent. Son tissu déperlant garde votre enfant au sec, tandis que sa doublure chaude offre une protection optimale contre le froid. Design moderne et pratique pour toutes les aventures.", 
  },
  { 
    id: 'j1', 
    name: 'DOUDOUNE LONGUE À CAPUCHE BLEUE', 
    price: 24.99, 
    category: 'Jouets & Éveil', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800'],
    sizes: ['2A', '3A', '4A', '5A'],
    description: "Doudoune chaude avec doublure polaire pour affronter l'hiver. Idéale pour les journées froides, elle assure confort et protection. Fabriquée avec des matériaux doux et hypoallergéniques pour la peau sensible de bébé.", 
  },
  { 
    id: 'j2', 
    name: 'PARKA CHAUDE DÉPERLANTE AVEC CAPUCHE', 
    price: 39.59, 
    category: 'Jouets & Éveil', 
    subCategory: 'Manteaux', 
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'],
    sizes: ['4A', '6A', '8A'],
    description: "Parka imperméable idéale pour la pluie et le vent. Son tissu déperlant garde votre enfant au sec, tandis que sa doublure chaude offre une protection optimale contre le froid. Design moderne et pratique pour toutes les aventures.", 
  },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-7721', date: '2023-10-24', customer: 'Sophie Martin', total: 105.99, status: 'Payé', items: 1 },
  { id: 'ORD-7722', date: '2023-10-23', customer: 'Jean Dupont', total: 59.99, status: 'Expédié', items: 2 },
  { id: 'ORD-7723', date: '2023-10-22', customer: 'Marie Leroy', total: 215.50, status: 'Livré', items: 4 },
  { id: 'ORD-7724', date: '2023-10-21', customer: 'Lucas Bernard', total: 15.50, status: 'En préparation', items: 1 },
];

export const getProducts = (): Product[] => {
  // In a real app, this would fetch from a database or API
  if (typeof window !== 'undefined') {
    const savedProducts = localStorage.getItem('nidolu_inventory');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
  }
  return INITIAL_MOCK_PRODUCTS;
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const updateProducts = (newProducts: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nidolu_inventory', JSON.stringify(newProducts));
  }
};

