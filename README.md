# nft-fetcher-js

Simple node.js service (hosted in heroku) to fetch NFT metadata from ethereum blockchain. It's supposed to do the call and return it for any client use which is for mobile apps at this point.

## Setup .env

```
ROPSTEN_WEB3_ENDPOINT="https://eth-ropsten.alchemyapi.io/v2/YOURKEY"
KOVAN_WEB3_ENDPOINT="https://eth-kovan.alchemyapi.io/v2/YOURKEY"
MAINNET_WEB3_ENDPOINT="https://eth-mainnet.alchemyapi.io/v2/YOURKEY"
ETHERSCAN_API_KEY="YOURKEY"
```

# Know inteface id's

| Name  | Inteface ID |
| ------------- | ------------- |
| ERC165	| 0x01ffc9a7 |
| StoreInterface	| 0x75b24222 |
| ERC721	| 0x80ac58cd |
| ERC20	| 0x36372b07 |
| ERC-20::name	| 0x06fdde03 |
| ERC-20::symbol	| 0x95d89b41 |
| ERC-20::decimals	| 0x313ce567 |
| ERC-2280	| 0x25961920 |
