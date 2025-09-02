// Fix: Add minimal google.maps type declarations to resolve missing type definition errors
// This is a workaround for the missing @types/google.maps dependency.
declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: any);
        fitBounds(bounds: LatLngBounds | any): void;
        getDiv(): Element;
      }

      class Polygon {
        constructor(opts?: any);
        getPath(): { forEach: (callback: (latLng: any) => void) => void; getArray: () => any[] };
        setMap(map: Map | null): void;
      }
      
      class Polyline {
        constructor(opts?: any);
        setMap(map: Map | null): void;
      }

      namespace geometry {
        namespace spherical {
          function computeArea(path: any, radius?: number): number;
        }
      }

      namespace drawing {
        class DrawingManager {
          constructor(opts?: any);
          setDrawingMode(mode: any | null): void;
          setMap(map: Map | null): void;
          getMap(): Map | null;
        }
        const OverlayType: {
          POLYGON: any;
        };
      }

      namespace event {
        function addListener(instance: object, eventName: string, handler: (...args: any[]) => void): any;
        function addListenerOnce(instance: object, eventName:string, handler: (...args: any[]) => void): any;
        function removeListener(listener: any): void;
      }

      class LatLngBounds {
        constructor(sw?: any, ne?: any);
        extend(point: any): void;
      }
    }
  }
}

export enum ZoneType {
    Residential = 'Residential',
    Apartments = 'Apartments',
    CareHome = 'Care Home',
    Parking = 'Parking',
    GreenSpace = 'Green Space',
    Roads = 'Roads',
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface Zone {
    id: string;
    type: ZoneType;
    polygon: google.maps.Polygon;
    path: LatLng[];
    area: number; // in square meters
}

export interface Site {
    polygon: google.maps.Polygon;
    path: LatLng[];
    area: number; // in square meters
}

export interface Building {
    type: 'house' | 'apartment_block' | 'care_home';
    footprint: LatLng[];
}

export interface Road {
    path: LatLng[];
}

export interface ParkingArea {
    area: LatLng[];
}

export interface GeneratedLayout {
    buildings: Building[];
    roads: Road[];
    parking: ParkingArea[];
    greenSpaces: { area: LatLng[] }[];
}

export interface Metrics {
    totalDwellings: number;
    density: number; // dwellings per hectare
    gia: number; // gross internal area in sqm
    greenSpacePercentage: number;
    parkingSpaces: number;
}