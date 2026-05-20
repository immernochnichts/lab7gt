import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { RulerControl } from '@2gis/mapgl-ruler';

interface MapContextState {
    mapglInstance?: mapgl.Map;
    mapgl?: typeof mapgl;
    rulerControl?: RulerControl;
    clusterer?: any;
    clustererMarkers?: any[];
    heatmapLayer?: any;
    source?: any;
}

const MapglContext = createContext<{
    mapgl?: typeof mapgl;
    mapglInstance?: mapgl.Map;
    rulerControl?: RulerControl;
    clusterer?: any;
    clustererMarkers?: any[];
    heatmapLayer?: any;
    source?: any;
    setMapglContext: Dispatch<SetStateAction<MapContextState>>;
}>({
    mapgl: undefined,
    mapglInstance: undefined,
    rulerControl: undefined,
    clusterer: undefined,
    clustererMarkers: undefined,
    heatmapLayer: undefined,
    source: undefined,
    setMapglContext: () => {},
});

export function useMapglContext() {
    return useContext(MapglContext);
}

export function MapglContextProvider({ children }: { children: ReactNode }) {
    const [state, setMapglContext] = useState<MapContextState>({
        mapglInstance: undefined,
        rulerControl: undefined,
        mapgl: undefined,
        clusterer: undefined,
        clustererMarkers: undefined,
        heatmapLayer: undefined,
        source: undefined,
    });
    
    return (
        <MapglContext.Provider value={{ ...state, setMapglContext }}>
            {children}
        </MapglContext.Provider>
    );
}