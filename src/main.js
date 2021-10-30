import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0xd7F008299bC93Ee64d376a27a302dA06396aC4B6"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let books = []
let fullBook = []
let session

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]
      session=accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _booksLength = await contract.methods.getBooksLength().call()
  const _books = []
  for (let i = 0; i < _booksLength; i++) {
    let _book = new Promise(async (resolve, reject) => {
      let p = await contract.methods.lockedViewBook(i).call()
      resolve({
        index: i,
        owner: p[0],
        title: p[1],
        cover: p[2],
        price: new BigNumber(p[3]),
        unlocks: p[4],
      })
    })
    _books.push(_book)
  }
  books = await Promise.all(_books)
  renderBooks()
}

const getFullBook = async function(i) {
    let _book = new Promise(async (resolve, reject) => {
      let p = await contract.methods.viewBook(i).call()
      resolve({
        index: i,
        owner: p[0],
        title: p[1],
        cover: p[2],
        summary: p[3],
        price: new BigNumber(p[4]),
        unlocks: p[5],
      })
    })
  fullBook = await Promise.resolve(_book)
  showFull()
}

function renderBooks() {
  document.getElementById("marketplace").innerHTML = ""
  books.forEach((_book) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-3"
    newDiv.innerHTML = _book.owner == session ? ownBookTemplate(_book) : bookTemplate(_book);
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function bookTemplate(_book) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_book.cover}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_book.unlocks} Seens
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_book.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_book.title}</h2>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _book.index
          }>
            See for ${_book.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function ownBookTemplate(_book) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_book.cover}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_book.unlocks} Seens
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_book.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_book.title}</h2>
        <div class="d-grid gap-2">
        <a
          class="btn btn-lg btn-dark panelEditBtn fs-6 p-3"
          id=${_book.index}
          data-bs-toggle="modal"
          data-bs-target="#addModal"
        >
          Edit
        </a>
        </div>
      </div>
    </div>
  `
}

function showFull() {
  var myModal = new bootstrap.Modal(document.getElementById('fullModal'))
  myModal.show()
  console.log(fullBook.summary);
  document.getElementsByClassName('book-cover')[0].innerHTML = `<img src="${fullBook.cover}" class="img-fluid" alt="Book Cover">`;
  document.getElementById("summaryContent").innerHTML = `<h3>${fullBook.title}</h3> <p>${fullBook.summary}</p>`
  console.log(fullBook);  
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
  .querySelector("#newSummaryBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newBookTitle").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newSummary").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .addSummary(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(books[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${books[index].title}"...`)
    try {
      const result = await contract.methods
        .buyBook(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully unlocked "${books[index].title}".`)
      getProducts()
      getBalance()
      getFullBook(index)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  else if (e.target.className.includes("panelEditBtn")){
    const index = e.target.id
    document.getElementById("newBookTitle").value = books[index].title
    document.getElementById("newImgUrl").value = books[index].cover
    document.getElementById("newSummary").value = books[index].summary
    document.getElementById("newPrice").value = books[index].price.shiftedBy(-ERC20_DECIMALS)

  }
})  