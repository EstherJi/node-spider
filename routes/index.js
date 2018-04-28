const router = require('koa-router')()

const song = require('../action/song')

router.get('/', song.getPlayList);
router.get('/songList', song.getSongList);
router.get('/download', song.downloadSong);

module.exports = router
