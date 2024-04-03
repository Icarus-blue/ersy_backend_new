import { Router } from 'express'
import * as VideoController from '../controllers/data.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'

const router = Router()
router.get('/videos', VideoController.getMusicVideos)
router.get('/musicvideos', VideoController.getMusicVideos)
router.get('/getallsongs', VideoController.getAllSongs)
router.get('/interviews', VideoController.getInterviews)
router.get('/gallery_artist', VideoController.getGalleryArtist)
router.get('/colloborates', VideoController.getColloborates)
router.get('/getallsongsbysearch', VideoController.getSongsBySearch)
router.get('/getallsongsbysort', VideoController.getSongsBySort)

router.get('/artists', VideoController.getArtistes)
router.get("/artists/:artist_id", VideoController.getArtist)
router.get("/getArtist", VideoController.getArtistSpecific)

router.get('/albums', VideoController.getAlbumsById)
router.get('/getallalbumsbysearch', VideoController.getAllAlbumsBySearch)
router.post('/albums/search', VideoController.getAlbumsBySearch)


router.get('/videos_', VideoController.getVideos)

router.get('/gallery', VideoController.getGallery)
router.post('/gallery/search', VideoController.getGalleryBySearch)
router.get('/getgallerybysort', VideoController.getGallerySort)

router.get('/colloboratesbysearch', VideoController.getColloboratesBySearch)
export default router