import React, { useState } from 'react';
import { FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';


export default function FeatureGroupIpfs(props) {

    const _onCreated = (e) => {
        let type = e.layerType;
        let layer = e.layer;
        if (type === 'marker') {
            // Do marker specific actions
            console.log("_onCreated: marker created", e);
        }
        else {
            // console.log("_onCreated: something else created:", type, e);
            console.log("_onCreated: something else created:", e.layer.toGeoJSON());          
        }
        // Do whatever else you need to. (save to db; etc)
        props.onChange(e.layer.toGeoJSON());
    }

    return (
        <FeatureGroup>
            <EditControl
                position='topright'
                onCreated={_onCreated}
                // onEdited={_onEditPath}
                // onDeleted={_onDeleted}
                draw={{
                    rectangle: false,
                    circle:false,
                    circlemarker:false,
                    polyline:false,
                }}

                edit={{
                    edit: false,
                    remove: false
                }}

            />
        </FeatureGroup>
    );
}

    /*
    const onFeatureGroupReady = (reactFGref) => {

        // populate the leaflet FeatureGroup with the geoJson layers

        let leafletGeoJSON = new L.GeoJSON(getGeoJson());
        let leafletFG = reactFGref.leafletElement;

        leafletGeoJSON.eachLayer((layer) => {
            leafletFG.addLayer(layer);
        });

        // store the ref for future access to content

        setEditableFG(reactFGref); // TODO check result
    }
    


    // TODO this function should return the geometry features stored on the IPFS/OrbitDB 
    function getGeoJson() {
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [
                                -122.47979164123535,
                                37.830124319877235
                            ],
                            [
                                -122.47721672058105,
                                37.809377088502615
                            ]
                        ]
                    }
                },
            ]
        }
    }
*/