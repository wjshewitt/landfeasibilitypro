// Fix: Remove `google.maps` type reference to prevent compilation errors.
// Type definitions will be provided globally in `types.ts`.

import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { UK_CENTER, MAP_ZOOM_DEFAULT, SITE_POLYGON_OPTIONS, ZONE_POLYGON_OPTIONS } from '../constants';
import type { Site, Zone, ZoneType, GeneratedLayout } from '../types';

interface MapComponentProps {
    onMapLoad: (map: google.maps.Map) => void;
    onPolygonComplete: (polygon: google.maps.Polygon) => void;
    drawingType: ZoneType | 'site' | null;
    zones: Zone[];
    site: Site | null;
    generatedLayout: GeneratedLayout | null;
}

/**
 * A controller component that manages map state and effects.
 * It must be rendered as a child of the <Map> component.
 */
const MapController: React.FC<MapComponentProps> = ({
    onMapLoad,
    onPolygonComplete,
    drawingType,
    site,
    generatedLayout
}) => {
    const map = useMap();
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const generatedPolygonsRef = useRef<google.maps.Polygon[]>([]);
    const generatedPolylinesRef = useRef<google.maps.Polyline[]>([]);
    
    // Pass map instance up to the App component
    useEffect(() => {
        if (map) {
            onMapLoad(map);
        }
    }, [map, onMapLoad]);

    // Clear generated layout when site changes
    useEffect(() => {
        return () => {
            generatedPolygonsRef.current.forEach(p => p.setMap(null));
            generatedPolylinesRef.current.forEach(l => l.setMap(null));
            generatedPolygonsRef.current = [];
            generatedPolylinesRef.current = [];
        };
    }, [site]);

    // Initialize or update the drawing manager
    useEffect(() => {
        if (!map) return;

        // Fix: Corrected instantiation of DrawingManager
        const dm = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: false,
            polygonOptions: drawingType === 'site' ? SITE_POLYGON_OPTIONS : (drawingType ? ZONE_POLYGON_OPTIONS(drawingType) : {}),
        });

        // Fix: Corrected event listener for polygon completion
        const listener = google.maps.event.addListener(dm, 'polygoncomplete', (polygon: google.maps.Polygon) => {
            onPolygonComplete(polygon);
            dm.setDrawingMode(null);
        });
        
        setDrawingManager(dm);

        return () => {
            // Fix: Corrected call to remove the event listener
            google.maps.event.removeListener(listener);
            dm.setMap(null);
        };
    }, [map, onPolygonComplete, drawingType]);
    
    // Control drawing mode
    useEffect(() => {
        if (drawingManager && map) {
            if (drawingType) {
                drawingManager.setMap(map);
                // Fix: Correctly set the drawing mode on the drawing manager.
                drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            } else if (drawingManager.getMap()) {
                drawingManager.setDrawingMode(null);
                drawingManager.setMap(null);
            }
        }
    }, [drawingManager, drawingType, map]);

    // Center map on site
    useEffect(() => {
        if (map && site) {
            // Fix: Correctly instantiate LatLngBounds.
            const bounds = new google.maps.LatLngBounds();
            site.path.forEach(p => bounds.extend(p));
            map.fitBounds(bounds);
        }
    }, [map, site]);

    // Render generated layout
    useEffect(() => {
        if(map && generatedLayout) {
            // Clear previous layout
            generatedPolygonsRef.current.forEach(p => p.setMap(null));
            generatedPolylinesRef.current.forEach(l => l.setMap(null));
            generatedPolygonsRef.current = [];
            generatedPolylinesRef.current = [];

            // Render buildings
            generatedLayout.buildings.forEach(b => {
                // Fix: Correctly instantiate Polygon for rendering buildings.
                const polygon = new google.maps.Polygon({
                    paths: b.footprint,
                    strokeColor: '#A0AEC0',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: '#4A5568',
                    fillOpacity: 0.75,
                });
                polygon.setMap(map);
                generatedPolygonsRef.current.push(polygon);
            });
            // Render roads
            generatedLayout.roads.forEach(r => {
                // Fix: Correctly instantiate Polyline for rendering roads.
                const polyline = new google.maps.Polyline({
                    path: r.path,
                    strokeColor: '#2D3748',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                });
                polyline.setMap(map);
                generatedPolylinesRef.current.push(polyline);
            });
            // Render green spaces
            generatedLayout.greenSpaces.forEach(gs => {
                // Fix: Correctly instantiate Polygon for rendering green spaces.
                 const polygon = new google.maps.Polygon({
                    paths: gs.area,
                    strokeColor: '#38A169',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    fillColor: '#48BB78',
                    fillOpacity: 0.5,
                });
                polygon.setMap(map);
                generatedPolygonsRef.current.push(polygon);
            });
        }
    }, [map, generatedLayout]);

    return null; // This component only manages map effects
};

export const MapComponent: React.FC<MapComponentProps> = (props) => {
    return (
        <APIProvider apiKey={'AIzaSyBEG0abvSCaKFj5QZA1vpQYUxIOwgnGceA'}>
            <Map
                defaultCenter={UK_CENTER}
                defaultZoom={MAP_ZOOM_DEFAULT}
                mapId={'e1f5e8f9c5e5429'}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                className="w-full h-full"
            >
                <MapController {...props} />
            </Map>
        </APIProvider>
    );
};