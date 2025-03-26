**Objective:** Generate frontend code for a mobile application called "SunSpotter". The app helps users find venues (restaurants, cafes, parks, bars) based on current or upcoming sun exposure (or shade). Improve upon the provided initial mockups by incorporating UI/UX best practices inspired by Apple (simplicity, clarity, polish), Uber (efficiency, task-focus), and Airbnb (discovery, trust, visual appeal). The app needs both a "Sun Finding" mode (Light Theme) and a "Shade Finding" mode (Dark Theme).

**Target Platform:** [Specify: e.g., React Native for cross-platform, SwiftUI for iOS, Jetpack Compose for Android]

**Core Features to Implement/Refine:**

1.  **Global Elements:**
    *   **Top Bar:** App name ("SunSpotter"), dynamic location selector (e.g., "Göteborg, Sweden"), current weather/temp (e.g., ☀️ 10°), current date. Ensure clean typography and spacing (Apple style).
    *   **Bottom Navigation:** Tabs for "Explore" (Sun icon), "Saved" (Bookmark icon), "Settings" (Gear icon). Use clear visual indicators for the active tab (like Apple's HIG).

2.  **Explore Screen (Default View):**
    *   **Search Bar:** Prominent search bar ("Search venues...") with rounded corners and a subtle shadow. Include a distinct Filter icon (funnel shape) on the right.
    *   **Category Filters:** Horizontal scrolling list of categories (All, Restaurants, Cafés, Bars, Parks). Use clear icons and labels. The selected category should have a strong visual indicator (e.g., filled background matching the button shape, not just color change).
    *   **Quick Filters:** Buttons/Toggles below categories for "☀️ Sunny Now" and "♨️ With Heaters". Make "Sunny Now" visually prominent or potentially a default toggle. Ensure clear selected/unselected states. (In Shade Mode, this becomes "☁️ Shady Now").
    *   **View Toggle:** Segmented control or distinct tabs for "Map" and "List" views. Default to Map view.

3.  **Explore Screen - Map View:**
    *   **Map Display:** Use a clean map style (e.g., Mapbox, Google Maps). Default zoom centered on the user's location or selected city.
    *   **Map Pins:**
        *   Clearly display a **Sun Potential Rating** (e.g., ☀️ 3.0) - make it clear this relates to sun, not overall quality.
        *   Consider showing the venue type icon within the pin.
        *   Pins for venues matching "Sunny Now" (or "Shady Now") could have a subtle visual enhancement (e.g., glow, slightly larger).
        *   Tapping a pin should show a small summary card/callout with Venue Name, Sun Rating, and maybe distance, leading to the full Venue Detail screen.
    *   **Map Controls:** Include standard zoom (+/-) and a "Recenter / My Location" button (use standard target/GPS icon). Remove the generic "+" FAB. Add a Refresh button if data needs manual updates, otherwise rely on automatic updates.
    *   **Bottom Sheet (Summary):** When multiple pins are visible, show a draggable bottom sheet indicating "X venues found" with a prompt like "Tap a pin or switch to List view".

4.  **Explore Screen - List View (Mobile):**
    *   **List Items:** Each item should be a card with:
        *   **Thumbnail Image:** Prominent venue photo (Airbnb style). Use a placeholder if no image exists.
        *   **Venue Name:** Clear, large font.
        *   **Venue Type & Distance:** e.g., "Restaurant • 650m away". Use friendly distance wording.
        *   **Sun/Shade Status Tags:** Replace vague "Later" tags. Use specific, icon+text tags like: "☀️ Sunny Now", "☀️ Sunny 12:00-17:00", "☁️ Shady until 14:00", "☁️ All Day Shade".
        *   **Sun Potential Rating:** Display clearly (e.g., ☀️ 3.0).
        *   **(Optional) Overall Rating:** If available, show (e.g., ⭐ 4.2).
        *   **(Optional) Heater Tag:** "♨️ Has Heaters".
    *   **Scrolling:** Smooth infinite scroll if many results.
    *   **FABs:** Remove generic "+". Keep "Recenter" if relevant to list sorting (e.g., by distance), otherwise remove.

5.  **Venue Detail Screen:**
    *   **Header:** Large hero image of the venue. Back button, Bookmark/Save icon (ensure state updates on tap).
    *   **Primary Info:** Venue Name, Type, Location. Display Sun Potential Rating (☀️ 3.0) prominently.
    *   **Action Buttons:** "Get Directions" (primary, filled button, map icon) and "Save" (secondary, perhaps outlined or icon-only, matches header bookmark). Ensure visual balance (Apple style).
    *   **Tabs/Sections (Organize Info Clearly):**
        *   **Overview:** Should contain the core Sun/Shade info.
        *   **☀️ Sun/☁️ Shade Exposure:**
            *   Current Status: "Sunny right now!" or "Shady right now!".
            *   Detailed Hours: "Sun Hours: 12:00 - 17:00" (or "Shade Hours: 10:00 - 15:00"). **Visualize this** with a simple timeline graphic (bar or arc).
            *   Descriptive text (attributed if user-generated).
            *   Heater info: "♨️ Outdoor heaters available" / "❄️ No outdoor heating".
        *   **Details & Amenities:** Use clear icons and specific labels (e.g., "Crowds: Moderate", "Good for: Groups", "Price: $$"). Avoid vague terms like "Recommended".
        *   **🕒 Opening Hours:** Clear display of daily hours, show "Open Now" or "Closed Now" status.
        *   **⭐ Reviews:** Section for user reviews (if applicable).
        *   **Contact Information:** Phone, website.

6.  **Saved Locations Screen:**
    *   **Empty State:** Keep the existing clean design: Icon, "No saved locations" title, descriptive text, and clear "Explore Locations" CTA button. Maybe add a subtle background illustration.
    *   **Populated State:** Display saved locations using the same List Item component from the Explore List View for consistency. Allow searching/filtering saved locations.

7.  **Shade Mode (Dark Theme):**
    *   **Activation:** Implement a toggle in Settings: "Appearance: [Light (Sun Focus)] / [Dark (Shade Focus)]". Consider an optional quick toggle on the Explore screen (Sun/Moon icon).
    *   **Visuals:** Apply a polished dark theme (dark grey/black backgrounds, light text, following platform HIGs). Adjust accent colors (e.g., the orange) for good contrast if needed, or introduce a cool accent color. Use a dark map style.
    *   **Logic & Wording:**
        *   Flip the core goal: The app should now prioritize and highlight *shady* spots.
        *   Quick Filter: "☀️ Sunny Now" becomes "☁️ Shady Now".
        *   Ratings: Decide how to handle the Sun Rating. Either introduce a "☁️ Shade Rating" or clearly explain that in Shade Mode, a *lower* Sun Rating might be preferable (or reinterpret it).
        *   Labels: Change titles and tags contextually (e.g., "Shady Places Nearby", "Shade Exposure", "☁️ Shady 10:00-15:00").
        *   Icons: Replace sun icons with appropriate shade/cloud/umbrella icons where relevant in this mode.

**Code Requirements:**

*   Use functional components [if applicable to the framework].
*   Implement basic state management for filters, saved locations, theme mode.
*   Structure code into reusable components (e.g., `VenueListItem`, `CategoryFilterButton`, `RatingDisplay`).
*   Add comments explaining the implementation of specific UI/UX improvements requested.
*   Ensure responsiveness if applicable [e.g., for web or tablet layouts].

Please generate the code structure and key components based on these refinements.