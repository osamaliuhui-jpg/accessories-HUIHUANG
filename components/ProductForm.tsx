import React, { useState, useRef } from 'react';
import { ProductInfo } from '../types';
import { Upload, X, AlertTriangle, Lock, Plus } from 'lucide-react';

interface ProductFormProps {
  info: ProductInfo;
  setInfo: (info: ProductInfo) => void;
  selectedImages: File[];
  setSelectedImages: (files: File[]) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  info,
  setInfo,
  selectedImages,
  setSelectedImages,
  isGenerating,
  onGenerate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      const newFiles = files.filter(file => file.type.startsWith('image/'));
      setSelectedImages([...selectedImages, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      setSelectedImages([...selectedImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfo({ ...info, [name as keyof ProductInfo]: value });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
          Product Info
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Lock size={12} />
          PRODUCT LOCK ACTIVE
        </div>
      </div>

      <div className="space-y-5 flex-grow">
        {/* Image Upload Area */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Reference Images ({selectedImages.length})
          </label>
          
          {selectedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-900">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${index}`} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-600 hover:border-blue-400 hover:bg-slate-700/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Plus className="text-slate-400" size={24} />
                <span className="text-xs text-slate-400 mt-1">Add More</span>
              </div>
            </div>
          ) : (
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out text-center group cursor-pointer
                ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-400 hover:bg-slate-700/50'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="py-2">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-400" size={28} />
                </div>
                <p className="text-slate-200 font-medium">Upload Product Images</p>
                <p className="text-slate-400 text-sm mt-1">Support multiple angles</p>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleChange}
          />
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Material</label>
            <input
              type="text"
              name="material"
              value={info.material}
              onChange={handleInputChange}
              placeholder="e.g. 100% Cotton, Stainless Steel"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</label>
              <input
                type="text"
                name="size"
                value={info.size}
                onChange={handleInputChange}
                placeholder="e.g. 10x10 cm"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</label>
              <input
                type="text"
                name="weight"
                value={info.weight}
                onChange={handleInputChange}
                placeholder="e.g. 500g"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</label>
            <input
              type="text"
              name="price"
              value={info.price}
              onChange={handleInputChange}
              placeholder="e.g. $49.99"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
         <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex items-start gap-3">
            <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-blue-200">
              <strong>Constraint:</strong> Do not change detail. Use ONLY provided images. No redesign. No recolor.
            </p>
         </div>

        <button
          onClick={onGenerate}
          disabled={selectedImages.length === 0 || isGenerating}
          className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${selectedImages.length === 0 || isGenerating 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 active:scale-[0.98]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Assets...
            </>
          ) : (
            'Generate Studio Assets'
          )}
        </button>
      </div>
    </div>
  );
};