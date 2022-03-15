const fs = require('fs')
const { utilService } = require('./utilService')
const gToys = require('../data/toy.json')

function query(filterBy) {
    const toys = _filterToys(filterBy)
    return Promise.resolve(toys)
}

function getById(toyId) {
    return new Promise((resolve, reject) => {
        const toy = gToys.find(toy => toy._id === toyId)
        if (toy) return resolve(toy)
        reject(`No toy with id === ${toyId} was found`)
    })
}

function save({ _id, name, price, labels, inStock, createdAt = Date.now() }) {
    const toyToSave = {
        _id,
        name,
        price,
        labels,
        inStock,
        createdAt,
    }
    if (_id) {
        console.log(toyToSave)
        const idx = gToys.findIndex(toy => toy._id === _id)
        gToys[idx] = toyToSave
    } else {
        // CREATE
        toyToSave._id = utilService.makeExtId()
        gToys.unshift(toyToSave)
    }
    return _saveToysToFile()
        .then(() => toyToSave)
}

function remove(toyId, loggedinUser) {
    return new Promise((resolve, reject) => {
        const idx = gToys.findIndex(toy => toy._id === toyId)
        if (idx === -1) return reject('No such toy')
        gToys.splice(idx, 1)
        _saveToysToFile()
            .then(resolve)
    })
}


function _filterToys(filterBy) {
    // filter by name
    const regex = new RegExp(filterBy.name, 'i')
    let filteredToys = gToys.filter(toy => regex.test(toy.name))

    //filter by inStock
    if (filterBy.inStock) {
        filteredToys = filteredToys.filter(toy => {
            return toy.inStock === JSON.parse(filterBy.inStock)
        })
    }

    //filter by labels
    if (filterBy.labels.length) {
        filteredToys = filteredToys.filter(toy => {
            return toy.labels.some(label => filterBy.labels.includes(label))
        })
    }

    //sorting
    if (filterBy.sortBy) {
        filteredToys.autoSortObj(filterBy.sortBy)
    }

    return filteredToys
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('data/toy.json', JSON.stringify(gToys, null, 2), (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

function _makeId(length = 5) {
    let txt = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}
module.exports = {
    save,
    query,
    remove,
    getById,
}