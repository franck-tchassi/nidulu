//web/src/app/[locale]/admin/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory
} from '@/lib/api';
import { CategoryResponse } from '@/types';

// Mettre à jour l'interface Product pour supporter les images multiples
interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  images: ProductImage[]; // Changé: images au pluriel au lieu de imageUrl
  category: string | null;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category extends CategoryResponse {
  // Additional properties if needed
}

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Product | Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingProductImages, setExistingProductImages] = useState<ProductImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    categoryId: '',
    isActive: true,
    sizes: '', // champ texte séparé par des virgules
    colors: '', // champ texte séparé par des virgules
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    imageUrl: '',
    parentId: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
      toast.error('Accès refusé');
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      // Transformer les données si nécessaire
      const transformedData = data.map((product: any) => ({
        ...product,
        // Assurez-vous que les images sont présentes
        images: product.images || [],
        // Pour la compatibilité avec l'ancien code
        imageUrl: product.images?.[0]?.url || null,
        category: product.category?.name || null,
        categoryId: product.categoryId || ''
      }));
      setProducts(transformedData);
    } catch (error: any) {
      toast.error(error.message || 'Erreur chargement produits');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      // Trier les catégories : d'abord les racines, puis par ordre alphabétique
      const sortedCategories = data.sort((a: CategoryResponse, b: CategoryResponse) => {
        // Les catégories racines d'abord
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;
        // Puis par ordre alphabétique
        return a.name.localeCompare(b.name);
      });
      setCategories(sortedCategories);
    } catch (error: any) {
      toast.error(error.message || 'Erreur chargement catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!productForm.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }
    if (!productForm.sku.trim()) {
      toast.error('Le SKU du produit est requis');
      return;
    }
    if (productForm.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }
    if (productForm.stock < 0) {
      toast.error('Le stock ne peut pas être négatif');
      return;
    }

    // Générer variants (toutes les combinaisons taille/couleur)
    const sizesArr = productForm.sizes
      ? productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const colorsArr = productForm.colors
      ? productForm.colors.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    let variants: any[] = [];
    if (sizesArr.length && colorsArr.length) {
      variants = sizesArr.flatMap((size) =>
        colorsArr.map((color) => ({
          sizeId: size, // ou size si vous stockez l'ID, sinon adapter ici
          color,
          stock: productForm.stock,
          price: productForm.price,
          sku: `${productForm.sku}-${color}-${size}`,
        }))
      );
    }

    const productData = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: productForm.price,
      stock: productForm.stock,
      sku: productForm.sku.trim(),
      categoryId: productForm.categoryId,
      isActive: productForm.isActive,
      variants,
    };

    console.log('Form submitted with data:', productData);
    console.log('Images files:', productImages.length);

    setLoading(true);
    try {
      if (editingItem) {
        console.log('Updating product:', editingItem.id);
        // Pour l'update, on envoie les nouvelles images
        await updateProduct(editingItem.id, productData, productImages.length > 0 ? productImages : undefined);
        toast.success('Produit mis à jour');
      } else {
        console.log('Creating new product');
        // Pour la création, on envoie toutes les images
        await createProduct(productData, productImages.length > 0 ? productImages : undefined);
        toast.success('Produit créé');
      }
      setViewMode('list');
      setEditingItem(null);
      resetProductForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error creating/updating product:', error);
      toast.error(error.message || 'Erreur sauvegarde produit');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data for submission - remove parentId if empty
      const submitData: any = { ...categoryForm };
      if (!submitData.parentId) {
        delete submitData.parentId;
      }

      if (editingItem) {
        await updateCategory(editingItem.id, submitData);
        toast.success('Catégorie mise à jour');
      } else {
        await createCategory(submitData);
        toast.success('Catégorie créée');
      }
      setViewMode('list');
      setEditingItem(null);
      resetCategoryForm();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Erreur sauvegarde catégorie');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Product | Category) => {
    setEditingItem(item);
    if ('sku' in item) {
      setProductForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        stock: item.stock,
        sku: item.sku,
        categoryId: item.categoryId || '',
        isActive: item.isActive,
        sizes: Array.isArray((item as any).sizes) ? (item as any).sizes.join(', ') : '',
        colors: Array.isArray((item as any).colors) ? (item as any).colors.join(', ') : '',
      });
      // Initialiser les images existantes
      setExistingProductImages(item.images || []);
      setProductImages([]); // Réinitialiser les nouvelles images
      setImagesToDelete([]); // Réinitialiser la liste des images à supprimer
    } else {
      setCategoryForm({
        name: item.name,
        description: item.description || '',
        slug: item.slug || '',
        imageUrl: item.imageUrl || '',
        parentId: (item as CategoryResponse).parentId || '',
        isActive: item.isActive,
      });
    }
    setViewMode('form');
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm('Supprimer cette image ?')) {
      // Ajouter à la liste des images à supprimer
      setImagesToDelete([...imagesToDelete, imageId]);
      // Retirer de la liste des images existantes
      setExistingProductImages(existingProductImages.filter(img => img.id !== imageId));
    }
  };

  const handleDelete = async (id: string, type: 'product' | 'category') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    setLoading(true);
    try {
      if (type === 'product') {
        await deleteProduct(id);
        toast.success('Produit supprimé');
        fetchProducts();
      } else {
        await deleteCategory(id);
        toast.success('Catégorie supprimée');
        fetchCategories();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur suppression');
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      categoryId: '',
      isActive: true,
      sizes: '',
      colors: '',
    });
    setProductImages([]);
    setExistingProductImages([]);
    setImagesToDelete([]);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      slug: '',
      imageUrl: '',
      parentId: '',
      isActive: true,
    });
  };

  // Fonction pour réordonner les images
  const handleReorderImages = (dragIndex: number, hoverIndex: number) => {
    const newImages = [...productImages];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setProductImages(newImages);
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  // Fonction pour obtenir l'URL de l'image principale
  const getPrimaryImageUrl = (product: Product) => {
    const primaryImage = product.images?.find(img => img.isPrimary);
    return primaryImage?.url || product.images?.[0]?.url || null;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar Admin */}
      <aside className="w-72 bg-[#1b2d3d] text-white flex flex-col p-8 fixed h-full left-0 top-0">
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter" style={{ fontFamily: 'Quicksand' }}>Nidolu</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Backoffice v2.0</p>
        </div>
        
        <nav className="flex-grow space-y-2">
          <button 
            onClick={() => { setActiveTab('overview'); setViewMode('list'); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Vue d'ensemble
          </button>
          <button 
            onClick={() => { setActiveTab('products'); setViewMode('list'); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-2-2H5L3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"/><path d="M3 8h18"/><path d="M10 12h4"/></svg>
            Produits
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setViewMode('list'); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-white/10 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
            Catégories
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <button onClick={() => { localStorage.clear(); router.push('/'); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-grow p-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[#1b2d3d] tracking-tight uppercase">
              {activeTab === 'overview' ? 'Dashboard' : activeTab === 'products' ? 'Gestion Produits' : 'Gestion Catégories'}
            </h1>
            <p className="text-slate-400 font-medium">Bienvenue, {user?.firstName || user?.email}</p>
          </div>
          {(activeTab === 'products' || activeTab === 'categories') && viewMode === 'list' && (
            <button 
              onClick={() => setViewMode('form')}
              className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
            >
              + Nouveau {activeTab === 'products' ? 'Produit' : 'Catégorie'}
            </button>
          )}
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Produits</span>
              <p className="text-4xl font-black text-[#1b2d3d]">{products.length}</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Catégories</span>
              <p className="text-4xl font-black text-indigo-600">{categories.length}</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Stock Total</span>
              <p className="text-4xl font-black text-pink-400">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-500">
            {viewMode === 'list' ? (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">Chargement...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Détails</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Prix</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Images</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map(p => {
                        const primaryImageUrl = getPrimaryImageUrl(p);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                                  {primaryImageUrl && <img src={primaryImageUrl} className="w-full h-full object-cover" alt={p.name} />}
                                  {!primaryImageUrl && (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-[#1b2d3d]">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{p.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[11px] font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-lg">
                                {p.category || 'Non catégorisé'}
                              </span>
                            </td>
                            <td className="px-8 py-6 font-black text-sm">{p.price.toFixed(2)} €</td>
                            <td className="px-8 py-6 font-medium text-sm">{p.stock}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center">
                                <span className="text-[11px] font-bold text-slate-600 px-2 py-1 bg-slate-100 rounded">
                                  {p.images?.length || 0} image{p.images?.length !== 1 ? 's' : ''}
                                </span>
                                {p.images && p.images.length > 1 && (
                                  <span className="ml-2 text-xs text-slate-400">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                p.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {p.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(p)} className="p-2 bg-white border border-slate-200 rounded-lg hover:text-indigo-500 hover:border-indigo-200 transition-all">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button onClick={() => handleDelete(p.id, 'product')} className="p-2 bg-white border border-slate-200 rounded-lg hover:text-red-500 hover:border-red-200 transition-all">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12">
                <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Nom</label>
                      <input required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black" 
                        value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Description</label>
                      <textarea rows={4} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black resize-none" 
                        value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Prix</label>
                        <input required type="number" step="0.01" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black"
                          value={productForm.price || ''} onChange={e => {
                            const value = parseFloat(e.target.value);
                            setProductForm({...productForm, price: isNaN(value) ? 0 : value});
                          }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Stock</label>
                        <input required type="number" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black"
                          value={productForm.stock || ''} onChange={e => {
                            const value = parseInt(e.target.value);
                            setProductForm({...productForm, stock: isNaN(value) ? 0 : value});
                          }} />
                      </div>
                    </div>
                    {/* Champs tailles et couleurs */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Tailles (séparées par des virgules)</label>
                        <input className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black"
                          value={productForm.sizes}
                          onChange={e => setProductForm({...productForm, sizes: e.target.value})}
                          placeholder="ex: S, M, L, XL" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Couleurs (séparées par des virgules)</label>
                        <input className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black"
                          value={productForm.colors}
                          onChange={e => setProductForm({...productForm, colors: e.target.value})}
                          placeholder="ex: Rouge, Bleu, Vert" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">SKU</label>
                      <input required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black" 
                        value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                    </div>
                    
                    {/* Section Images - Support Multiple */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                          Images du produit
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                          onChange={e => {
                            const files = Array.from(e.target.files || []);
                            setProductImages([...productImages, ...files]);
                          }}
                        />
                      </div>

                      {/* Aperçu des nouvelles images */}
                      {productImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-slate-600 mb-2">Nouvelles images à uploader:</p>
                          <div className="flex flex-wrap gap-2">
                            {productImages.map((file, index) => (
                              <div key={index} className="relative group">
                                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Preview ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newImages = [...productImages];
                                    newImages.splice(index, 1);
                                    setProductImages(newImages);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Affichage des images existantes (en mode édition) */}
                      {editingItem && existingProductImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-slate-600 mb-2">Images existantes:</p>
                          <div className="flex flex-wrap gap-2">
                            {existingProductImages.map((image) => (
                              <div key={image.id} className="relative group">
                                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={image.url} 
                                    alt={image.alt || 'Product image'}
                                    className="w-full h-full object-cover"
                                  />
                                  {image.isPrimary && (
                                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                      Principale
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Catégorie</label>
                      <select 
                        required
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 appearance-none" 
                        value={productForm.categoryId} 
                        onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.parentName ? `${c.parentName} > ` : ''}{c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="isActive" 
                        checked={productForm.isActive} 
                        onChange={e => setProductForm({...productForm, isActive: e.target.checked})} 
                      />
                      <label htmlFor="isActive" className="text-[12px] text-slate-500 font-medium">Produit actif</label>
                    </div>
                    <div className="flex gap-4 pt-8">
                      <button 
                        type="button" 
                        onClick={() => { 
                          setViewMode('list'); 
                          setEditingItem(null); 
                          resetProductForm(); 
                        }} 
                        className="flex-1 py-4 border border-slate-200 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="flex-[2] py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl disabled:opacity-50"
                      >
                        {loading ? 'Sauvegarde...' : editingItem ? 'Mettre à jour' : 'Créer Produit'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="animate-in fade-in duration-500">
            {viewMode === 'list' ? (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">Chargement...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nom</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Hiérarchie</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Produits</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                                {c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover" alt={c.name} />}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#1b2d3d]">{c.name}</p>
                                {c.description && <p className="text-[10px] text-slate-400">{c.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm">
                              {c.parentName ? (
                                <span className="text-slate-500">{c.parentName} <span className="text-slate-300">&gt;</span> </span>
                              ) : (
                                <span className="text-slate-400 italic">Racine</span>
                              )}
                              <div className="text-[10px] text-slate-400 mt-1">
                                {c.childrenCount} sous-catégorie{c.childrenCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-medium text-sm text-center">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                              {c.productCount}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              c.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {c.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(c)} className="p-2 bg-white border border-slate-200 rounded-lg hover:text-indigo-500 hover:border-indigo-200 transition-all">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => handleDelete(c.id, 'category')} className="p-2 bg-white border border-slate-200 rounded-lg hover:text-red-500 hover:border-red-200 transition-all">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12">
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Nom</label>
                      <input required className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black" 
                        value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Description</label>
                      <textarea rows={4} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black resize-none" 
                        value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Slug</label>
                      <input className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black" 
                        value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Image URL</label>
                      <input className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-black" 
                        value={categoryForm.imageUrl} onChange={e => setCategoryForm({...categoryForm, imageUrl: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Catégorie Parent</label>
                      <select className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 appearance-none" 
                        value={categoryForm.parentId} onChange={e => setCategoryForm({...categoryForm, parentId: e.target.value})}>
                        <option value="">Aucune (catégorie racine)</option>
                        {categories.filter(c => c.id !== (editingItem as Category)?.id).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.parentName ? `${c.parentName} > ` : ''}{c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="catIsActive" checked={categoryForm.isActive} onChange={e => setCategoryForm({...categoryForm, isActive: e.target.checked})} />
                      <label htmlFor="catIsActive" className="text-[12px] text-slate-500 font-medium">Catégorie active</label>
                    </div>
                    <div className="flex gap-4 pt-8">
                      <button type="button" onClick={() => { setViewMode('list'); setEditingItem(null); resetCategoryForm(); }} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all">Annuler</button>
                      <button type="submit" disabled={loading} className="flex-[2] py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl disabled:opacity-50">
                        {loading ? 'Sauvegarde...' : editingItem ? 'Mettre à jour' : 'Créer Catégorie'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
