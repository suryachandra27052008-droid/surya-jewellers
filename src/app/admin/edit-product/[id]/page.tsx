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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ALL_STONES = [
  'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Aquamarine',
  'Amethyst', 'Topaz', 'Coral', 'Turquoise', 'Opal', 'Pearl',
  'Malachite', 'Tanzanite', 'Tsavorite', 'Onyx', 'Quartz',
  'Rose Quartz', 'Citrine', 'Garnet', 'Peridot', 'Spinel',
];

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
  diamondWeight?: number;
  csWeight?: number;
  grossWeight?: number;
  barcode?: string;
  description: string;
  stockQuantity: number;
  inStock: boolean;
  featured: boolean;
}

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
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
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
  const [existingImageRefs, setExistingImageRefs] = useState<{ _key: string; assetId: string }[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedStones, setSelectedStones] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  const mainStoneType = watch('mainStoneType');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          headers: { 'Authorization': 'Basic ' + btoa('admin:Good@luck123') },
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
            diamondWeight: p.diamondWeight,
            csWeight: p.csWeight,
            grossWeight: p.grossWeight,
            barcode: p.barcode || '',
            description: p.description || '',
            stockQuantity: p.stockQuantity ?? 1,
            inStock: p.inStock,
            featured: p.featured,
          });
          setSelectedStones(p.allStones || []);
          setExistingImages(p.images || []);
          setExistingImageRefs(p.imageRefs || []);
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

  const toggleStone = (stone: string) => {
    setSelectedStones((prev) =>
      prev.includes(stone) ? prev.filter((s) => s !== stone) : [...prev, stone]
    );
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    addImages(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(Array.from(e.target.files));
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
    setExistingImageRefs((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'category') {
          formData.append('categoryName', String(value));
        } else {
          formData.append(key, String(value));
        }
      });
      formData.append('allStones', JSON.stringify(selectedStones));
      formData.append('keptImageRefs', JSON.stringify(existingImageRefs));

      for (const img of newImages) {
        const compressed = await compressImage(img.file);
        formData.append('images', compressed);
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Basic ' + btoa('admin:Good@luck123') },
        body: formData,
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => router.push('/admin/inventory'), 1500);
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
        <Link href="/admin/inventory" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modify product details for {watch('name')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Title <span className="text-red-400">*</span></label>
              <input
                {...register('name', { required: 'Product name is required' })}
                type="text"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">SKU <span className="text-red-400">*</span></label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                type="text"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
                <option value="Pendants">Pendants</option>
                <option value="Studs">Studs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Retail Price (₹) <span className="text-red-400">*</span></label>
              <input
                {...register('price', { required: 'Price is required', valueAsNumber: true })}
                type="number"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Compare-at Price (₹)</label>
              <input
                {...register('compareAtPrice', { valueAsNumber: true })}
                type="number"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Specifications & Stone Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Silver Weight (grams) <span className="text-red-400">*</span></label>
              <input
                {...register('silverWeight', { required: 'Required', valueAsNumber: true })}
                type="number"
                step="0.1"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Gross Weight (g)</label>
              <input
                {...register('grossWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Main Stone Type</label>
              <select
                {...register('mainStoneType')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              >
                <option value="">None</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Aquamarine">Aquamarine</option>
                <option value="Amethyst">Amethyst</option>
                <option value="Topaz">Topaz</option>
                <option value="Coral">Coral</option>
                <option value="Turquoise">Turquoise</option>
                <option value="Opal">Opal</option>
                <option value="Pearl">Pearl</option>
                <option value="Tanzanite">Tanzanite</option>
                <option value="Tsavorite">Tsavorite</option>
                <option value="Tourmaline">Tourmaline</option>
                <option value="Peridot">Peridot</option>
                <option value="Spinel">Spinel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Diamond Weight (ct)</label>
              <input
                {...register('diamondWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.49"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Colored Stone Wt (ct)</label>
              <input
                {...register('csWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.7"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Carat Weight (ct)</label>
              <input
                {...register('totalCaratWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.50"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Diamond Color & Clarity</label>
              <input
                {...register('diamondColorClarity')}
                type="text"
                placeholder="G/VS1"
                disabled={mainStoneType !== 'Diamond'}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Barcode</label>
              <input
                {...register('barcode')}
                type="text"
                placeholder="42337"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono placeholder:text-gray-400"
              />
            </div>

            {/* All Stones multi-select */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">All Stones</label>
              <div className="flex flex-wrap gap-2">
                {ALL_STONES.map((stone) => {
                  const active = selectedStones.includes(stone);
                  return (
                    <button
                      key={stone}
                      type="button"
                      onClick={() => toggleStone(stone)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={
                        active
                          ? { backgroundColor: '#c9a84c', borderColor: '#c9a84c', color: '#fff' }
                          : { backgroundColor: 'transparent', borderColor: '#d1d5db', color: '#374151' }
                      }
                    >
                      {stone}
                    </button>
                  );
                })}
              </div>
              {selectedStones.length > 0 && (
                <p className="text-xs text-gray-400 mt-1.5">Selected: {selectedStones.join(', ')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
              <ImagePlus className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Product Images</h2>
            <span className="text-xs text-gray-400 ml-auto">{existingImages.length + newImages.length}/5</span>
          </div>
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Current Images — click × to remove</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {existingImages.map((url, index) => (
                  <div key={`exist-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                    <Image src={url} alt="Product" fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {newImages.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">New Images to Upload</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {newImages.map((img, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50 group">
                    <Image src={img.preview} alt="New" fill className="object-cover" sizes="120px" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {existingImages.length + newImages.length < 5 && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'}`}
              onClick={() => document.getElementById('edit-image-input')?.click()}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Drop images or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 10MB each</p>
              <input id="edit-image-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">#</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Stock Quantity</h2>
          </div>
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Available Pieces <span className="text-red-400">*</span></label>
            <input
              type="number"
              min={1}
              {...register('stockQuantity', { required: true, valueAsNumber: true, min: 1 })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1.5">Maximum quantity a customer can add to cart.</p>
          </div>
        </div>

        {/* Toggles */}
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

        {/* Actions */}
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
