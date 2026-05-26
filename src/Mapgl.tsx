import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useMapglContext } from './MapglContext';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';

import {
    Feature,
    FeatureCollection,
    Geometry,
    GeoJsonProperties,
    Polygon,
    MultiPolygon,
} from 'geojson';

import * as turf from '@turf/turf';

import geoData from './data/leningradskaia-oblast-filtered.json';

export const MAP_CENTER = [30.360959, 59.931059];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined;
        let directions: Directions | undefined;
        let clusterer: Clusterer | undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 13,
                key: '2a469208-3bee-49c1-9528-e52835e98aa6',
                style: '27cf390d-15c6-4561-a580-a3f4a5086136',
            });

            map.on('click', (e) => console.log(e));

            const rulerControl = new RulerControl(map, {
                position: 'centerRight',
            });

            clusterer = new Clusterer(map, {
                radius: 60,
                clusterStyle: {
                    labelColor: '#ffffff',
                    labelFontSize: 14,
                    icon:
                        'https://upload.wikimedia.org/wikipedia/commons/d/de/Eo_circle_light-blue_blank.svg',
                    size: [40, 40],
                },
            });

            // @ts-ignore
            const markers = [];

            geoData.features.forEach((feature) => {
                const coordinates = feature.geometry.coordinates;
                const properties = feature.properties;

                markers.push({
                    coordinates,
                    icon:
                        'https://upload.wikimedia.org/wikipedia/commons/d/de/Eo_circle_light-blue_blank.svg',
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

            const data: FeatureCollection<
                Geometry,
                GeoJsonProperties
            > = geoData as FeatureCollection<
                Geometry,
                GeoJsonProperties
            >;

            const source = new mapgl.GeoJsonSource(map, {
                data,
                attributes: {
                    visible: true,
                },
            });

            const heatmapLayer = {
                id: 'dtp-heatmap-layer',
                source,
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
                        'rgba(255,255,255,0)',

                        0.1,
                        'rgba(200,240,255,0.6)',

                        0.3,
                        'rgba(0,200,255,0.8)',

                        0.5,
                        'rgba(0,120,255,1)',

                        0.7,
                        'rgba(0,50,200,1)',

                        0.9,
                        'rgba(0,20,120,1)',

                        1,
                        'rgba(0,10,60,1)',
                    ],
                    radius: 20,
                    intensity: 0.8,
                    opacity: 0.8,
                    downscale: 1,
                },
            };

            const analysisPoints = [
                turf.point([30.3000, 59.9300]),

                turf.point([30.3150, 59.9300]),

                turf.point([30.3400, 59.9350]),

                turf.point([30.3450, 59.9365]),

                turf.point([30.3600, 59.9400]),

                turf.point([30.3630, 59.9415]),
            ];

            const bufferFeatures: Feature<
                Polygon | MultiPolygon,
                GeoJsonProperties
            >[] = [];

            analysisPoints.forEach((point, index) => {
                let radius = 0.4;

                if (index === 0 || index === 1) {
                    radius = 0.2;
                }
                if (index === 2 || index === 3) {
                    radius = 0.4;
                }

                if (index === 4 || index === 5) {
                    radius = 0.4;
                }

                const buffer = turf.buffer(point, radius, {
                    units: 'kilometers',
                });

                if (!buffer) {
                    return;
                }

                buffer.properties = {
                    type: 'buffer',
                    id: index,
                };

                bufferFeatures.push(buffer);
            });

            let intersection:
                | Feature<
                    Polygon | MultiPolygon,
                    GeoJsonProperties
                >
                | null = null;

            const intersectionResult = turf.intersect(
                turf.featureCollection([
                    bufferFeatures[2],
                    bufferFeatures[3],
                ])
            );

            if (intersectionResult) {
                intersection = intersectionResult;

                intersection.properties = {
                    type: 'intersection',
                };
            }

            let unionFeature:
                | Feature<
                    Polygon | MultiPolygon,
                    GeoJsonProperties
                >
                | null = null;

            const unionResult = turf.union(
                turf.featureCollection([
                    bufferFeatures[4],
                    bufferFeatures[5],
                ])
            );

            if (unionResult) {
                unionFeature = unionResult;

                unionFeature.properties = {
                    type: 'union',
                };
            }

            const pointsCollection = turf.featureCollection(
                analysisPoints
            );

            const centroidPoint = turf.centroid(pointsCollection);

            const centroid = turf.buffer(centroidPoint, 0.08, {
                units: 'kilometers',
            });

            const turfFeatures: turf.AllGeoJSON[] = [
                ...bufferFeatures,
            ];

            if (intersection) {
                turfFeatures.push(intersection);
            }

            if (unionFeature) {
                turfFeatures.push(unionFeature);
            }

            if (centroid) {
                centroid.properties = {
                    type: 'centroid',
                };

                turfFeatures.push(centroid);
            }

            const turfSource = new mapgl.GeoJsonSource(map, {
                data: {
                    type: 'FeatureCollection',
                    features: turfFeatures as any,
                },
            });

            map.on('styleload', () => {
                map?.addLayer(heatmapLayer);

                map?.addLayer({
                    id: 'buffers-layer',
                    type: 'polygon',
                    source: turfSource,
                    filter: [
                        '==',
                        ['get', 'type'],
                        'buffer',
                    ],
                    style: {
                        color: 'rgba(0,255,100,0.15)',
                        strokeColor: '#00aa55',
                        strokeWidth: 1,
                    },
                });

                map?.addLayer({
                    id: 'union-layer',
                    type: 'polygon',
                    source: turfSource,
                    filter: [
                        '==',
                        ['get', 'type'],
                        'union',
                    ],
                    style: {
                        color: 'rgba(255,140,0,0.45)',
                        strokeColor: '#ff7b00',
                        strokeWidth: 4,
                    },
                });

                map?.addLayer({
                    id: 'intersection-layer',
                    type: 'polygon',
                    source: turfSource,
                    filter: [
                        '==',
                        ['get', 'type'],
                        'intersection',
                    ],
                    style: {
                        color: 'rgba(255,230,0,0.9)',
                        strokeColor: '#ffd000',
                        strokeWidth: 4,
                    },
                });

                map?.addLayer({
                    id: 'centroid-layer',
                    type: 'polygon',
                    source: turfSource,
                    filter: [
                        '==',
                        ['get', 'type'],
                        'centroid',
                    ],
                    style: {
                        color: '#ff0000',
                        strokeColor: '#ffffff',
                        strokeWidth: 0,
                    },
                });
            });

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
                clusterer,

                //@ts-ignore
                clustererMarkers: markers,

                heatmapLayer,
                source,
            });
        });

        return () => {
            directions && directions.clear();
            clusterer && clusterer.destroy();
            map && map.destroy();

            setMapglContext({
                mapglInstance: undefined,
                mapgl: undefined,
            });
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