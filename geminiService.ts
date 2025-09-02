import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedLayout, Site, Zone, Metrics } from '../types';

// Fix: Initialize GoogleGenAI with API_KEY from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const layoutResponseSchema = {
    type: Type.OBJECT,
    properties: {
        buildings: {
            type: Type.ARRAY,
            description: "Array of generated buildings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of building, e.g., 'house', 'apartment_block'." },
                    footprint: {
                        type: Type.ARRAY,
                        description: "An array of {lat, lng} coordinates defining the building's polygonal footprint.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER },
                            }
                        }
                    }
                }
            }
        },
        roads: {
            type: Type.ARRAY,
            description: "Array of generated roads or pathways.",
            items: {
                type: Type.OBJECT,
                properties: {
                    path: {
                        type: Type.ARRAY,
                        description: "An array of {lat, lng} coordinates defining the road's centerline.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER },
                            }
                        }
                    }
                }
            }
        },
        parking: {
             type: Type.ARRAY,
             description: "Array of parking areas.",
             items: {
                type: Type.OBJECT,
                properties: {
                     area: {
                        type: Type.ARRAY,
                        description: "An array of {lat, lng} coords for the parking lot polygon.",
                        items: {
                            type: Type.OBJECT,
                            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
                        }
                    }
                }
            }
        },
        greenSpaces: {
             type: Type.ARRAY,
             description: "Array of green spaces or parks.",
             items: {
                type: Type.OBJECT,
                properties: {
                     area: {
                        type: Type.ARRAY,
                        description: "An array of {lat, lng} coords for the green space polygon.",
                        items: {
                            type: Type.OBJECT,
                            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
                        }
                    }
                }
            }
        }
    }
};

export const generateLayout = async (imageBase64: string, site: Site, zones: Zone[]): Promise<GeneratedLayout> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert UK urban planner and architect. Your task is to generate an optimal, feasible, and compliant development layout.
- Analyze the provided satellite image and site data.
- The site boundary is defined by a polygon. All development must be within this boundary.
- Development zones are provided with types (e.g., Residential, Green Space). Place corresponding features within these zones.
- Create a logical road network connecting the zones.
- Adhere to typical UK planning principles: provide adequate green space, logical road access, and efficient use of land.
- Return the layout as a JSON object matching the provided schema. Footprints and paths must be valid lists of coordinates.`;
    
    const zoneData = zones.map(z => ({ type: z.type, path: z.path, area_sqm: z.area }));
    const siteData = { path: site.path, area_sqm: site.area };

    const prompt = `
        Site Boundary: ${JSON.stringify(siteData.path)}
        Development Zones: ${JSON.stringify(zoneData)}
        
        Please generate a development layout based on these inputs and the satellite image.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                { text: prompt },
            ]
        },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: layoutResponseSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        const layout = JSON.parse(jsonText);
        // Basic validation
        if (layout && layout.buildings && layout.roads) {
            return layout as GeneratedLayout;
        } else {
            throw new Error("Generated JSON is missing required fields.");
        }
    } catch (e) {
        console.error("Failed to parse Gemini response:", jsonText);
        throw new Error("AI failed to generate a valid layout structure.");
    }
};


export const generateReport = async (site: Site, metrics: Metrics, layout: GeneratedLayout): Promise<string> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are a professional property development consultant. Your task is to write a concise, professional feasibility report in Markdown format based on the provided data.
- Start with a clear title.
- Provide a summary of the site and the proposed development.
- Detail the key metrics in a structured way.
- Offer a brief analysis of the scheme's viability and potential.
- Use clear headings and bullet points.`;

    const prompt = `
        Please generate a feasibility report for a development project with the following data:

        # Site Information
        - Site Area: ${(site.area / 10000).toFixed(2)} hectares

        # Proposed Development Metrics
        - Total Dwellings: ${metrics.totalDwellings}
        - Residential Density: ${metrics.density.toFixed(1)} dwellings per hectare (dph)
        - Total Gross Internal Area (GIA): ${Math.round(metrics.gia).toLocaleString()} sqm
        - Green Space Provision: ${metrics.greenSpacePercentage.toFixed(1)}% of site area
        - Parking Spaces Provided: ${metrics.parkingSpaces}

        # Generated Layout Summary
        - Number of Buildings: ${layout.buildings.length}
        - Number of Roads/Paths: ${layout.roads.length}
        - Number of Green Spaces: ${layout.greenSpaces.length}
    `;

     const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
};
