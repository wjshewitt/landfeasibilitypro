// Fix: Remove `google.maps` type reference to prevent compilation errors.
// Type definitions will be provided globally in `types.ts`.

import type { Site, GeneratedLayout, Metrics } from '../types';

/**
 * Captures a screenshot of the current map view focused on the site polygon.
 * @param map - The Google Map instance.
 * @param sitePolygon - The polygon defining the site boundary.
 * @returns A Promise that resolves with a base64 encoded PNG image string.
 */
export const captureMapScreenshot = (map: google.maps.Map, sitePolygon: google.maps.Polygon): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Fit map to the polygon
            // Fix: Correctly instantiate LatLngBounds.
            const bounds = new google.maps.LatLngBounds();
            sitePolygon.getPath().forEach(latLng => bounds.extend(latLng));
            map.fitBounds(bounds);

            // Wait for map to be idle (fully rendered) after fitting bounds
            // Fix: Corrected event listener for map idle event.
            const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
                const mapDiv = map.getDiv();
                if (!mapDiv) {
                    reject(new Error("Map container not found."));
                    return;
                }
                
                // Use html2canvas or a similar library if direct canvas access is blocked.
                // For this example, we assume we can find the canvas.
                const canvas = mapDiv.getElementsByTagName('canvas')[0];
                if (canvas) {
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl.split(',')[1]); // Return only the base64 part
                } else {
                    reject(new Error("Could not find map canvas to capture. This can be due to new map renderers."));
                }
            });

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Calculates key development metrics from a generated layout.
 * @param site - The main site object.
 * @param layout - The AI-generated layout.
 * @returns An object containing the calculated metrics.
 */
export const calculateMetrics = (site: Site, layout: GeneratedLayout): Metrics => {
    const totalDwellings = layout.buildings.length; // Simple assumption: 1 building = 1 dwelling
    const siteHectares = site.area / 10000;
    const density = totalDwellings / siteHectares;

    let gia = 0;
    layout.buildings.forEach(building => {
        // Approximate GIA based on footprint. Assuming 2 floors for a house.
        // Fix: Corrected call to computeArea.
        const footprintArea = google.maps.geometry.spherical.computeArea(building.footprint);
        gia += footprintArea * (building.type === 'house' ? 2 : 5); // Rough multiplier
    });

    let greenSpaceArea = 0;
    layout.greenSpaces.forEach(gs => {
        // Fix: Corrected call to computeArea.
        greenSpaceArea += google.maps.geometry.spherical.computeArea(gs.area);
    });
    const greenSpacePercentage = (greenSpaceArea / site.area) * 100;

    // Dummy value for parking spaces
    const parkingSpaces = Math.floor(totalDwellings * 1.5);

    return {
        totalDwellings,
        density,
        gia,
        greenSpacePercentage,
        parkingSpaces,
    };
};