import React, { useEffect, useState } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import web3 from 'web3';

import './App.css';

import FeatureGroupIpfs from './components/FeatureGroupIpfs';

import IpfsClient from 'ipfs-http-client';
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';
import wkx from 'wkx';

const position = [51.505, -0.09];


var myStyle = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

function App() {

  const [kvdbFeatures, setKVDBFeatures] = useState({});
  const [ipfsFeatures, setIPFSFeatures] = useState([]);
  // const [wkbHashs, setWKBHashs] = useState([]);

  const [val, setVal] = useState();

  useEffect(() => {

    const useHttp = true;
    var wkbHashs = [];

    if (useHttp) {

      const ipfs = IpfsClient('http://localhost:5001');
      // const _ipfsHttp = IpfsClient('/ip4/127.0.0.1/tcp/5001');

      OrbitDB.createInstance(ipfs).then(async (orbitdb) => {

        const options = {
          // Give write access to ourselves
          accessController: {
            write: ['*']
          }
        }

        const _kv = await orbitdb.kvstore('land-parcels', options);
        _kv.load();

        _kv.events.on('load.progress', (address, hash, entry, progress, total) => {
          // console.log('load', entry.payload.key);
          wkbHashs  = [...wkbHashs, entry.payload.key];
        });

        _kv.events.on('ready', (dbname, heads) => {
          // console.log('ready', dbname, heads, wkbHashs);
          wkbHashs.forEach(hash => {
            // console.log(hash);
            setIPFSFeatures(ipfsFeatures => {
              const geojson = wkx.Geometry.parse(_kv.get(hash)).toGeoJSON();
              console.log(geojson);
              const list = [...ipfsFeatures, { 'wkbHash': hash, 'geojson': geojson }];
              return list;
            });
          });

        });

        _kv.events.on('write', (dbname, hash, entry) => {
          // console.log(entry); //entry[0].payload.value);
          setIPFSFeatures(ipfsFeatures => {
            const geojson = wkx.Geometry.parse(entry[0].payload.value).toGeoJSON();
            const list = [...ipfsFeatures, {'wkbHash': entry[0].payload.key, 'geojson': geojson}];
            return list;
          });
        });
  
        setKVDBFeatures(_kv);

      });

    }
    else 
    {
      var orbitdb = {};

      const ipfs = new IPFS({
        init: true,
        start: true,
        config: {
          Bootstrap: [
            "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
            "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
            "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
            "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
            "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64"
          ]
        }
      });

      ipfs.on('error', (e) => console.error(e));

      ipfs.on('ready', async () => {
        orbitdb = await OrbitDB.createInstance(ipfs);

        const options = {
          // Give write access to ourselves
          accessController: {
            write: ['*']
          }
        }

        const _kv = await orbitdb.kvstore('land-parcels', options);
        _kv.load();

        _kv.events.on('load.progress', (address, hash, entry, progress, total) => {
          // console.log('load', entry.payload.key);
          wkbHashs  = [...wkbHashs, entry.payload.key];
        });

        _kv.events.on('ready', (dbname, heads) => {
          // console.log('ready', dbname, heads, wkbHashs);
          wkbHashs.forEach(hash => {
            // console.log(hash);
            setIPFSFeatures(ipfsFeatures => {
              const geojson = wkx.Geometry.parse(_kv.get(hash)).toGeoJSON();
              console.log(geojson);
              const list = [...ipfsFeatures, { 'wkbHash': hash, 'geojson': geojson }];
              return list;
            });
          });

        });

        _kv.events.on('write', (dbname, hash, entry) => {
          // console.log(entry); //entry[0].payload.value);
          setIPFSFeatures(ipfsFeatures => {
            const geojson = wkx.Geometry.parse(entry[0].payload.value).toGeoJSON();
            const list = [...ipfsFeatures, {'wkbHash': entry[0].payload.key, 'geojson': geojson}];
            return list;
          });
        });
  
        _kv.events.on('replicated', (dbname, hash, entry) => {
          console.log('replication', entry); //entry[0].payload.value);
        });

        setKVDBFeatures(_kv);
      });
    }

  }, []);


  const handleClickPut = async (evt) => {

    // Qmd8TmZrWASypEp4Er9tgWP4kCNQnW4ncSnvjvyHQ3EVSU
    // zdpuAm9QievPb7xP2ubzkYf45i6HKVLzPJ2zw7bxP3VHLy5mt
    // zdpuAshZ5LTUPYsigGnL7LGUcu1szWfghbq4gGZEBRYDMV1vL

    // console.log(kvdbFeatures);

    var geometry = wkx.Geometry.parse('SRID=4326;POINT(1 2)');
    console.log(geometry.toWkb(), geometry.toGeoJSON());

    kvdbFeatures.put('volume', val);

  };

  const handleValueChange = (evt) => {
    setVal(evt.target.value);
  }




  const handleClickGet = async (evt) => {

    ipfsFeatures.forEach(element => {

      var geometry = wkx.Geometry.parse(kvdbFeatures.get(element.wkbHash)).toGeoJSON();

      console.log(geometry);
    });

    // console.log(ipfsFeatures);

    // console.log(kvHttp.get('volume'));

  };

  function onChange(geojson) {
    console.log("geojson changed", geojson);

    var geometryWKB = wkx.Geometry.parseGeoJSON(geojson.geometry).toWkb();

    const wkbHash = web3.utils.soliditySha3(geometryWKB);

    kvdbFeatures.put(wkbHash, geometryWKB);

  }


  return (
    <div className="App">

      {/* <p>{ipfs === null ? `IPFS Not connected` : `IPFS Connected`}</p>
      <p>{orbitDB === null ? `OrbitDB Not Instantiated` : `OrbitDB Instantiated`}</p> */}
      <p>{kvdbFeatures === null ? `KV DB Not Instantiated` : `KV DB Instantiated: ` + kvdbFeatures.address}</p>

      <label>
        Name:
           <input type="text" name="name" onChange={handleValueChange} />
      </label>

      <button onClick={handleClickPut} >Put</button>
      <button onClick={handleClickGet} >Get</button>

      <Map center={position} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />

        <FeatureGroupIpfs onChange={onChange} />

        {ipfsFeatures.map(element =>
          <GeoJSON key={element.wkbHash}
          // data={wkx.Geometry.parse(kvdbFeatures.get(element)).toGeoJSON()}
          data={element.geojson}
          style={myStyle}
          />
        )}

      </Map>

      {/* {ipfsFeatures.map(element => { console.log(wkx.Geometry.parse(kvdbFeatures.get(element)).toGeoJSON().coordinates)
        return  <p key={element}>****{wkx.Geometry.parse(kvdbFeatures.get(element)).toGeoJSON().coordinates.toString()}</p> 
        }
        )} */}

    </div>
  );
}

export default App;
