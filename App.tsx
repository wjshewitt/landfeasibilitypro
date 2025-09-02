// Fix: Remove `google.maps` type reference to prevent compilation errors.
// The types are provided globally in `types.ts`.
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapComponent } from './components/Map';
import { Header } from './components/Header';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ReportModal } from './components/ReportModal';
import { generateLayout, generateReport } from './services/geminiService';
import { captureMapScreenshot, calculateMetrics } from './services/mapUtils';
import type { Site, Zone, GeneratedLayout, Metrics } from './types';
import { ZoneType } from './types';

// Fix: Add googleMapsApiLoaded to window interface to resolve property does not exist error.
declare global {
    interface Window {
        googleMapsApiLoaded?: boolean;
    }
}

const App: React.FC = () => {
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    const [site, setSite] = useState<Site | null>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [activeDrawingType, setActiveDrawingType] = useState<ZoneType | 'site' | null>(null);
    const [generatedLayout, setGeneratedLayout] = useState<GeneratedLayout | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [report, setReport] = useState<string | null>(null);
    // Fix: Corrected the type for mapInstance state variable.
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (window.googleMapsApiLoaded) {
            setIsApiLoaded(true);
        } else {
            window.addEventListener('google-maps-api-loaded', () => setIsApiLoaded(true));
        }
        return () => {
            window.removeEventListener('google-maps-api-loaded', () => setIsApiLoaded(true));
        };
    }, []);

    const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
        // Fix: Added type assertion for p to resolve lat() and lng() property errors.
        const path = polygon.getPath().getArray().map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
        // Fix: Corrected call to computeArea method.
        const area = google.maps.geometry.spherical.computeArea(polygon.getPath());

        if (activeDrawingType === 'site') {
            setSite({ polygon, path, area });
            setGeneratedLayout(null);
            setMetrics(null);
        } else if (activeDrawingType) {
            const newZone: Zone = {
                id: Date.now().toString(),
                type: activeDrawingType,
                polygon,
                path,
                area,
            };
            setZones(prevZones => [...prevZones, newZone]);
        }
        setActiveDrawingType(null);
    }, [activeDrawingType]);
    
    const handleStartDrawing = (type: ZoneType | 'site') => {
        setActiveDrawingType(type);
    };

    const handleDeleteZone = (zoneId: string) => {
        setZones(prevZones => {
            const zoneToDelete = prevZones.find(z => z.id === zoneId);
            if (zoneToDelete && zoneToDelete.polygon) {
                zoneToDelete.polygon.setMap(null);
            }
            return prevZones.filter(z => z.id !== zoneId);
        });
    };
    
    const handleNewProject = () => {
        site?.polygon.setMap(null);
        zones.forEach(z => z.polygon.setMap(null));
        setSite(null);
        setZones([]);
        setGeneratedLayout(null);
        setMetrics(null);
        setReport(null);
    };

    const handleGenerateLayout = async () => {
        if (!site || !mapInstance) return;
        
        setIsLoading(true);
        setLoadingMessage('Capturing map and analyzing site...');
        
        try {
            const image = await captureMapScreenshot(mapInstance, site.polygon);
            setLoadingMessage('Generating optimal layout with Gemini AI...');

            const layout = await generateLayout(image, site, zones);
            setGeneratedLayout(layout);
            
            setLoadingMessage('Calculating development metrics...');
            const newMetrics = calculateMetrics(site, layout);
            setMetrics(newMetrics);

        } catch (error) {
            console.error("Error generating layout:", error);
            alert("Failed to generate layout. Please check the console for details.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleGenerateReport = async () => {
        if (!site || !generatedLayout || !metrics) {
            alert("Please generate a layout first.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Generating feasibility report...');
        try {
            const markdownReport = await generateReport(site, metrics, generatedLayout);
            setReport(markdownReport);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isApiLoaded) {
        return <LoadingOverlay message="Loading Google Maps API..." />;
    }

    return (
        <div className="flex flex-col h-screen font-sans text-gray-800 bg-gray-50">
            <Header onNewProject={handleNewProject} onGenerateReport={handleGenerateReport} />
            <div className="flex flex-grow overflow-hidden">
                <Sidebar
                    site={site}
                    zones={zones}
                    metrics={metrics}
                    onStartDrawing={handleStartDrawing}
                    onDeleteZone={handleDeleteZone}
                    onGenerateLayout={handleGenerateLayout}
                    activeDrawingType={activeDrawingType}
                />
                <main className="flex-grow h-full">
                    <MapComponent
                        onMapLoad={setMapInstance}
                        onPolygonComplete={handlePolygonComplete}
                        drawingType={activeDrawingType}
                        zones={zones}
                        site={site}
                        generatedLayout={generatedLayout}
                    />
                </main>
            </div>
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            {report && <ReportModal report={report} onClose={() => setReport(null)} />}
        </div>
    );
};

export default App;