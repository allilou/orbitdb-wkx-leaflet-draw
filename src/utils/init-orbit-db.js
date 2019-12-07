import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

const getKV = async() => {
    const ipfs = new IPFS();
    
    
    ipfs.on('error', (e) => console.error(e));
    
    ipfs.on('ready', async () => {
        const orbitdb = await OrbitDB.createInstance(ipfs);
    
        const kv = await orbitdb.kvstore('settings');
        console.log(kv);
        return kv;
    
        // kv.put('volume', '100')
        //     .then(() => {
        //         console.log(kv.get('volume'));
        //         console.log(kv.get('vme'))
        //         // 100
        //     })
    
        // kv.events.on('ready', () => {
        //     console.log('-----', kv.get('volume'))
        //     // 100
        //     console.log('-----', kv.get('vme'))
        // })
    
    })
}

export default getKV;