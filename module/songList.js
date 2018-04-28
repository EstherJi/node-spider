
const superagent = require('superagent');
const cheerio = require('cheerio');
const asy = require('async');
const fs = require('fs');
const path = require('path');

const playList = require('../module/playList');

const baseUrl = 'http://music.163.com';
const downloadUrl = 'http://music.163.com/song/media/outer/url';
const dirname = 'music';

class songList{
	static async getSongList(){
		const urlCollection = await playList.getPlayList();

		let urlList = [];
		for(let item of urlCollection){
			for(let subItem of item){
				urlList.push(baseUrl + subItem.href);
			}
		}

		return new Promise((resolve, reject) => {
			asy.mapLimit(urlList, 1, (url, callback) => {
				this.requestSongList(url, callback);
			}, (err, result) => {
				if(err){
					reject(err);
				}

				resolve(result);
			})
		})
	}

	static requestSongList(url, callback){
		superagent.get(url).set({
			'Connection': 'keep-alive'
		}).end((err, res) => {
			if(err){
				console.info(err);
				callback(null, null);
				return;
			}

			const $ = cheerio.load(res.text);
			let curList = this.getCurSongList($);
			callback(null, curList);
		}).timeout(3e20)
	}

	static getCurSongList($){
		let list = [];

		$('#song-list-pre-cache li').each((i, elem) => {
			let _this = $(elem);
			list.push({
				name: _this.find('a').text(),
				url: _this.find('a').attr('href')
			})
		})

		return list;
	}

	static async downloadSongList(){
		const songList = await this.getSongList();

		let songUrlList = [];
		for(let item of songList){
			for(let subItem of item){
				let id = subItem.url.split('=')[1];
				songUrlList.push({
					name: subItem.name,
					downloadUrl: downloadUrl + '?id=' + id + '.mp3'
				});
			}
		}

		if(!fs.existsSync(dirname)){
			fs.mkdirSync(dirname);
		}
		
		return new Promise((resolve, reject) => {
			asy.mapSeries(songUrlList, (item, callback) => {
				setTimeout(() => {
					this.requestDownload(item, callback);
					callback(null, item);
				}, 5e3);
			}, (err, result) => {
				if(err){
					reject(err);
				}

				resolve(result);
			})
		})
	}

	static requestDownload(item, callback){
		let stream = fs.createWriteStream(path.join(dirname, item.name + '.mp3'));

		superagent.get(item.downloadUrl).set({
			'Connection': 'keep-alive'
		}).pipe(stream).on('error', (err) => {
			console.info(err);
		})
	}
}

module.exports = songList;