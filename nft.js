require("dotenv").config()


exports.info = function (req, res) {

  console.log("Parameters:", req.query.addr, "&", req.query.tok);

  getMetadataFrom(req.query.network, req.query.addr, req.query.tok).then(
    function (value) {
      res.json(value);
      console.log("Returned", value);
    },
    function (error) {
      console.log(error);
      res.status(400);
      res.send(error);
    }
  );

};

async function getMetadataFrom(network, contractAddress, tok) {
  const Web3 = require('web3');

  var rpcURL = process.env.ROPSTEN_WEB3_ENDPOINT;
  if (network == "mainnet") {
    rpcURL = process.env.MAINNET_WEB3_ENDPOINT;
  } else if (network == "kovan") {
    rpcURL = process.env.KOVAN_WEB3_ENDPOINT;
  }

  const web3 = new Web3(rpcURL)
  var version = web3.version;
  console.log("Web3: " + version); // "0.2.0"

  // Get ABI from Etherscan
  var sourceABI = abi; // default
  var r = await getABIFromEtherscan(contractAddress, function (err, hash) {
    if (!err) {
      console.log("ABI found");
    } else {
      console.log("Error: " + err + "\n");
    }
  });

  if (r != "Contract source code not verified" && r != "Contract source code not verified") {
    sourceABI = JSON.parse(r);
  }

  const contract = new web3.eth.Contract(sourceABI, contractAddress)

  // Get name
  const name = await contract.methods.name().call();
  console.log("Found name", name);

  // Get symbol
  const symbol = await contract.methods.symbol().call()
  console.log("Found symbol", symbol)

  // Get Owner
  const owner = await contract.methods.owner().call()
  console.log("Found owner", owner)

  // Check supportsInterface
  var existsInteface = await contract.methods.supportsInterface(web3.utils.toHex('0x01ffc9a7')).call();
  console.log("ERC165 supported: " +  existsInteface);

  existsInteface = await contract.methods.supportsInterface(web3.utils.toHex('0x80ac58cd')).call();
  console.log("ERC721 supported: " +  existsInteface);

  // const totalTokens = await contract.getPastEvents('Transfer', {
  //   fromBlock: 0,
  //   toBlock: "latest"
  // });
  // console.log("Total:", totalTokens.length);

  var foundTokenUrl = null;
  const tokenURL = await contract.methods.tokenURI(tok).call();
  console.log("Token Uri for tokenID", tok, "is", tokenURL);

  // Let's retrieve JSON
  var foundTokenImageUrl = "";
  var result = "";
  if (tokenURL.includes('https://')) {
    const axios = require('axios')
    const response = await axios.get(tokenURL)
    result = response.data;
    console.log("JSON", result.image);
    foundTokenImageUrl = result.image;
  }

  // Make up JSON
  return {
    "tracker": name,
    "name": result.name,
    "description": result.description,
    "symbol": symbol,
    "owner": owner,
    "tokenNo": tok,
    "contract": contractAddress,
    // "mintedTokens": totalTokens.length,
    "image": foundTokenImageUrl,
    "tokenJson": result,
    // "events": totalTokens
  };
}

async function getMetadataFor(contractAddress, tok) {
  const Web3 = require('web3');
  const rpcURL = process.env.ROPSTEN_WEB3_ENDPOINT;
  const web3 = new Web3(rpcURL)
  const contract = new web3.eth.Contract(abi, contractAddress)

  // Get name
  const name = await contract.methods.name().call();
  console.log("Found name", name);

  // Get symbol
  const symbol = await contract.methods.symbol().call()
  console.log("Found symbol", symbol)

  // Get Owner
  const owner = await contract.methods.owner().call()
  console.log("Found owner", owner)

  const totalTokens = await contract.getPastEvents('Transfer', {
    filter: {
      _from: '0x0000000000000000000000000000000000000000'
    },
    fromBlock: 0
  });
  console.log("Total:", totalTokens.length);

  var foundTokenUrl = null;
  var foundTokenImageUrl = null;
  const forLoop = async _ => {
    console.log('Start')

    for (let index = 1; index <= totalTokens.length; index++) {
      let tokenId = totalTokens[index - 1].returnValues.tokenId;
      if (tokenId == tok) {
        const tokenURL = await contract.methods.tokenURI(index).call();
        console.log(index, " - Token Uri for tokenID", tokenId, "is", tokenURL);
        foundTokenUrl = tokenURL;

        // Let's retrieve JSON
        const axios = require('axios')
        const response = await axios.get(tokenURL)
        const result = response.data;
        console.log("JSON", result.image);
        foundTokenImageUrl = result.image;
      }
    }

    console.log('End')
  }

  await forLoop();

  // Make up JSON
  return {
    "name": name,
    "symbol": symbol,
    "owner": owner,
    "tokenNo": tok,
    "contract": contractAddress,
    "mintedTokens": totalTokens.length,
    "events": totalTokens,
    "image": foundTokenImageUrl,
    "tokenJson": foundTokenUrl
  };
}

async function getABIFromEtherscan(contract) {
  var url = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + contract + "&apikey=" + process.env.ETHERSCAN_API_KEY;
  const axios = require('axios')
  const response = await axios.get(url)
  const result = response.data.result;
  // console.log("JSON", result);

  return result;
}

var abi = [{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "getApproved",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "ownerOf",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "bytes4",
      "name": "interfaceId",
      "type": "bytes4"
    }],
    "name": "supportsInterface",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "tokenURI",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];