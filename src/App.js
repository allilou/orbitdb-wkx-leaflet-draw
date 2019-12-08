import React, { useEffect, useState } from 'react';
import { Map, Marker, Popup, TileLayer, Polygon } from 'react-leaflet';
import web3 from 'web3';

import './App.css';

import FeatureGroupIpfs from './components/FeatureGroupIpfs';

import IpfsClient from 'ipfs-http-client';
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';
import wkx from 'wkx';

const position = [51.505, -0.09];

function App() {

  const [ipfs, setIpfs] = useState({});
  const [orbitDB, setOrbitDB] = useState({});
  const [kv, setKV] = useState({});
  const [kvHttp, setKVHttp] = useState({});

  const [val, setVal] = useState();

  const [featuresWkbHash, setFeaturesWkbHash] = useState([]);

  useEffect(() => {

    // const _ipfsHttp = IpfsClient('http://localhost:5001');
    // // const _ipfsHttp = IpfsClient('/ip4/127.0.0.1/tcp/5001');

    //   OrbitDB.createInstance(_ipfsHttp).then( async (__orbitdb) => {
    //     console.log(__orbitdb);

    //     const __kv = await __orbitdb.kvstore('spatial-features');
    //     __kv.load();

    //     console.log(__kv.address.toString());

    //     setKVHttp(__kv);

    //     __kv.put('volume', '78787878');
    //   });


    const _ipfs = new IPFS({
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

    _ipfs.on('error', (e) => console.error(e));

    _ipfs.on('ready', async () => {
      const _orbitdb = await OrbitDB.createInstance(_ipfs);

      const options = {
        // Give write access to ourselves
        accessController: {
          write: ['*']
        }
      }

      const _kv = await _orbitdb.kvstore('land-parcels', options);
      // _kv.load();

      _kv.events.on('write', (dbname, hash, entry) => {
        // console.log(entry); //entry[0].payload.value);
        setFeaturesWkbHash(featuresWkbHash => {
          const list = [...featuresWkbHash, entry[0].payload.key];
          return list;
        });
      });

      _kv.events.on('replicated', (dbname, hash, entry) => {
        console.log('replication', entry); //entry[0].payload.value);
      });

      setIpfs(_ipfs);
      setOrbitDB(_orbitdb);
      setKV(_kv);
    });

  }, []);


  const handleClickPut = async (evt) => {

    // Qmd8TmZrWASypEp4Er9tgWP4kCNQnW4ncSnvjvyHQ3EVSU
    // zdpuAm9QievPb7xP2ubzkYf45i6HKVLzPJ2zw7bxP3VHLy5mt
    // zdpuAshZ5LTUPYsigGnL7LGUcu1szWfghbq4gGZEBRYDMV1vL

    // console.log(kv);

    var geometry = wkx.Geometry.parse('SRID=4326;POINT(1 2)');
    console.log(geometry.toWkb(), geometry.toGeoJSON());

    kv.put('volume', val);

  };

  const handleValueChange = (evt) => {
    setVal(evt.target.value);
  }




  const handleClickGet = async (evt) => {

    featuresWkbHash.forEach(element => {

      var geometry = wkx.Geometry.parse(kv.get(element)).toGeoJSON();

      console.log(geometry);      
    });

    // console.log(featuresWkbHash);

    // console.log(kvHttp.get('volume'));

  };

  function onChange(geojson) {
    console.log("geojson changed", geojson);

    var geometryWKB = wkx.Geometry.parseGeoJSON(geojson.geometry).toWkb();

    const wkbHash = web3.utils.soliditySha3(geometryWKB);

    kv.put(wkbHash, geometryWKB);

    // setFeaturesWkbHash(featuresWkbHash => {
    //   const list = [...featuresWkbHash, wkbHash];
    //   return list;
    // });
  }


  return (
    <div className="App">

      <p>{ipfs === null ? `IPFS Not connected` : `IPFS Connected`}</p>
      <p>{orbitDB === null ? `OrbitDB Not Instantiated` : `OrbitDB Instantiated`}</p>
      <p>{kv === null ? `KV DB Not Instantiated` : `KV DB Instantiated: ` + kv.address}</p>

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

        <Marker position={position}>
          <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
        </Marker>


        <FeatureGroupIpfs onChange={onChange}/>

      </Map>

      {featuresWkbHash.map(element => {
      return (
          <p key={element}>****{wkx.Geometry.parse(kv.get(element)).toGeoJSON().coordinates.toString()}</p> 
          // <Polygon key={element} position={wkx.Geometry.parse(kv.get(element))}>

          // </Polygon>
        )})
        }

    </div>
  );
}

export default App;
