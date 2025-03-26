import { useState, useEffect, useCallback } from 'react';
import { Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Local storage key for saved venues
const SAVED_VENUES_KEY = 'sunSpotter_savedVenues';

interface SavedVenueOptions {
  showToast?: boolean;
  addNote?: string;
}

/**
 * Custom hook to manage saved venues with local storage persistence
 */
export function useSavedVenues() {
  const [savedVenues, setSavedVenues] = useState<Venue[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Load saved venues from localStorage on component mount
  useEffect(() => {
    try {
      const savedVenuesJson = localStorage.getItem(SAVED_VENUES_KEY);
      if (savedVenuesJson) {
        const venues = JSON.parse(savedVenuesJson);
        setSavedVenues(venues);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading saved venues from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);
  
  // Save venues to localStorage whenever the savedVenues state changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(SAVED_VENUES_KEY, JSON.stringify(savedVenues));
      } catch (error) {
        console.error('Error saving venues to localStorage:', error);
      }
    }
  }, [savedVenues, isInitialized]);
  
  /**
   * Add a venue to saved venues
   */
  const saveVenue = useCallback((venue: Venue, options: SavedVenueOptions = {}) => {
    const { showToast = true, addNote } = options;
    
    setSavedVenues(current => {
      // Check if venue already exists
      if (current.some(v => v.id === venue.id)) {
        if (showToast) {
          toast({
            title: "Already saved",
            description: `${venue.name} is already in your saved list`,
            variant: "default",
          });
        }
        return current;
      }
      
      // Add the venue
      if (showToast) {
        toast({
          title: "Location saved",
          description: `${venue.name} has been added to your saved list${addNote ? ` - ${addNote}` : ''}`,
          variant: "default",
        });
      }
      return [...current, venue];
    });
  }, [toast]);
  
  /**
   * Remove a venue from saved venues
   */
  const removeSavedVenue = useCallback((venueId: number, options: SavedVenueOptions = {}) => {
    const { showToast = true } = options;
    
    setSavedVenues(current => {
      const venue = current.find(v => v.id === venueId);
      const newSavedVenues = current.filter(v => v.id !== venueId);
      
      if (venue && showToast) {
        toast({
          title: "Location removed",
          description: `${venue.name} has been removed from your saved list`,
          variant: "default",
        });
      }
      
      return newSavedVenues;
    });
  }, [toast]);
  
  /**
   * Check if a venue is saved
   */
  const isVenueSaved = useCallback((venueId: number): boolean => {
    return savedVenues.some(v => v.id === venueId);
  }, [savedVenues]);
  
  /**
   * Toggle a venue's saved status
   */
  const toggleSavedVenue = useCallback((venue: Venue, options: SavedVenueOptions = {}) => {
    if (isVenueSaved(venue.id)) {
      removeSavedVenue(venue.id, options);
    } else {
      saveVenue(venue, options);
    }
  }, [isVenueSaved, removeSavedVenue, saveVenue]);
  
  /**
   * Get count of saved venues
   */
  const getSavedCount = useCallback((): number => {
    return savedVenues.length;
  }, [savedVenues]);
  
  /**
   * Get recently saved venues
   */
  const getRecentlySaved = useCallback((count: number = 3): Venue[] => {
    return [...savedVenues].reverse().slice(0, count);
  }, [savedVenues]);
  
  /**
   * Clear all saved venues
   */
  const clearAllSaved = useCallback(() => {
    setSavedVenues([]);
    toast({
      title: "All saved locations cleared",
      description: "Your saved locations list has been cleared",
      variant: "default",
    });
  }, [toast]);
  
  return {
    savedVenues,
    saveVenue,
    removeSavedVenue,
    isVenueSaved,
    toggleSavedVenue,
    isInitialized,
    getSavedCount,
    getRecentlySaved,
    clearAllSaved
  };
}