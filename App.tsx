
import React, { useState, useCallback, useRef } from 'react';
import { OutfitOccasion, Outfit, StylistState } from './types';
import { generateOutfitSuggestion } from './services/geminiService';
import { OutfitCard } from './components/OutfitCard';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [state, setState] = useState<StylistState>({
    originalImage: null,
    outfits: [],
    isGenerating: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setState(prev => ({ 
        ...prev, 
        originalImage: base64, 
        outfits: [], 
        error: null,
        isGenerating: true 
      }));

      try {
        const occasions = [OutfitOccasion.CASUAL, OutfitOccasion.BUSINESS, OutfitOccasion.NIGHT_OUT];
        
        // Parallel generation for speed
        const generationPromises = occasions.map(occasion => 
          generateOutfitSuggestion(base64, occasion).then(res => ({
            id: Math.random().toString(36).substr(2, 9),
            occasion,
            imageUrl: res.imageUrl,
            description: res.description
          }))
        );

        const results = await Promise.all(generationPromises);
        setState(prev => ({ ...prev, outfits: results, isGenerating: false }));
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          isGenerating: false, 
          error: "Our stylists are momentarily unavailable. Please try again shortly." 
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpdateOutfit = (updatedOutfit: Outfit) => {
    setState(prev => ({
      ...prev,
      outfits: prev.outfits.map(o => o.id === updatedOutfit.id ? updatedOutfit : o)
    }));
  };

  const reset = () => {
    setState({
      originalImage: null,
      outfits: [],
      isGenerating: false,
      error: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-50 py-4 px-6 flex justify-between items-center border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center">
            <span className="text-white font-serif font-bold text-lg">L</span>
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-stone-900">LUMIÈRE</h1>
        </div>
        {state.originalImage && (
          <Button variant="ghost" onClick={reset} className="text-sm">
            Reset
          </Button>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Intro Section */}
        {!state.originalImage && !state.isGenerating && (
          <div className="text-center py-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="font-serif text-5xl md:text-7xl text-stone-900 leading-tight">
                Unlock your <span className="italic">closet's</span> potential
              </h2>
              <p className="text-lg text-stone-500 font-light">
                Struggling to style a difficult piece? Upload a photo and let our AI-driven stylist curate three distinctive looks for any occasion.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="h-14 px-10 text-lg"
              >
                Upload Your Item
              </Button>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
                Try a patterned skirt, bold blazer, or unique accessory
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://picsum.photos/400/600?random=1" className="rounded-2xl aspect-[3/4] object-cover" alt="style-1" />
              <img src="https://picsum.photos/400/600?random=2" className="rounded-2xl aspect-[3/4] object-cover hidden md:block" alt="style-2" />
              <img src="https://picsum.photos/400/600?random=3" className="rounded-2xl aspect-[3/4] object-cover hidden md:block" alt="style-3" />
              <img src="https://picsum.photos/400/600?random=4" className="rounded-2xl aspect-[3/4] object-cover" alt="style-4" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.isGenerating && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-stone-100 border-t-stone-900 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-stone-100 border-b-stone-400 animate-spin-slow"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl text-stone-900">Curating your collection...</h3>
              <p className="text-stone-500 animate-pulse">Analyzing colors, texture, and silhouettes</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="max-w-md mx-auto py-20 text-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 mb-6">
              {state.error}
            </div>
            <Button variant="outline" onClick={reset}>Try Another Item</Button>
          </div>
        )}

        {/* Results Section */}
        {state.outfits.length > 0 && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row gap-8 items-center border-b border-stone-100 pb-12">
              <div className="w-full md:w-1/3 aspect-square max-w-[300px] relative">
                <div className="absolute inset-0 rounded-3xl bg-stone-100 -rotate-3 transition-transform group-hover:rotate-0"></div>
                <img 
                  src={state.originalImage!} 
                  alt="Original item" 
                  className="relative z-10 w-full h-full object-cover rounded-3xl border-4 border-white shadow-xl"
                />
                <span className="absolute -bottom-4 -right-4 bg-stone-900 text-white text-[10px] uppercase tracking-tighter px-3 py-1 rounded-full z-20">
                  Your Selection
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="font-serif text-4xl text-stone-900">Designed for <span className="italic">You</span></h2>
                <p className="text-stone-500 font-light text-lg">
                  Our stylists have crafted three distinct narratives for your piece. Each flat-lay serves as a complete visual guide for your next occasion.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {state.outfits.map((outfit) => (
                <OutfitCard 
                  key={outfit.id} 
                  outfit={outfit} 
                  onUpdate={handleUpdateOutfit} 
                />
              ))}
            </div>
            
            <div className="pt-20 text-center border-t border-stone-100">
              <p className="text-stone-400 italic font-light mb-8 max-w-lg mx-auto">
                "Fashion is the armor to survive the reality of everyday life."
              </p>
              <Button variant="outline" onClick={reset}>Start Over</Button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-stone-100 bg-white">
        <div className="container mx-auto px-6 text-center text-stone-400 text-sm">
          &copy; {new Date().getFullYear()} Lumière Styling Studio. All rights reserved.
        </div>
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
