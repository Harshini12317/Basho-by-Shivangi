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
  category: 'ready-made' | 'custom-gallery';
  stock: number;
  isPublished: boolean;
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
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    weight: 0,
    images: [],
    material: '',
    care: '',
    category: 'ready-made',
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
        category: product.category || 'ready-made',
        stock: product.stock || 1,
        isPublished: product.isPublished ?? true,
      });
    }
  }, [product]);

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

  const handleImageUpload = async (index: number, file: File) => {
    // Add loading state for this image
    setUploadingImages(prev => new Set(prev).add(index));

    // Compress image before upload if it's large
    let processedFile = file;
    if (file.size > 1024 * 1024) { // If larger than 1MB
      try {
        processedFile = await compressImage(file);
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
      }
    }

    const formData = new FormData();
    formData.append('file', processedFile);

    try {
      console.log('Starting upload for file:', file.name, 'size:', file.size);
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data.url);
        setFormData(prev => {
          const currentImages = prev.images || [];
          if (index >= currentImages.length) {
            console.warn(`Image upload completed but index ${index} is out of bounds`);
            return prev;
          }
          return {
            ...prev,
            images: currentImages.map((img, i) => i === index ? data.url : img)
          };
        });
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      // Remove loading state for this image
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleImageFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, and WebP files are allowed');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Show file info
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`Uploading ${file.name} (${sizeMB}MB)`);

      handleImageUpload(index, file);
    }
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
              <select
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="ready-made">Ready Made</option>
                <option value="custom-gallery">Custom Gallery</option>
              </select>
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

          <div className="space-y-4">
            {(formData.images || []).map((image, index) => (
              <div key={index} className="flex gap-4 items-center">
                <div className="flex-1">
                  {image && (
                    <div className="mb-2">
                      <p className="text-sm text-slate-600 mb-1">Current Image:</p>
                      <img
                        src={image}
                        alt={`Current ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleImageFileChange(index, e)}
                      disabled={uploadingImages.has(index)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploadingImages.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-slate-600">Uploading...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {image && !uploadingImages.has(index) && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Image ready</p>
                    </div>
                  )}
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
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Add Image
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