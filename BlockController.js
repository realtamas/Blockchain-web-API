const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChain = require('./BlockChain.js')

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        this.app.get("/api/block/:blockHeight", (req, res) => {
            return self.blockChain.getBlock(req.params.blockHeight).then(result => {
                res.set({'Connection': 'close'});
                res.status(200).json(result);
                res.end();
                }, error => {
                    res.status(404).send('\nBlock not found!');
            });
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this;
        this.app.post("/api/block", (req, res) => {
            if (req.accepts('text/*')) {
                return self.blockChain.addBlock(new BlockClass.Block(req.query)).then(result => {
                    res.set({
                        'Connection': 'close',
                        'Content-Type': 'test/plain'
                    });
                    res.status(201).json(result);
                    res.end();
                }, error => {
                    res.status(500).send('Uknown error occurred on server side. Please retry later.')
                })
            } else {
                res.status(403).send('\nBlock data must not be empty and should be a string - please resend request with desired block data included in string format.\n')
            }
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    async initializeMockData() {
        let blockHeight = await this.blockChain.getBlockHeight();
        if(blockHeight === 0){
            for (let index = 1; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                await this.blockChain.addBlock(blockAux);
            }
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}