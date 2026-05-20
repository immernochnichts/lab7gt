import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from
'geojson';
import geoData from './data/leningradskaia-oblast-filtered.json';

export const MAP_CENTER = [30.360959, 59.931059];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;
        let directions: Directions | undefined = undefined;
        let clusterer: Clusterer | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 13,
                key: '2a469208-3bee-49c1-9528-e52835e98aa6',
                style: '27cf390d-15c6-4561-a580-a3f4a5086136',
            });

            map.on('click', (e) => console.log(e));

            const rulerControl = new RulerControl(map, { position: 'centerRight' });

            clusterer = new Clusterer(map, {
                radius: 60,
                clusterStyle: {
                    labelColor: '#ffffff',
                    labelFontSize: 14,
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Eo_circle_light-blue_blank.svg',
                    size: [40, 40]
                }
            });

            // @ts-ignore
            const markers = [];

            geoData.features.forEach(feature => {
                const coordinates = feature.geometry.coordinates;
                const properties = feature.properties;

                markers.push({
                    coordinates: coordinates,
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Eo_circle_light-blue_blank.svg',
                    size: [15, 15],
                    label: {
                        text: properties.light,
                        color: '#333333',
                        offset: [0, -20],
                        fontSize: 12,
                        relativeAnchor: [0.5, 0.5],
                        interactive: true,
                        minZoom: 12,
                    },
                });
            });

            // @ts-ignore
            clusterer.load(markers);

            const data: FeatureCollection<Geometry, GeoJsonProperties> =
                geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            const source = new mapgl.GeoJsonSource(map, {
                data,
                attributes: {
                    visible: true,
                },
            });

            const layer = {
                id: 'dtp-heatmap-layer',
                source: source,
                filter: [
                    'match',
                    ['sourceAttr', 'visible'],
                    [true],
                    true,
                    false,
                ],
                type: 'heatmap',
                style: {
                color: [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(255, 255, 255, 0)',
                    0.1,
                    'rgba(200, 240, 255, 0.6)',
                    0.3,
                    'rgba(0, 200, 255, 0.8)',
                    0.5,
                    'rgba(0, 120, 255, 1)',
                    0.7,
                    'rgba(0, 50, 200, 1)',
                    0.9,
                    'rgba(0, 20, 120, 1)',
                    1,
                    'rgba(0, 10, 60, 1)'
                ],
                    radius: 20,
                    intensity: 0.8,
                    opacity: 0.8,
                    downscale: 1,
                },
            };

            map.on('styleload', () => {
                map?.addLayer(layer);
            });

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
                clusterer,
                //@ts-ignore
                clustererMarkers: markers,
                heatmapLayer: layer,
                source: source,
            });
        });

        // Destroy the map, if Map component is going to be unmounted
        return () => {
            directions && directions.clear();
            clusterer && clusterer.destroy();
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}
