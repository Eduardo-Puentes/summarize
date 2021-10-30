# Summarize
Project Demo: https://eduardo-puentes.github.io/summarize/

Summarize is a dapp that lets users to post a summary and/or a opinion of a book, once posted, the user can edit their own summaries, and pay to see others summaries. 

This, making use of Solidity for building the smart contract and using Cello Extension Wallet to make the transactions to create and buy summaries of diferent books.

## Contract Methods
The contract has 6 methods; addSummary, lockedViewBook, viewBook, editSummary, buyBook and getBooksLength.

### addSummary
Recives the Title, Cover URL, Summary and Price. It will add a Summary to the system with the Book Struct.

### lockedViewBook
This view is for displaying the summaries that are available, it recives the index of the book, and return everithing except for the summry.

### viewBook
For a full view, this method recives the index of the book and returns all the information available related to that specific book.

### editSummary
This methos recives the things that the user could change; the title, cover, summry and price, also recives the index to know with book to change.

It changes the values that where stored when the user created the posts to new ones.

### buyBook
Recives the index of the book to buy and tranfers the correspondent price to the owner of the summry, also increases the number of times a user has unlocked the summary.



# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
