//web/src/lib/api.ts

export const API_BASE_URL = 'http://localhost:3001/api/v1';

// ==================== AUTH FUNCTIONS ====================
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Login failed';
    throw new Error(message);
  }
  return response.json();
};

export const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Register failed';
    throw new Error(message);
  }
  return response.json();
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    throw new Error('Refresh failed');
  }
  return response.json();
};

export const getMe = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No token');
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Get me failed');
  }
  return response.json();
};

// ==================== PRODUCT FUNCTIONS ====================
export const getProducts = async (query = '') => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/products${query}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get products failed');
  }
  const result = await response.json();
  return result.data || [];
};

export const getProductById = async (id: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get product failed');
  }
  return response.json();
};

export const createProduct = async (data: any, imageFiles?: File[] | File) => {
  const token = localStorage.getItem('accessToken');
  console.log('🔧 API createProduct called with:', { 
    data, 
    hasImages: !!imageFiles,
    imageCount: Array.isArray(imageFiles) ? imageFiles.length : (imageFiles ? 1 : 0),
    token: !!token 
  });

  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const formData = new FormData();
  
  // Ajouter toutes les propriétés de l'objet data
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      // Sérialiser les tableaux (variants) en JSON pour l'API
      if (key === 'variants' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
        console.log(`📝 Added to formData - ${key}:`, JSON.stringify(data[key]));
      } else {
        const value = typeof data[key] === 'boolean' 
          ? data[key].toString() 
          : data[key].toString();
        formData.append(key, value);
        console.log(`📝 Added to formData - ${key}:`, value);
      }
    }
  });
  
  // Ajouter les fichiers images s'ils existent
  if (imageFiles) {
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
        console.log(`🖼️ Added image file ${index + 1} to formData:`, file.name, `(${file.size} bytes)`);
      });
    } else {
      formData.append('images', imageFiles);
      console.log('🖼️ Added single image file to formData:', imageFiles.name, `(${imageFiles.size} bytes)`);
    }
  }

  // Debug: Afficher le contenu de FormData
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 FormData content:');
    for (let pair of (formData as any).entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File - ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
      } else {
        console.log(`${pair[0]}:`, pair[1]);
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('📡 API Response:', response.status, response.statusText);
  
  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      error = JSON.parse(errorText);
    } catch (parseError) {
      console.error('❌ Failed to parse error response:', parseError);
      error = { message: 'Unknown server error. Please check your network connection.' };
    }
    
    const message = Array.isArray(error.message) 
      ? error.message.join(', ') 
      : error.message || 'Create product failed';
    throw new Error(message);
  }

  const result = await response.json();
  console.log('✅ API success response:', result);
  return result;
};

export const updateProduct = async (id: string, data: any, imageFiles?: File[] | File) => {
  const token = localStorage.getItem('accessToken');
  
  console.log('🔧 API updateProduct called with:', { 
    id, 
    data, 
    hasImages: !!imageFiles,
    imageCount: Array.isArray(imageFiles) ? imageFiles.length : (imageFiles ? 1 : 0),
    token: !!token 
  });

  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const formData = new FormData();
  
  // Ajouter toutes les propriétés de l'objet data
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      // Sérialiser les tableaux (sizes, colors) en JSON pour l'API
      if ((key === 'sizes' || key === 'colors') && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        const value = typeof data[key] === 'boolean' 
          ? data[key].toString() 
          : data[key].toString();
        formData.append(key, value);
      }
    }
  });
  
  // Ajouter les fichiers images s'ils existent
  if (imageFiles) {
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    } else {
      formData.append('images', imageFiles);
    }
  }

  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('📡 Update API Response:', response.status, response.statusText);
  
  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      console.error('❌ Update API error:', errorText);
      error = JSON.parse(errorText);
    } catch (parseError) {
      console.error('❌ Failed to parse error response:', parseError);
      error = { message: 'Unknown server error' };
    }
    
    const message = Array.isArray(error.message) 
      ? error.message.join(', ') 
      : error.message || 'Update product failed';
    throw new Error(message);
  }

  return response.json();
};

export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete product failed');
  }
  
  return response.json();
};

// ==================== PRODUCT IMAGES FUNCTIONS ====================
export const getProductImages = async (productId: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get product images failed');
  }
  const result = await response.json();
  return result.data || [];
};

export const addProductImages = async (productId: string, imageFiles: File[] | File) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const formData = new FormData();
  
  if (Array.isArray(imageFiles)) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
  } else {
    formData.append('images', imageFiles);
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Add images failed');
  }

  return response.json();
};

export const updateProductImage = async (productId: string, imageId: string, imageFile: File) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Update image failed');
  }

  return response.json();
};

export const deleteProductImage = async (productId: string, imageId: string) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete image failed');
  }

  return response.json();
};

export const reorderProductImages = async (productId: string, imageIds: string[]) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}/images/reorder`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Reorder images failed');
  }

  return response.json();
};

// ==================== CATEGORY FUNCTIONS ====================
export const getCategories = async (query = '') => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/categories${query}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get categories failed');
  }
  const result = await response.json();
  return result.data || [];
};

export const getCategoryById = async (id: string) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get category failed');
  }
  return response.json();
};

export const createCategory = async (data: any) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Create category failed';
    throw new Error(message);
  }
  
  return response.json();
};

export const updateCategory = async (id: string, data: any) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Update category failed';
    throw new Error(message);
  }
  
  return response.json();
};

export const deleteCategory = async (id: string) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete category failed');
  }
  
  return response.json();
};

// ==================== UTILITY FUNCTIONS ====================
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export const uploadToCloudinary = async (file: File, folder = 'products') => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/upload/cloudinary`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload to Cloudinary failed');
  }

  return response.json();
};

export const batchUploadImages = async (files: File[], productId?: string) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  if (productId) {
    formData.append('productId', productId);
  }

  const response = await fetch(`${API_BASE_URL}/upload/batch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Batch upload failed');
  }

  return response.json();
};

// ==================== HELPER FUNCTIONS ====================
export const createProductWithImages = async (productData: any, imageFiles: File[]) => {
  console.log('🚀 Creating product with images step by step...');
  
  const product = await createProduct(productData);
  console.log('✅ Product created:', product);
  
  if (imageFiles && imageFiles.length > 0) {
    console.log(`📸 Adding ${imageFiles.length} images to product...`);
    const updatedProduct = await addProductImages(product.id, imageFiles);
    console.log('✅ Images added:', updatedProduct);
    return updatedProduct;
  }
  
  return product;
};

export const updateProductWithImages = async (
  productId: string, 
  productData: any, 
  newImages: File[], 
  imagesToDelete: string[] = []
) => {
  console.log('🔄 Updating product with images...');
  
  if (imagesToDelete.length > 0) {
    console.log(`🗑️ Deleting ${imagesToDelete.length} marked images...`);
    for (const imageId of imagesToDelete) {
      try {
        await deleteProductImage(productId, imageId);
        console.log(`✅ Image ${imageId} deleted`);
      } catch (error) {
        console.error(`❌ Failed to delete image ${imageId}:`, error);
      }
    }
  }
  
  const updatedProduct = await updateProduct(productId, productData);
  console.log('✅ Product data updated:', updatedProduct);
  
  if (newImages && newImages.length > 0) {
    console.log(`📸 Adding ${newImages.length} new images...`);
    const productWithImages = await addProductImages(productId, newImages);
    console.log('✅ New images added:', productWithImages);
    return productWithImages;
  }
  
  return updatedProduct;
};

// ==================== TOKEN MANAGEMENT ====================
export const getToken = () => localStorage.getItem('accessToken');
export const setToken = (token: string) => localStorage.setItem('accessToken', token);
export const removeToken = () => localStorage.removeItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setRefreshToken = (token: string) => localStorage.setItem('refreshToken', token);
export const removeRefreshToken = () => localStorage.removeItem('refreshToken');

// ==================== ERROR HANDLER ====================
const handleApiError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      error = JSON.parse(errorText);
    } catch {
      error = { message: defaultMessage };
    }
    
    const message = Array.isArray(error.message) 
      ? error.message.join(', ') 
      : error.message || defaultMessage;
    throw new Error(message);
  }
  return response.json();
};

// ==================== API STATUS ====================
export const checkApiStatus = async () => {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/products?limit=1`),
      fetch(`${API_BASE_URL}/categories?limit=1`)
    ]);
    
    return {
      products: productsResponse.ok,
      categories: categoriesResponse.ok,
      overall: productsResponse.ok && categoriesResponse.ok
    };
  } catch (error) {
    return {
      products: false,
      categories: false,
      overall: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// ==================== WISHLIST FUNCTIONS ====================
export const getWishlist = async () => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch wishlist');
  }
  return res.json();
};

export const toggleWishlistApi = async (productId: string) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to toggle wishlist');
  }
  return res.json(); // renvoie {liked: boolean}
};

export const removeFromWishlistApi = async (productId: string) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to remove from wishlist');
  }
  return res.json();
};

// Nouvelle fonction pour synchroniser la wishlist
export const syncWishlist = async (productIds: string[]) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE_URL}/wishlist/sync`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to sync wishlist');
  }
  return res.json();
};

// ==================== CART FUNCTIONS ====================
export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: { url: string; alt: string }[];
    image?: string;
    stock: number;
    isActive: boolean;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  id: string;
  userId: string;
  cartItems: CartItemResponse[];
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

// Get cart
export const getCart = async (): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Get cart failed');
  }

  return response.json();
};

// Add item to cart
export const addToCartApi = async (data: AddToCartDto): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Add to cart failed');
  }

  return response.json();
};

// Update cart item
export const updateCartItemApi = async (cartItemId: string, data: UpdateCartItemDto): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Update cart item failed');
  }

  return response.json();
};

// Remove item from cart
export const removeFromCartApi = async (cartItemId: string): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Remove from cart failed');
  }

  return response.json();
};

// Clear cart
export const clearCartApi = async (): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Clear cart failed');
  }

  return response.json();
};

// Merge guest cart
export const mergeCartApi = async (items: Array<{ productId: string; quantity: number }>): Promise<CartResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/cart/merge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Merge cart failed');
  }

  return response.json();
};



// ==================== EXPORT ALL ====================
export default {
  // Auth
  login,
  register,
  logout,
  refreshToken,
  getMe,
  
  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Product Images
  getProductImages,
  addProductImages,
  updateProductImage,
  deleteProductImage,
  reorderProductImages,
  
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Utilities
  testApiConnection,
  uploadToCloudinary,
  batchUploadImages,
  
  // Helpers
  createProductWithImages,
  updateProductWithImages,
  
  // Token Management
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  
  // API Status
  checkApiStatus
};