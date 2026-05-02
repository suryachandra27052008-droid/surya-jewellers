'use client';

import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

const ALL_STONES = [
  "Alexander", "Amethist", "Ametrine", "Apppatide", "Aquamarine",
  "B.S DF", "Big Diamond", "Black Opal", "Black Rainbow", "Black Spinel",
  "Blue Opal", "Blue Sapphire", "Blue Topaz", "Cats Eye", "Citrine",
  "Color Opal", "Color Stone", "Coral", "Coral Carbeen", "Coral Flower",
  "Crystal", "Emerald", "Emerald Beads", "Garnet", "Gomed",
  "Green Amethist", "Green Opal", "Green Topaz", "Honey Quartz",
  "Italian Coral", "Japanese Coral", "Kunzait", "Kyanite",
  "Lemon Topaz", "London Topaz", "Lapis Lazuli", "Larimar",
  "Lavender Spinel", "Lemon Quartz", "Multi Sapphire", "Mix Beads",
  "Moon Stone", "Morganite", "Mozambique Heated Ruby", "Munga",
  "Natural Color Diamond", "Natural Blue Sapphire", "Natural Ruby",
  "Navratan", "No Heat Ruby", "Onyx", "Opal", "Peridot", "Pearl",
  "Pink Spinel", "Pink Opal", "Pink Sapphire", "Pink Topaz",
  "Polki Blue", "Purple Sapphire", "Quartz", "Rainbow", "Rhodolite",
  "Rose Cut Diamond", "Rose Quartz", "Ruby", "Ruby Carbeen", "Ruby Lite",
  "S Malachite", "Sapphire", "Spinel", "Star Blue Sapphire", "Star Ruby",
  "Tanzanite", "Tanzanite Carbeen", "Tourmaline", "Tourmaline Carbeen",
  "Tsavorite", "Turquoise", "White Opal", "White Sapphire",
  "Yellow Aquamarine", "Yellow Diamond", "Yellow Labradorite",
  "Yellow Opal", "Yellow Sapphire", "Zachary Turquoise",
];
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
  diamondWeight?: number;
  csWeight?: number;
  grossWeight?: number;
  barcode?: string;
  description: string;
  stockQuantity: number;
  inStock: boolean;
  featured: boolean;
}

function generateSKU(category: string) {
  const prefixes: Record<string, string> = {
    Rings: 'R',
    Necklaces: 'N',
    Earrings: 'E',
    Bracelets: 'B',
    Pendants: 'P',
    Studs: 'ST',
  };
  const prefix = prefixes[category] || 'X';
  const num = String(Math.floor(100 + Math.random() * 900));
  return `SJ-${prefix}-${num}`;
}

// Image compression helper
async function compressImage(file: File, maxWidth = 1200, maxQuality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new NodeImage(); // Using a local name to avoid conflicts if global Image is shadowed
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

// In Next.js/Browser, 'Image' is globally available, but we use an alias to be safe in case of scoping.
const NodeImage = globalThis.Image;

export default function AddProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedStones, setSelectedStones] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      stockQuantity: 1,
      inStock: true,
      featured: false,
      category: '',
      mainStoneType: '',
    },
  });

  const category = watch('category');
  const mainStoneType = watch('mainStoneType');

  // Auto-generate SKU
  const handleAutoSKU = () => {
    if (category) {
      setValue('sku', generateSKU(category));
    } else {
      setValue('sku', `SJ-X-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const toggleStone = (stone: string) => {
    setSelectedStones((prev) =>
      prev.includes(stone) ? prev.filter((s) => s !== stone) : [...prev, stone]
    );
  };

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
    const newImages = files.slice(0, 5 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Form submission
  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);

    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append('allStones', JSON.stringify(selectedStones));
      // Compress and append images
      for (const img of images) {
        if (img.file.size > 1024 * 1024) { // Only compress if over 1MB
            const compressed = await compressImage(img.file);
            formData.append('images', compressed);
        } else {
            formData.append('images', img.file);
        }
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/admin/inventory');
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save product');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Saved!</h2>
        <p className="text-sm text-gray-500">Redirecting to inventory...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Fill in the product details for your jewelry catalog
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
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Title <span className="text-red-400">*</span>
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                type="text"
                placeholder="e.g., Diamond Solitaire Ring"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                SKU <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register('sku', { required: 'SKU is required' })}
                  type="text"
                  placeholder="SJ-R-001"
                  className={`flex-1 px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                    errors.sku ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAutoSKU}
                  className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
                  title="Auto-generate SKU"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.sku && (
                <p className="text-xs text-red-500 mt-1">{errors.sku.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.category ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select category</option>
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
                <option value="Pendants">Pendants</option>
                <option value="Studs">Studs</option>
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Retail Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be positive' },
                })}
                type="number"
                placeholder="24999"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.price ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Compare-at Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Compare-at Price (₹)
                <span className="text-gray-400 ml-1 font-normal">Optional</span>
              </label>
              <input
                {...register('compareAtPrice', { valueAsNumber: true })}
                type="number"
                placeholder="29999"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
            {/* Silver Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Silver Weight (grams) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('silverWeight', {
                  required: 'Silver weight is required',
                  valueAsNumber: true,
                  min: { value: 0.1, message: 'Must be a positive number' },
                })}
                type="number"
                step="0.001"
                placeholder="5.2"
                className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.silverWeight ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.silverWeight && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.silverWeight.message}
                </p>
              )}
            </div>

            {/* Main Stone Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Main Stone Type
              </label>
              <select
                {...register('mainStoneType')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="">None</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Opal">Opal</option>
                <option value="Moonstone">Moonstone</option>
                <option value="Blue Topaz">Blue Topaz</option>
                <option value="Amethyst">Amethyst</option>
                <option value="Black Opal">Black Opal</option>
                <option value="Coloured Opal">Coloured Opal</option>
                <option value="Tourmaline">Tourmaline</option>
                <option value="Yellow Sapphire">Yellow Sapphire</option>
                <option value="Aquamarine">Aquamarine</option>
                <option value="Turquoise">Turquoise</option>
                <option value="Tanzanite">Tanzanite</option>
                <option value="Coral">Coral</option>
                <option value="Morganite">Morganite</option>
                <option value="Peridot">Peridot</option>
                <option value="Tsavorite">Tsavorite</option>
                <option value="Alexandrite">Alexandrite</option>
                <option value="Spinel">Spinel</option>
              </select>
            </div>

            {/* Diamond Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Diamond Weight (ct)</label>
              <input
                {...register('diamondWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.49"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Colored Stone Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Colored Stone Wt (ct)</label>
              <input
                {...register('csWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.7"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Total Carat Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Carat Weight (ct)</label>
              <input
                {...register('totalCaratWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.50"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Gross Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Gross Weight (g)</label>
              <input
                {...register('grossWeight', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Barcode</label>
              <input
                {...register('barcode')}
                type="text"
                placeholder="42337"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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

            {/* Diamond Color & Clarity */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Diamond Color & Clarity
                {mainStoneType !== 'Diamond' && (
                  <span className="text-gray-400 ml-1 font-normal">
                    (Applies to diamonds)
                  </span>
                )}
              </label>
              <input
                {...register('diamondColorClarity')}
                type="text"
                placeholder="G/VS1"
                disabled={mainStoneType !== 'Diamond'}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe the craftsmanship, design, and occasion for this piece..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
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
            <span className="text-xs text-gray-400 ml-auto">
              {images.length}/5 uploaded
            </span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-amber-400 bg-amber-50/50'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload
              className={`w-8 h-8 mx-auto mb-3 ${
                dragActive ? 'text-amber-500' : 'text-gray-300'
              }`}
            />
            <p className="text-sm text-gray-600 font-medium">
              {dragActive ? (
                'Drop images here…'
              ) : (
                <>
                  Drag & drop images here, or{' '}
                  <span className="text-amber-600 underline">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, or WebP up to 10MB each. Max 5 images.
            </p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group"
                >
                  <Image
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[0.6rem] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==== SECTION: Stock Quantity ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">#</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Stock Quantity</h2>
          </div>
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Available Pieces <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register('stockQuantity', { required: true, valueAsNumber: true, min: 1 })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1.5">Maximum quantity a customer can add to cart. Default is 1.</p>
          </div>
        </div>

        {/* ==== SECTION: Toggles ==== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* In Stock toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('inStock')}
                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  In Stock
                </span>
                <p className="text-xs text-gray-500">
                  Product is available for purchase
                </p>
              </div>
            </label>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('featured')}
                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Featured
                </span>
                <p className="text-xs text-gray-500">
                  Show on homepage featured section
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ==== Actions ==== */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <Link
            href="/admin/inventory"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
