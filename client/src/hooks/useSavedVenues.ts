import { useState, useEffect } from 'react';
import { Venue } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Local storage key for saved venues
const SAVED_VENUES_KEY = 'sunSpotter_savedVenues';

/**
 * Custom hook to manage saved venues with local storage persistence
 */
export function useSavedVenues() {
  const [savedVenues, setSavedVenues] = useState<Venue[]>([]);
  const { toast } = useToast();
  
  // Load saved venues from localStorage on component mount
  useEffect(() => {
    try {
      const savedVenuesJson = localStorage.getItem(SAVED_VENUES_KEY);
      if (savedVenuesJson) {
        const venues = JSON.parse(savedVenuesJson);
        setSavedVenues(venues);
      }
    } catch (error) {
      console.error('Error loading saved venues from localStorage:', error);
    }
  }, []);
  
  // Save venues to localStorage whenever the savedVenues state changes
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_VENUES_KEY, JSON.stringify(savedVenues));
    } catch (error) {
      console.error('Error saving venues to localStorage:', error);
    }
  }, [savedVenues]);
  
  /**
   * Add a venue to saved venues
   */
  const saveVenue = (venue: Venue) => {
    setSavedVenues(current => {
      // Check if venue already exists
      if (current.some(v => v.id === venue.id)) {
        toast({
          title: "Already saved",
          description: `${venue.name} is already in your saved list`,
          variant: "default",
        });
        return current;
      }
      
      // Add the venue
      toast({
        title: "Location saved",
        description: `${venue.name} has been added to your saved list`,
        variant: "default",
      });
      return [...current, venue];
    });
  };
  
  /**
   * Remove a venue from saved venues
   */
  const removeSavedVenue = (venueId: number) => {
    setSavedVenues(current => {
      const venue = current.find(v => v.id === venueId);
      const newSavedVenues = current.filter(v => v.id !== venueId);
      
      if (venue) {
        toast({
          title: "Location removed",
          description: `${venue.name} has been removed from your saved list`,
          variant: "default",
        });
      }
      
      return newSavedVenues;
    });
  };
  
  /**
   * Check if a venue is saved
   */
  const isVenueSaved = (venueId: number): boolean => {
    return savedVenues.some(v => v.id === venueId);
  };
  
  /**
   * Toggle a venue's saved status
   */
  const toggleSavedVenue = (venue: Venue) => {
    if (isVenueSaved(venue.id)) {
      removeSavedVenue(venue.id);
    } else {
      saveVenue(venue);
    }
  };
  
  return {
    savedVenues,
    saveVenue,
    removeSavedVenue,
    isVenueSaved,
    toggleSavedVenue
  };
}