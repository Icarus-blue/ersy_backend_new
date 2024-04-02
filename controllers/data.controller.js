import expressAsyncHandler from "express-async-handler";
import client from "../utils/client.js";
import { getArtistById, getArtistByName, getArtistsSongs } from "../services/dataService.js";
import { Prisma } from "@prisma/client";
import { login } from "./auth.controller.js";

const generateWhere = (query, album_id) => {

    return { ...where }
}

export const getMusicVideos = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query, album_id, category } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    if (!query) return false
    let sql = `SELECT v.* 
    FROM videos AS v
    RIGHT JOIN artists_videos AS av ON v.id_ = av.video_id
    WHERE av.artist_id = ${query} AND av.category='music-videos'`
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const videos = await client.$queryRaw(baseQuery)
    res.status(200).json({
        status: true,
        videos
    })
})

export const getVideos = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query, album_id, category } = req.query
    let videos = []
    if (query !== undefined || album_id !== undefined) {
        videos = await client.videos.findMany({
            take: parseInt(pageSize),
            skip: (page - 1) * pageSize,
            where: {
                OR: [
                    {
                        title: { contains: query }
                    },
                    { album_id: parseInt(album_id) },
                ]
            }
        });
    } else {
        videos = await client.videos.findMany({
            take: parseInt(pageSize),
            skip: (page - 1) * pageSize,
            distinct: ['title', 'album_id', 'id_']
        });
    }

    if (category === 'trending') {
        videos = await client.videos.findMany({
            take: 200,
            // skip: (page - 1) * pageSize,  
            where: {
                OR: [
                    {
                        title: { contains: query }
                    },
                    { album_id: parseInt(album_id) },
                ]
            }
        });
        videos = videos.filter((video) => parseInt(video.views) > 10000000)
    }
    res.status(200).json({
        status: true,
        videos
    })
})

export const getAllSongs = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query, album_id, category } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    if (!query) return false
    let sql = '';
    if (category == 'interviews') {
        sql = `SELECT * FROM videos WHERE artist_id = ${query} AND category='interviews'`
    } else {
        sql = `SELECT v.* 
        FROM videos AS v
        RIGHT JOIN artists_videos AS av ON v.id_ = av.video_id
        WHERE av.artist_id = ${query}`
    }
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const videos = await client.$queryRaw(baseQuery)
    res.status(200).json({
        status: true,
        videos
    })
})

export const getSongsBySearch = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query, category } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    const jsonObj = JSON.parse(query);
    if (!query) return false
    let sql = '';
    if (category == 'interviews') {
        sql = `SELECT * FROM videos WHERE title LIKE '%${jsonObj.q}%' AND artist_id=${jsonObj.artist} AND category='interviews'`;
    } else {
        sql = `SELECT * FROM videos WHERE title LIKE '%${jsonObj.q}%' AND artist_id=${jsonObj.artist}`;
    }
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const videos = await client.$queryRaw(baseQuery)
    if (videos.length == 0) next({ message: 'Such songs could not be found', status: 404 })
    res.status(200).json({
        status: true,
        videos
    })
})

export const getAllAlbumsBySearch = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    const jsonObj = JSON.parse(query);
    if (!query) return false
    let sql = `SELECT * FROM albums WHERE name_ LIKE '%${jsonObj.q}%' AND artist_id=${jsonObj.artist}`;
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const albums = await client.$queryRaw(baseQuery)
    if (albums.length == 0) next({ message: 'Such songs could not be found', status: 404 })
    res.status(200).json({
        status: true,
        albums
    })
})


export const getSongsBySort = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query;
    let where = {
        name_: {
            not: '0'
        }
    };
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    const jsonObj = JSON.parse(query);
    const artist = jsonObj.artist;
    const sortMode = jsonObj.sortMode;
    const offset = (pageNumber - 1) * size;
    let sql = `SELECT * FROM videos WHERE artist_id = ${artist}`
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    let videosUnsorted = await client.$queryRaw(baseQuery)
    let videosSorted
    switch (sortMode) {
        case 'Most Views':
            videosSorted = videosUnsorted
                .map(video => ({ ...video, views: parseInt(video.views) }))
                .sort((a, b) => b.views - a.views);
            break;

        case 'Recent First':
            videosSorted = videosUnsorted
                .map(video => ({ ...video, uploaded: new Date(video.release_date) }))
                .sort((a, b) => b.uploaded - a.uploaded);
            break;

        case 'Older First':
            videosSorted = videosUnsorted
                .map(video => ({ ...video, uploaded: new Date(video.release_date) }))
                .sort((a, b) => a.uploaded - b.uploaded);
            break;

    }
    const paginatedVideos = videosSorted.slice((page - 1) * pageSize, page * pageSize);

    res.status(200).json({
        status: true,
        videos: paginatedVideos
    })

})



export const getInterviews = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    if (!query) return false
    let sql = `SELECT * FROM videos WHERE artist_id=${query} AND category='interviews'`
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const videos = await client.$queryRaw(baseQuery)
    res.status(200).json({
        status: true,
        videos
    })
})


export const getGalleryArtist = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    if (!query) return false
    let sql = `SELECT * FROM gallery WHERE artist_id=${query}`
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    const gallerys = await client.$queryRaw(baseQuery)
    res.status(200).json({
        status: true,
        gallerys
    })
})

export const getColloborates = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    if (!query) return false
    let sql = `SELECT * FROM artistes WHERE id_=${query}`
    const offset = (pageNumber - 1) * size;
    sql += ` LIMIT ${size} OFFSET ${offset}`;
    let baseQuery = Prisma.raw(sql);
    let colloborates = await client.$queryRaw(baseQuery)
    colloborates = JSON.parse(colloborates[0].related_artists);
    res.status(200).json({
        status: true,
        colloborates
    })
})




export const getArtistes = expressAsyncHandler(async (req, res, next) => {

    const { page, pageSize, query } = req.query;
    let where = {
        name_: {
            not: '0'
        }
    };

    if (query?.length > 50) {

        const jsonObj = JSON.parse(query);
        const genre = jsonObj.genre;
        const sortMode = jsonObj.sortMode;
        const filter = jsonObj.filter;
        let gender = filter.gender[0] || '';
        let ageBracket = filter.age[0] || '';
        let groupType = filter.groupType[0] || '';
        let labels = filter.labels[0] || '';
        const offset = (page - 1) * pageSize;
        let artistesUnsorted = null;
        let sql = '';
        if (genre == 'All') {
            artistesUnsorted = await client.$queryRaw`
            SELECT artistes.*, COUNT(gallery.id_) AS gallery_count
            FROM artistes
            LEFT JOIN gallery ON artistes.id_ = gallery.artist_id
            GROUP BY artistes.id_
        `;
        } else {
            artistesUnsorted = await client.$queryRaw`
            SELECT artistes.*, COUNT(gallery.id_) AS gallery_count
            FROM artistes
            LEFT JOIN gallery ON artistes.id_ = gallery.artist_id
            WHERE FIND_IN_SET(${genre}, artistes.genre) > 0
            GROUP BY artistes.id_
                `;
        }

        let artistesSorted = null;

        switch (sortMode) {
            case 'Views':
                artistesSorted = artistesUnsorted
                    .map(artiste => ({ ...artiste, views: parseInt(artiste.views) }))
                    .sort((a, b) => b.views - a.views);
                break;

            case 'RIP':
                artistesSorted = [];
                break;

            case 'Most Item First':
                artistesSorted = [];
                break;

            case 'A-Z':
                artistesSorted = artistesUnsorted.sort((a, b) => a.name_.localeCompare(b.name_));
                break;

            case 'Z-A':
                artistesSorted = artistesUnsorted.sort((a, b) => b.name_.localeCompare(a.name_));
                break;

            case 'Youngest to Oldest':
                artistesSorted = artistesUnsorted.sort((a, b) => new Date(b.dob) - new Date(a.dob));
                break;

            case 'Oldest to Youngest':
                artistesSorted = artistesUnsorted.sort((a, b) => new Date(a.dob) - new Date(b.dob));
                break;

            case 'Recently Updated':
                artistesSorted = [];
                break;

            case 'Birthday':

                const today = new Date();
                const todayMonth = today.getMonth() + 1; // JavaScript months are 0-based
                const todayDay = today.getDate();

                artistesSorted = artistesUnsorted.filter(artiste => {
                    const dob = new Date(artiste.dob);
                    const dobMonth = dob.getMonth() + 1; // JavaScript months are 0-based
                    const dobDay = dob.getDate();
                    return dobMonth === todayMonth && dobDay === todayDay;
                });

                break;

            case 'Monthly Listners':
                artistesSorted = artistesUnsorted.sort((a, b) => b.monthly_listeners - a.monthly_listeners);
                break;

            case 'Social Followers':
                artistesSorted = artistesUnsorted.sort((a, b) => {
                    const followersA = a.facebook_count + a.instagram_count + a.soundcloud_count + a.twitter_count + a.youtube_count + a.spotify_count;
                    const followersB = b.facebook_count + b.instagram_count + b.soundcloud_count + b.twitter_count + b.youtube_count + b.spotify_count;
                    return followersB - followersA; // Descending order
                });
                break;

            case 'Most Photos':
                artistesSorted = artistesUnsorted.sort((a, b) => {
                    const stringValue_a = a.gallery_count.toString();
                    const stringValue_b = b.gallery_count.toString();
                    let numericValue_a = Number(stringValue_a.slice(0, -1));
                    let numericValue_b = Number(stringValue_b.slice(0, -1));
                    return numericValue_b - numericValue_a
                });
                break;

            case 'Following':
                artistesSorted = [];
                break;
        }

        if (gender != '') {
            artistesSorted = artistesSorted.filter(artist => artist.gender === gender);
        }
        if (ageBracket != '') {

            artistesSorted = artistesSorted.filter(artist => {
                const birthdate = new Date(artist.dob);
                const today = new Date();
                let age = today.getFullYear() - birthdate.getFullYear();

                switch (ageBracket) {
                    case 'a':
                        return age < 20;
                    case 'b':
                        return age >= 20 && age <= 30;
                    case 'c':
                        return age > 30 && age <= 40;
                    case 'd':
                        return age > 40;
                    default:
                        return true; // Includes the artist if no specific bracket matches
                }
            });
        }

        if (groupType != '') {
            artistesSorted = artistesSorted.filter(artist => artist.group_type === groupType);
        }

        const paginatedArtistes = artistesSorted.slice((page - 1) * pageSize, page * pageSize);
        const serializedArtistes = paginatedArtistes.map(artist => ({
            ...artist,
            gallery_count: artist.gallery_count.toString(), // Convert BigInt to String
        }));

        res.status(200).json({
            status: true,
            artists: serializedArtistes
        })

    } else {
        if (query) {
            where.name_ = {
                contains: query
            };
        } else {
            where = {
                name_: {
                    not: '0'
                }
            };
        }
        const artistesUnsorted = await client.artistes.findMany({
            where: where,
        });
        const artistesSorted = artistesUnsorted
            .map(artiste => ({ ...artiste, views: parseInt(artiste.views) }))
            .sort((a, b) => b.views - a.views);
        const paginatedArtistes = artistesSorted.slice((page - 1) * pageSize, page * pageSize);
        res.status(200).json({
            status: true,
            artists: paginatedArtistes.filter((artist, index, arr) => arr.indexOf(artist) === index)
        })
    }
})

export const getAlbumsBySortingMode = expressAsyncHandler(async (req, res, next) => {

    const { filter, page = 1, pageSize = 10 } = req.body;

    if (!filter) {
        return res.status(400).json({ message: 'fiter mode is required' });
    }

    let where = {
        artist_id: {
            not: 0
        }
    };

    let albums = null;
    switch (filter) {
        case 'tracks':
            albums = await client.albums.findMany({
                take: parseInt(pageSize),
                skip: (page - 1) * pageSize,
                orderBy: {
                    tracks_manuel: 'desc',
                },
                where
            })
            break;
        case 'duration':
            albums = await client.albums.findMany({
                take: parseInt(pageSize),
                skip: (page - 1) * pageSize,
                distinct: ['id_'],
                orderBy: {
                    duration_manuel: 'desc',
                },
                where
            })
            break
        case 'recent_first':
            albums = await client.albums.findMany({
                take: parseInt(pageSize),
                skip: (page - 1) * pageSize,
                distinct: ['id_'],
                orderBy: {
                    release_date: 'desc',
                },
                where
            })
            break;
        case 'oldest_first':
            albums = await client.albums.findMany({
                take: parseInt(pageSize),
                skip: (page - 1) * pageSize,
                distinct: ['id_'],
                orderBy: {
                    release_date: 'asc',
                },
                where
            })
            break
        case 'most_popular_artist':
            albums = await client.albums.findMany({
                take: parseInt(pageSize),
                skip: (page - 1) * pageSize,
                distinct: ['id_'],
                where
            })
            break
    }

    if (!albums) return res.status(400).json({ message: 'Albums not found' });

    res.status(200).json({
        status: true,
        albums: albums.filter((artist, index, arr) => arr.indexOf(artist) === index)
    })
})

export const getArtist = expressAsyncHandler(async (req, res, next) => {
    const { artist_id } = req.params
    const artist = await getArtistById(artist_id);
    if (!artist) return next({ message: 'artist could not be found', status: 404 })

    // let artistSongs = await getArtistsSongs(artist.id_)

    res.status(200).json({
        status: true,
        artist,
        // songs: artistSongs
    })
})

export const getArtistSpecific = expressAsyncHandler(async (req, res, next) => {
    const { page, pageSize, query } = req.query;
    const artist = await getArtistById(query);
    if (!artist) return next({ message: 'artist could not be found', status: 404 })
    const related_artists = await JSON.parse(artist.related_artists)
    let sql = `SELECT artist_group_id FROM videos WHERE artist_id = ${query} AND artist_group_id IS NOT NULL`
    let baseQuery = Prisma.raw(sql);
    let group_id_arr = await client.$queryRaw(baseQuery)
    res.status(200).json({
        status: true,
        artist,
    })
})

export const getAlbumsBySearch = expressAsyncHandler(async (req, res, next) => {
    const { search } = req.body

    const albums = await client.albums.findMany({
        where: {

            name_: {
                contains: search.toLowerCase()
            },
        },
    });
    if (!albums) return next({ message: 'artist could not be found', status: 404 })

    res.status(200).json({
        status: true,
        albums,
    })
})

export const getAlbums = expressAsyncHandler(async (req, res, next) => {
    const { page, pageSize, query } = req.query
    const albums = await client.albums.findMany({
        take: parseInt(pageSize),
        skip: (page - 1) * pageSize,
        distinct: ['name_'],
        where: {
            name_: {
                contains: query,
                not: 'Other'
            }
        }
    });

    res.status(200).json({
        status: true,
        albums: albums.filter((album, index, arr) => arr.indexOf(album) === index)
    })
})

export const getAlbumsById = expressAsyncHandler(async (req, res, next) => {
    const { page, pageSize, query } = req.query
    const sql = `SELECT * FROM albums WHERE artist_id = ${query}`
    const baseQuery = Prisma.raw(sql);
    let albums = await client.$queryRaw(baseQuery)
    console.log(albums);
    res.status(200).json({
        status: true,
        albums: albums.filter((album, index, arr) => arr.indexOf(album) === index)
    })
})

export const getGallery = expressAsyncHandler(async (req, res, next) => {
    const { page, pageSize, query } = req.query

    const gallery = await client.gallery.findMany({
        take: parseInt(pageSize),
        skip: (page - 1) * pageSize,
    });

    // await Prisma.$queryRwa

    res.status(200).json({
        status: true,
        gallery
    })

})

export const getGalleryBySearch = expressAsyncHandler(async (req, res, next) => {
    const { artistName, pageSize = 10, page = 1 } = req.body;

    try {
        let query = `
            SELECT g.*
            FROM gallery g
            INNER JOIN artistes a ON g.artist_id = a.id_
            WHERE 1=1 AND FIND_IN_SET('${artistName}', a.name_) > 0`;

        const offset = (page - 1) * pageSize;
        query += ` LIMIT ${pageSize} OFFSET ${offset}`;
        let baseQuery = Prisma.raw(query);
        const galleries = await client.$queryRaw(baseQuery);

        if (galleries.length === 0) {
            return res.status(404).json({ message: `No galleries found for artist "${artistName}"` });
        }

        res.json({ status: true, galleries });
    } catch (error) {
        console.error('Error retrieving galleries:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
})

export const addEntry = expressAsyncHandler(async (req, res, next) => {
    const { entry } = req.body
    res.status(200).json({
        status: true,
        memsage: 'added correctly'
    })

})
