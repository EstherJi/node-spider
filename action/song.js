
const { handleSuccess, handleError } = require('../utils/handle');
const playList = require('../module/playList');
const songList = require('../module/songList');

module.exports.getPlayList = async(ctx, next) => {
	const playResult = await playList.getPlayList();

	if(playResult.length){
		handleSuccess({
			ctx, 
			message: 'success',
			result: playResult
		})
	}else{
		handleError({
			ctx, 
			message: 'error'
		})
	}
}

module.exports.getSongList = async(ctx, next) => {
	const songResult = await songList.getSongList();

	if(songResult.length){
		handleSuccess({
			ctx, 
			message: 'success',
			result: songResult
		})
	}else{
		handleError({
			ctx, 
			message: 'error'
		})
	}
}

module.exports.downloadSong = async(ctx, next) => {
	const song = await songList.downloadSongList();

	if(song){
		handleSuccess({
			ctx, 
			message: 'success',
			result: song
		})
	}else{
		handleError({
			ctx, 
			message: 'error'
		})
	}
}