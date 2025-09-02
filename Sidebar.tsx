
import React from 'react';
import type { Site, Zone, Metrics } from '../types';
import { ZoneType } from '../types';
import { ZONE_CONFIG } from '../constants';

interface SidebarProps {
    site: Site | null;
    zones: Zone[];
    metrics: Metrics | null;
    onStartDrawing: (type: ZoneType | 'site') => void;
    onDeleteZone: (id: string) => void;
    onGenerateLayout: () => void;
    activeDrawingType: ZoneType | 'site' | null;
}

const InfoRow: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between text-sm py-1 border-b border-gray-200">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value} {unit}</span>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ site, zones, metrics, onStartDrawing, onDeleteZone, onGenerateLayout, activeDrawingType }) => {
    const isDrawing = activeDrawingType !== null;

    return (
        <aside className="w-96 bg-white p-4 shadow-lg overflow-y-auto flex flex-col z-10 border-r border-gray-200">
            <div className="flex-grow">
                {/* Site Section */}
                <div className="mb-6">
                    <h2 className="font-bold text-lg mb-2 text-gray-700">1. Define Site Boundary</h2>
                    {site ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                           <InfoRow label="Site Area" value={(site.area / 10000).toFixed(2)} unit="ha"/>
                        </div>
                    ) : (
                        <button
                            onClick={() => onStartDrawing('site')}
                            disabled={isDrawing}
                            className="w-full px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                        >
                            {activeDrawingType === 'site' ? 'Drawing...' : 'Draw Site Boundary'}
                        </button>
                    )}
                </div>

                {/* Zones Section */}
                <div className="mb-6">
                    <h2 className="font-bold text-lg mb-2 text-gray-700">2. Add Development Zones</h2>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {Object.values(ZoneType).filter(t => t !== ZoneType.Roads).map(type => (
                            <button
                                key={type}
                                onClick={() => onStartDrawing(type)}
                                disabled={isDrawing || !site}
                                className="w-full px-2 py-2 text-sm font-semibold text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                style={{ backgroundColor: isDrawing ? undefined : ZONE_CONFIG[type].color }}
                            >
                                {activeDrawingType === type ? 'Drawing...' : `+ ${type}`}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {zones.map(zone => (
                            <div key={zone.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: ZONE_CONFIG[zone.type].color }}></div>
                                    <span className="text-sm font-medium">{zone.type}</span>
                                </div>
                                <button onClick={() => onDeleteZone(zone.id)} className="text-red-500 hover:text-red-700 text-xs">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Generation Section */}
                <div className="mb-6">
                    <h2 className="font-bold text-lg mb-2 text-gray-700">3. Generate Layout</h2>
                    <button
                        onClick={onGenerateLayout}
                        disabled={!site || zones.length === 0}
                        className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                    >
                        ✨ Generate AI Layout
                    </button>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="flex-shrink-0">
                <h2 className="font-bold text-lg mb-2 text-gray-700 border-t pt-4">Feasibility Metrics</h2>
                {metrics ? (
                    <div className="space-y-2 bg-blue-50 border border-blue-200 p-3 rounded-md">
                        <InfoRow label="Total Dwellings" value={metrics.totalDwellings} />
                        <InfoRow label="Density" value={metrics.density.toFixed(1)} unit="dph"/>
                        <InfoRow label="Total GIA" value={Math.round(metrics.gia).toLocaleString()} unit="sqm"/>
                        <InfoRow label="Green Space" value={metrics.greenSpacePercentage.toFixed(1)} unit="%"/>
                        <InfoRow label="Parking Spaces" value={metrics.parkingSpaces} />
                    </div>
                ) : (
                    <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-md">
                        Generate a layout to see key development metrics.
                    </div>
                )}
            </div>
        </aside>
    );
};
