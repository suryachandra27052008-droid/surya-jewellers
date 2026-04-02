'use client';

import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  Sparkles,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductFormData {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  silverWeight: number;
  mainStoneType: string;
  totalCaratWeight?: number;
  diamondColorClarity?: string;
  description: string;
  inStock: boolean;
  featured: boolean;
}

// Image compression helper
async function compressImage(file: File, maxWidth = 1200, maxQuality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          maxQuality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  const category = watch('category');
  const mainStoneType = watch('mainStoneType');

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
            headers: { 'Authorization': 'Basic ' + btoa('admin:Good@luck123') }
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.product;
          
          reset({
            name: p.name,
            sku: p.sku,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            category: p.category || '',
            silverWeight: p.silverWeight,
            mainStoneType: p.mainStoneType || '',
            totalCaratWeight: p.totalCaratWeight,
            diamondColorClarity: p.diamondColorClarity || '',
            description: p.description || '',
            inStock: p.inStock,
            featured: p.featured,
          });
          setExistingImages(p.images || []);
        } else {
          alert('Product not found');
          router.push('/admin/inventory');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, reset, router]);

  // Image drag-and-drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    addImages(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const totalCurrent = existingImages.length + newImages.length;
    const newImgs = files.slice(0, 5 - totalCurrent).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...newImgs].slice(0, 5 - existingImages.length));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);

    try {
      // For editing, we'll send a JSON PATCH request first for metadata
      // If there are new images, we might need a separate handle or multipart.
      // To keep it simple and consistent with our setup, we'll use PATCH with JSON
      // Note: Updating images in Sanity via PATCH is complex if they are references.
      // For now, let's implement the metadata update. 
      // We'll also send images if any NEW ones are added.
      
      const payload = {
          ...data,
          categoryName: data.category // API expects categoryName to resolve ref
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:Good@luck123'),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/admin/inventory');
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update product');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Updated!</h2>
        <p className="text-sm text-gray-500">Changes saved successfully. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/inventory"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Modify product details for {watch('name')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ==== SECTION: Basic Info ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Title <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                type="text"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                SKU <span className="text-red-400">*</span>
              </label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                type="text"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Retail Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('price', { required: 'Price is required', valueAsNumber: true })}
                type="number"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Compare-at Price (₹)
              </label>
              <input
                {...register('compareAtPrice', { valueAsNumber: true })}
                type="number"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* ==== SECTION: Specifications ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">
              Specifications & Stone Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Silver Weight (grams) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('silverWeight', { required: 'Required', valueAsNumber: true })}
                type="number"
                step="0.1"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Main Stone Type
              </label>
              <select
                {...register('mainStoneType')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              >
                <option value="">None</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ==== SECTION: Images ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
              <ImagePlus className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">
              Product Images
            </h2>
            <span className="text-xs text-blue-500 ml-auto flex items-center gap-1">
                <Info className="w-3 h-3" />
                Editing images coming soon
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {existingImages.map((url, index) => (
                <div key={`exist-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <Image src={url} alt="Product" fill className="object-cover opacity-60" sizes="120px" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <span className="text-[0.6rem] bg-white/90 text-gray-500 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                        Current
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ==== SECTION: Toggles ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('inStock')} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <div>
                <span className="text-sm font-medium text-gray-900">In Stock</span>
                <p className="text-xs text-gray-500">Product is available for purchase</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <div>
                <span className="text-sm font-medium text-gray-900">Featured</span>
                <p className="text-xs text-gray-500">Show on homepage</p>
              </div>
            </label>
          </div>
        </div>

        {/* ==== Actions ==== */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <Link href="/admin/inventory" className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
