import React, { useState } from 'react';
import { ProductForm } from './components/ProductForm';
import { ResultCard } from './components/ResultCard';
import { ProductInfo, GeneratedImage, TaskType } from './types';
import { generateProductImage } from './services/geminiService';
import { Camera, LayoutGrid, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    material: '',
    size: '',
    weight: '',
    price: '',
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [results, setResults] = useState<GeneratedImage[]>([
    { id: '1', type: TaskType.WHITE_BG, url: null, loading: false, error: null, timestamp: 0 },
    { id: '2', type: TaskType.SIZE_GUIDE, url: null, loading: false, error: null, timestamp: 0 },
    { id: '3', type: TaskType.DETAIL, url: null, loading: false, error: null, timestamp: 0 },
    { id: '4', type: TaskType.WEARING, url: null, loading: false, error: null, timestamp: 0 },
    { id: '5', type: TaskType.LIFESTYLE, url: null, loading: false, error: null, timestamp: 0 },
  ]);

  const [isGlobalGenerating, setIsGlobalGenerating] = useState(false);

  const handleGenerateAll = async () => {
    if (selectedImages.length === 0) return;

    setIsGlobalGenerating(true);
    
    // Set all to loading initially
    setResults(prev => prev.map(r => ({ ...r, loading: true, error: null })));

    // Process tasks sequentially to avoid rate limits
    for (const result of results) {
      try {
        const imageUrl = await generateProductImage(selectedImages, result.type, productInfo);
        
        setResults(prev => prev.map(r => 
          r.id === result.id ? { ...r, url: imageUrl, loading: false, timestamp: Date.now() } : r
        ));
      } catch (error) {
        console.error(`Failed to generate ${result.type}`, error);
        setResults(prev => prev.map(r => 
          r.id === result.id ? { ...r, error: "Generation failed. Rate limit likely exceeded.", loading: false } : r
        ));
      }
      
      // Add a 5-second delay between requests to respect rate limits
      // This combined with the service-level retry logic should robustly handle quotas
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    setIsGlobalGenerating(false);
  };

  const handleRegenerate = async (id: string) => {
    if (selectedImages.length === 0) return;

    const target = results.find(r => r.id === id);
    if (!target) return;

    setResults(prev => prev.map(r => 
      r.id === id ? { ...r, loading: true, error: null } : r
    ));

    try {
      const imageUrl = await generateProductImage(selectedImages, target.type, productInfo);
      setResults(prev => prev.map(r => 
        r.id === id ? { ...r, url: imageUrl, loading: false, timestamp: Date.now() } : r
      ));
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.id === id ? { ...r, error: "Retry failed.", loading: false } : r
      ));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
               <Camera size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              StudioGen AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800">
                Model: Gemini 2.5 Flash
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-3 xl:col-span-3 h-full lg:sticky lg:top-24 max-h-[calc(100vh-8rem)]">
            <ProductForm 
              info={productInfo}
              setInfo={setProductInfo}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              isGenerating={isGlobalGenerating}
              onGenerate={handleGenerateAll}
            />
          </div>

          {/* Right Panel: Gallery */}
          <div className="lg:col-span-9 xl:col-span-9">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                   <LayoutGrid size={24} className="text-blue-500"/>
                   Generated Assets
                </h2>
                {results.some(r => r.url) && (
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    AI Generated Results
                  </span>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((result) => (
                  <div key={result.id} className="min-h-[400px]">
                    <ResultCard 
                      image={result} 
                      onRegenerate={handleRegenerate}
                    />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-auto bg-slate-950">
        <div className="max-w-[1600px] mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} StudioGen AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;