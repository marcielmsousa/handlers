const http = require('http')
const https = require('https')
const fs = require('fs')
const log = (log) => {
	console.log(log)
}
const error = (log) => {
	console.error(log)
}
const readline = require('readline')
//const core = require('./BFXCore')


module.exports = {
	httpsGet: httpsGet,
	writeFile: writeFile,
	readFile: readFile,
	appendFile: appendFile,
	param: callback => {
		readFile('./params.json', (data) => {
			params = JSON.parse(data)
			callback(params)
		})
	},
	round: roundN,
	tradeParams: callback => {
		readFile('./params_trading.json', data => {
			params = JSON.parse(data)
			callback(params)
		})
	},
	paramsPromise: paramsPromise,
	sleep: sleep,
	readJsonFile: readJsonFile,
	readFromConsole: readFromConsole,
	isOnArray: isOnArray,
	arrayRemoveDuplicate: arrayRemoveDuplicate,
	//readFilePromise: readFilePromise,
	//check2DArraySorting: check2DArraySorting,
	createDir: createDir,
	fileOrDirectoryExists: fileOrDirectoryExists,
}

function fileOrDirectoryExists(filePath){
	return new Promise( res => {
		fs.access( filePath, fs.constants.F_OK, err => {
			if(err){
				res(false)
			}else{
				res(true)
			}
		})
	})
}

function createDir(directoryName){
	fs.mkdirSync( `${process.cwd()}/${directoryName}`, {recursive: true}, err => {
		if(err){
			log(err)
		}
	})
}

/*
//Returns 1:ascending, -1:descending, 0:not properly sorted
function check2DArraySorting(array, arraySortingIndex){
	let sort = 0
	let currValue = 0
	for(let i = 1; i < array.length; i++){
		switch(true){
			case array[i][arraySortingIndex] >= array[i-1][arraySortingIndex]:
				currValue = 1
				if( currValue + sort == 0 ) return 0
				sort = 1
			break
			case array[i][arraySortingIndex] <= array[i-1][arraySortingIndex]:
				currValue = -1
				if( currValue + sort == 0 ) return 0
				sort = -1
			break
		}
	}
	return sort
}
*/

function arrayRemoveDuplicate(array) {
	let newArray = []
	if (array != undefined && array.length > 0) {
		newArray.push(array[0])

		for (let i = 1; i < array.length; i++) {
			newArray.forEach(item => {
				if (!isOnArray(newArray, array[i])) newArray.push(array[i])
			})
		}
	}
	return newArray
}

function isOnArray(arr, item) {
	let arrItem;
	for (let index in arr) {
		arrItem = arr[index];
		if (arrItem === item) {
			return true;
		}
	}
	return false;
}


function readFromConsole() {
	return new Promise(resolve => {
		let reader = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})
		reader.question('', enteredValue => {
			reader.close()
			if (enteredValue.length > 0 && enteredValue.replace(/ /g, '').length == 0) {
				enteredValue = ''
			}
			resolve(enteredValue)
		})
	})
}

function readJsonFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf-8', (err, data) => {
			if(err){
				reject(err)
			}else{
				try{
					resolve(JSON.parse(data))	
				}catch(err){
					reject(err)
				}
			}
		})
	})
}

function sleep(millis, verbose) {
	return new Promise(resolve => {
		if (verbose == undefined || verbose) console.log(`Waiting ${millis/1000} sec(s)`);
		setTimeout(resolve, millis)
	})
}

function httpsGet(url, callback) {
	return new Promise((resolve, reject) => {
		https.get(`${ (url.includes('https://') ? url : `https://${url}`) }`, (response) => {
			let output = ''
			response.on('data', fragment => {
				output += fragment
			})
			response.on('end', () => {
				writeFile('./log/lastHttpsCall.log', output)
				resolve(output)
				if (typeof callback == 'function') {
					callback(output)
				}
			})
		}).on('error', (err) => {
			error(`HTTPS error --> ${err}`)
			reject(err)
		})
	})
}

function paramsPromise() {
	return new Promise(resolve => {
		readFile('./params.json', data => {
			resolve(JSON.parse(data))
		})
	})
}

function appendFile(path, content, callback) {
	fs.appendFile(path != undefined ? path : './output', content, err => {
		if (err) {
			error(`Error -->  ${err}`)
		}
		if (typeof callback === 'function') callback(path, content)
	})
}

function roundN(value, precision){
	value *= 10**precision
	value = Math.round(value)
	return value / 10**precision
}

function round(value, precision) {
	let integer = value.toString().split('.')[0]
	let decimal = value.toString().split('.')[1]

	switch (true) {
		case decimal == undefined:
			return Number(integer)
		case precision >= decimal.length:
			return Number(integer.concat(`.${decimal}`))
	}

	if (precision != 0) {
		let newPartialDecimal = decimal.slice(0, precision - 1)

		let roundingDigit = Number(decimal.slice(precision - 1, precision))
		let rounderDigit = Number(decimal.slice(precision, precision + 1))

		if (rounderDigit >= 5)
			return Number(integer.concat(`.${newPartialDecimal}${++roundingDigit}`))
		return Number(integer.concat(`.${newPartialDecimal}${roundingDigit}`))
	} else {
		integer = Number(integer)
		if (Number(decimal[0]) >= 5)
			integer++
		return integer
	}
}

function writeFile(path, content) {
	return new Promise(resolve => {
		fs.writeFile(path != undefined ? path : './output', content, err => {
			resolve(0)
		})
	})
}

//function readFilePromise(path) {
function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
		    if(err){
				reject(err)
			}else{
				resolve(data)
			}
		})
	})
}

/*
function readFile(path, callback) {
	fs.readFile(path, 'utf-8', (err, data) => {
		callback(data, err)
	})
}
*/