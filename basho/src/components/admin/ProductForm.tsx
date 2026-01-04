'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  weight: number;
  images: string[];
  material: string;
  care: string;
  category: string; // This will be the category ID
  stock: number;
  isPublished: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  product?: any;
  isEditing?: boolean;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<number, number>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    weight: 0,
    images: [],
    material: '',
    care: '',
    category: '',
    stock: 1,
    isPublished: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || 0,
        weight: product.weight || 0,
        images: Array.isArray(product.images) ? product.images : [],
        material: product.material || '',
        care: product.care || '',
        category: product.category?._id || product.category || '',
        stock: product.stock || 1,
        isPublished: product.isPublished ?? true,
      });
    }
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data); // All categories are now active by default
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if images are still uploading
    if (uploadingImages.size > 0) {
      alert('Please wait for all images to finish uploading before saving.');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/admin/products/${product._id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data && data.error ? data.error : 'Failed to save product';
        setErrorMsg(msg);
        console.error('Failed to save product:', msg);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrorMsg('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        console.warn('Canvas context not available, using original file');
        resolve(file);
        return;
      }

      img.onload = () => {
        try {
          // Calculate new dimensions (max 1200px width/height)
          const maxSize = 1200;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          }, 'image/jpeg', 0.8); // 80% quality
        } catch (error) {
          console.warn('Image compression failed:', error);
          resolve(file); // Fallback to original
        }
      };

      img.onerror = () => {
        console.warn('Image failed to load for compression, using original');
        resolve(file);
      };

      img.src = URL.createObjectURL(file);
    });
  };



  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
    // Also remove from uploading set if it was uploading
    setUploadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleMultipleImageUpload = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name}: Only JPG, PNG, and WebP files are allowed`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name}: File size must be less than 5MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add placeholders for all images
    const startIndex = formData.images.length;
    const newImages = [...formData.images, ...validFiles.map(() => '')];
    setFormData(prev => ({ ...prev, images: newImages }));

    // Upload all images in parallel
    const uploadPromises = validFiles.map(async (file, fileIndex) => {
      const imageIndex = startIndex + fileIndex;
      setUploadingImages(prev => new Set(prev).add(imageIndex));

      try {
        // Compress image before upload if it's large
        let processedFile = file;
        if (file.size > 1024 * 1024) { // If larger than 1MB
          try {
            processedFile = await compressImage(file);
          } catch (error) {
            console.warn('Image compression failed, using original:', error);
          }
        }

        const formDataUpload = new FormData();
        formDataUpload.append('file', processedFile);

        console.log('Starting upload for file:', file.name, 'size:', file.size);
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Upload successful:', data.url);
          setFormData(prev => {
            const currentImages = prev.images || [];
            return {
              ...prev,
              images: currentImages.map((img, i) => i === imageIndex ? data.url : img)
            };
          });
        } else {
          const error = await response.json();
          alert(`Upload failed for ${file.name}: ${error.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      } finally {
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleMultipleImageUpload(files);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const images = [...(prev.images || [])];
      const [movedImage] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, movedImage);
      return { ...prev, images };
    });
  };

  const handleImageAdd = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), '']
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="mt-2 text-slate-600">
          {isEditing ? 'Update product information' : 'Create a new product listing'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  <span className="text-slate-600">Loading categories...</span>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No active categories found. Please create categories first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="e.g., Ceramic, Clay"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Care Instructions
            </label>
            <textarea
              value={formData.care}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, care: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              placeholder="e.g., Hand wash only, avoid microwave"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Product Images</h2>

          {/* Multiple file upload section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Multiple Images
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleMultipleFileChange}
                disabled={uploadingImages.size > 0}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploadingImages.size > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-slate-600">Uploading {uploadingImages.size} image{uploadingImages.size > 1 ? 's' : ''}...</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Select multiple images at once. Images will be uploaded in parallel for faster processing.
            </p>
          </div>

          {/* Individual image management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Manage Images</h3>
            {(formData.images || []).map((image, index) => (
              <div key={index} className="flex gap-4 items-center p-4 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  {image && (
                    <div className="mb-2">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {!image && !uploadingImages.has(index) && (
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400 text-sm">No image</span>
                    </div>
                  )}
                  {uploadingImages.has(index) && (
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center">
                      <svg className="animate-spin w-6 h-6 text-slate-600 mb-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs text-slate-600">Uploading</span>
                    </div>
                  )}
                  {image && !uploadingImages.has(index) && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Image uploaded</p>
                    </div>
                  )}
                </div>

                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleImageReorder(index, Math.max(0, index - 1))}
                    disabled={index === 0 || uploadingImages.size > 0}
                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageReorder(index, Math.min((formData.images || []).length - 1, index + 1))}
                    disabled={index === (formData.images || []).length - 1 || uploadingImages.size > 0}
                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  disabled={uploadingImages.has(index)}
                  className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleImageAdd}
              disabled={uploadingImages.size > 0}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Empty Image Slot
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Publishing Settings</h2>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 text-sm text-slate-700">
              Publish this product (make it visible to customers)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages.size > 0}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {uploadingImages.size > 0
              ? `Uploading ${uploadingImages.size} image${uploadingImages.size > 1 ? 's' : ''}...`
              : loading
                ? 'Saving...'
                : (isEditing ? 'Update Product' : 'Create Product')
            }
          </button>
        </div>
      </form>
    </div>
  );
}