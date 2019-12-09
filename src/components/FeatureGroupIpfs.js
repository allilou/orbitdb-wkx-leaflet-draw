import React from 'react';
import { FeatureGroup } from 'react-leaflet';
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
            console.log("_onCreated: something else created:", layer.toGeoJSON());          
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