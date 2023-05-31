const { MongoClient } = require('mongodb');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const whitelistedAddresses = [
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
    "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
    "0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678"
];

const leafNodes = whitelistedAddresses.map(addr => keccak256(addr));

const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

const uri = 'mongodb+srv://zura:verse@cluster0.jwqcpmj.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'Cluster0';
const collectionName = 'merkleProofs';

async function connectToMongoDB() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Prepare the data to be inserted
        const data = whitelistedAddresses.map((address, index) => ({
            address: address,
            proof: merkleTree.getHexProof(leafNodes[index]).toString().split(',')
        }));
        
        // Insert the data into the collection
        collection.insertMany(data, (error, result) => {
            if (error) {
                console.error('Error inserting data into MongoDB:', error);
            } else {
                console.log('Data inserted successfully');
                // Close the MongoDB connection
                client.close();
            }
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToMongoDB();
