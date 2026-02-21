import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const vetements = await prisma.category.create({
    data: {
      name: 'Vêtements',
      slug: 'vetements',
      description: 'Vêtements pour bébés et enfants',
    },
  });

  const accessoires = await prisma.category.create({
    data: {
      name: 'Accessoires & Puériculture',
      slug: 'accessoires-puericulture',
      description: 'Accessoires et articles de puériculture',
    },
  });

  const jouets = await prisma.category.create({
    data: {
      name: 'Jouets & Éveil',
      slug: 'jouets-eveil',
      description: 'Jouets et jeux d\'éveil',
    },
  });

  // Create products
  await prisma.product.create({
    data: {
      name: 'DOUDOUNE LONGUE À CAPUCHE BLEUE',
      description: 'Doudoune chaude avec doublure polaire pour affronter l\'hiver. Idéale pour les journées froides, elle assure confort et protection. Fabriquée avec des matériaux doux et hypoallergéniques pour la peau sensible de bébé.',
      price: 24.99,
      stock: 50,
      sku: 'DOUD-BLEU-001',
      categoryId: vetements.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800',
            alt: 'Doudoune bleue',
            order: 1,
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'PARKA CHAUDE DÉPERLANTE AVEC CAPUCHE',
      description: 'Parka imperméable idéale pour la pluie et le vent. Son tissu déperlant garde votre enfant au sec, tandis que sa doublure chaude offre une protection optimale contre le froid. Design moderne et pratique pour toutes les aventures.',
      price: 39.59,
      stock: 30,
      sku: 'PARKA-ROUGE-002',
      categoryId: vetements.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
            alt: 'Parka rouge',
            order: 1,
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'LOT DE 5 BOXERS EN JERSEY GARÇON',
      description: 'Lot de 5 boxers confortables en coton doux. Parfaits pour le quotidien, ils offrent une grande liberté de mouvement et un confort optimal. Les motifs variés ajoutent une touche de fantaisie.',
      price: 10.79,
      stock: 100,
      sku: 'BOXERS-LOT-003',
      categoryId: vetements.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800',
            alt: 'Lot de boxers',
            order: 1,
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });