
import React, { useState } from 'react';
import { Outfit, OutfitOccasion } from '../types';
import { Button } from './Button';
import { editImageWithPrompt } from '../services/geminiService';

interface OutfitCardProps {
  outfit: Outfit;
  onUpdate: (updatedOutfit: Outfit) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onUpdate }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsProcessing(true);
    try {
      const newImageUrl = await editImageWithPrompt(outfit.imageUrl, editPrompt);
      onUpdate({ ...outfit, imageUrl: newImageUrl });
      setEditPrompt('');
      setIsEditing(false);
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Failed to edit the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getOccasionColor = (occasion: OutfitOccasion) => {
    switch (occasion) {
      case OutfitOccasion.CASUAL: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case OutfitOccasion.BUSINESS: return 'bg-blue-50 text-blue-700 border-blue-100';
      case OutfitOccasion.NIGHT_OUT: return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
        <img 
          src={outfit.imageUrl} 
          alt={outfit.occasion} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold border ${getOccasionColor(outfit.occasion)} shadow-sm`}>
          {outfit.occasion}
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-stone-500 text-sm italic mb-4 line-clamp-2">
          {outfit.description}
        </p>

        {!isEditing ? (
          <Button 
            variant="outline" 
            className="w-full text-sm" 
            onClick={() => setIsEditing(true)}
          >
            Magic Edit ✨
          </Button>
        ) : (
          <div className="space-y-3">
            <input 
              type="text"
              placeholder="e.g. 'Add a retro filter' or 'Swap bag for a clutch'"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
            />
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                className="flex-1 text-sm h-10" 
                onClick={handleEdit}
                isLoading={isProcessing}
              >
                Apply
              </Button>
              <Button 
                variant="ghost" 
                className="text-sm h-10" 
                onClick={() => { setIsEditing(false); setEditPrompt(''); }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
