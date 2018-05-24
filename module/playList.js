
const superagent = require('superagent');
const cheerio = require('cheerio');
const asy = require('async');

const baseUrl = 'http://music.163.com';
const suffixUrl = '/discover/playlist/?cat=%E5%8D%8E%E8%AF%AD';
const suffixOffsetUrl = suffixUrl + '&order=hot&limit=' + limit + '&offset=';
const limit = 35;
const offset = 35;
const pageTotal = 10;  

class playList{

	static getPageUrl(){
		let pageUrlList = [];

		for(let i = 0; i < pageTotal; i++){
			if(i == 0){
				pageUrlList.push(baseUrl + suffixUrl);
			}else{
				pageUrlList.push(baseUrl + suffixOffsetUrl + i * offset);
			}
		}

		return pageUrlList;
	}

	static getPlayList(){
		const pageUrlList = this.getPageUrl();

		return new Promise((resolve, reject) => {
			asy.mapLimit(pageUrlList, 1, (url, callback) => {
				this.requestPlayList(url, callback);
			}, (err, result) => {
				if(err){
					reject(err);
				}

				resolve(result);
			})
		})
	}

	static requestPlayList(url, callback){
		superagent.get(url).set({
			'Connection': 'keep-alive'
		}).end((err, res) => {
			if(err){
				console.info(err);
				callback(null, null);
				return;
			}

			const $ = cheerio.load(res.text);
			let curList = this.getCurPalyList($);
			callback(null, curList);
		})
	}

	static getCurPalyList($){
		let list = [];

		$('#m-pl-container li').each(function(i, elem){
			let _this = $(elem);
			list.push({
				name: _this.find('.dec a').text(),
				href: _this.find('.dec a').attr('href'),
				number: _this.find('.nb').text()
			});
		});

		return list;
	}
}

module.exports = playList;
