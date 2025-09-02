import { ZoneType } from './types';

export const UK_CENTER = { lat: 54.00366, lng: -2.547855 };
export const MAP_ZOOM_DEFAULT = 6;
export const MAP_ZOOM_SITE = 18;

type ZoneConfig = {
    [key in ZoneType]: {
        color: string;
        name: string;
    };
};

export const ZONE_CONFIG: ZoneConfig = {
    // Fix: Changed 'import type' to 'import' for ZoneType as it is used as a value here.
    [ZoneType.Residential]: { color: '#4299E1', name: 'Residential' }, // Blue
    [ZoneType.Apartments]: { color: '#9F7AEA', name: 'Apartments' },   // Purple
    [ZoneType.CareHome]: { color: '#ED64A6', name: 'Care Home' },      // Pink
    [ZoneType.Parking]: { color: '#A0AEC0', name: 'Parking' },          // Gray
    [ZoneType.GreenSpace]: { color: '#48BB78', name: 'Green Space' },  // Green
    [ZoneType.Roads]: { color: '#718096', name: 'Roads' }, // Slate
};

export const SITE_POLYGON_OPTIONS = {
    strokeColor: "#F56565", // Red
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#F56565",
    fillOpacity: 0.2,
    editable: true,
    draggable: true,
};

export const ZONE_POLYGON_OPTIONS = (type: ZoneType) => ({
    strokeColor: ZONE_CONFIG[type].color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: ZONE_CONFIG[type].color,
    fillOpacity: 0.35,
    editable: true,
    draggable: true,
});
