import React, { useState } from 'react';
import { GeneratedImage, QCItem } from '../types';
import { RefreshCw, Download, CheckCircle, AlertCircle, Maximize2, Check } from 'lucide-react';

interface ResultCardProps {
  image: GeneratedImage;
  onRegenerate: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ image, onRegenerate }) => {
  const [qcItems, setQcItems] = useState<QCItem[]>([
    { id: '1', label: 'Shape matches', checked: false },
    { id: '2', label: 'Color matches', checked: false },
    { id: '3', label: 'Size accurate', checked: false },
    { id: '4', label: 'Realistic', checked: false },
  ]);

  const toggleQc = (id: string) => {
    setQcItems(qcItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const allPassed = qcItems.every(item => item.checked);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200 text-sm tracking-wide">{image.type}</h3>
        {image.loading && <span className="text-xs text-blue-400 animate-pulse">Generating...</span>}
      </div>

      {/* Image Area */}
      <div className="relative aspect-square bg-slate-950 group">
        {image.loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
             <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
             <span className="text-xs">AI Processing</span>
          </div>
        ) : image.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center">
            <AlertCircle size={32} className="mb-2" />
            <p className="text-xs">{image.error}</p>
          </div>
        ) : image.url ? (
          <>
            <img 
              src={image.url} 
              alt={image.type} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <a 
                href={image.url} 
                download={`studio-gen-${image.type.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-md border border-white/20"
                title="Download"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={() => window.open(image.url!, '_blank')}
                className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-md border border-white/20"
                title="Full View"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
            <span className="text-sm">Waiting for input...</span>
          </div>
        )}
      </div>

      {/* Controls & QC */}
      <div className="p-4 flex flex-col gap-4 flex-grow bg-slate-800">
        {image.url && !image.loading && (
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Quality Control</span>
                {allPassed && <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle size={12}/> PASS</span>}
             </div>
             <div className="grid grid-cols-2 gap-2">
                {qcItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleQc(item.id)}
                    className={`text-[10px] py-1.5 px-2 rounded border flex items-center gap-1.5 transition-colors
                      ${item.checked 
                        ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                        : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'}
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${item.checked ? 'border-green-400 bg-green-400' : 'border-slate-500'}`}>
                       {item.checked && <Check size={8} className="text-slate-900" strokeWidth={4} />}
                    </div>
                    {item.label}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={() => onRegenerate(image.id)}
            disabled={image.loading || !image.url && !image.error} 
            className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${image.loading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
              }
            `}
          >
            <RefreshCw size={14} className={image.loading ? 'animate-spin' : ''} />
            {image.url || image.error ? 'Regenerate' : 'Pending Generation'}
          </button>
        </div>
      </div>
    </div>
  );
};