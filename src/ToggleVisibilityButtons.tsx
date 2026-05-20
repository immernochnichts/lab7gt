import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { useState } from 'react';

export function ToggleClustererButton() {
    const { mapglInstance, clusterer, clustererMarkers, setMapglContext } = useMapglContext();
    const [visible, setVisible] = useState(true);

    const toggle = () => {
        if (!mapglInstance) return;

        if (visible) {
            if (clusterer && !clusterer._isDestroyed) {
                clusterer.destroy();
            }
            setVisible(false);
        } else {
            const newClusterer = new Clusterer(mapglInstance, {
                radius: 60,
                clusterStyle: {
                    labelColor: '#ffffff',
                    labelFontSize: 14,
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Eo_circle_light-blue_blank.svg',
                    size: [40, 40]
                }
            });
            newClusterer.load(clustererMarkers || []);
            setMapglContext(prev => ({ ...prev, clusterer: newClusterer }));
            setVisible(true);
        }
    };

    return <button onClick={toggle}>Toggle Clusterer</button>;
}

const heatmapLayerConfig = {
    id: 'dtp-heatmap-layer',
    filter: ['match', ['sourceAttr', 'visible'], [true], true, false],
    type: 'heatmap',
    style: {
        color: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(255, 255, 255, 0)',
            0.1, 'rgba(200, 240, 255, 0.6)',
            0.3, 'rgba(0, 200, 255, 0.8)',
            0.5, 'rgba(0, 120, 255, 1)',
            0.7, 'rgba(0, 50, 200, 1)',
            0.9, 'rgba(0, 20, 120, 1)',
            1, 'rgba(0, 10, 60, 1)'
        ],
        radius: 20,
        intensity: 0.8,
        opacity: 0.8,
        downscale: 1,
    },
};

export function ToggleHeatmapButton() {
    const { mapglInstance, source } = useMapglContext();
    const [visible, setVisible] = useState(true);

    const toggle = () => {
        console.log('Button clicked');
        console.log('mapglInstance:', mapglInstance);
        console.log('source:', source);
        console.log('visible:', visible);
        
        if (!mapglInstance || !source) {
            console.log('Map or source not ready');
            return;
        }

        if (visible) {
            mapglInstance.removeLayer('dtp-heatmap-layer');
            setVisible(false);
        } else {
            mapglInstance.addLayer({
                ...heatmapLayerConfig,
                source: source,
            });
            setVisible(true);
        }
    };

    return <button onClick={toggle}>Toggle Heatmap</button>;
}