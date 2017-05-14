const fs = require('fs');
const request = require('request');
const async = require('async');


const {LASTFM_API_KEY, LASTFM_USER} = require('../config/config.js');

let pages = 0;
let allData = [];;

async.whilst(
        function() { return  pages < 100; },
        function(callback) {
                pages++;
                console.log(`page ${pages}`);
                let url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&page=${pages}&limit=100`;
                let options = {
                        url,
                        headers: {
                                'User-Agent': 'request'
                        }
                };
                request(options,  (error, response, body) =>  {
                        let scrobbles = [];
                        console.log(`statusCode = ${response.statusCode}`);
                        if (!error && response.statusCode == 200) {
                                let resObj = JSON.parse(body);
                                if (!resObj || !resObj["toptracks"] || !resObj["toptracks"]["track"] || resObj["toptracks"]["track"].length < 1){
                            callback("reached end of the toptracks", pages);
                                }
                                let resScrobbles = resObj["toptracks"]["track"];
                                scrobbles = resScrobbles.map((scrob) => {
                                        let artist = "";
                                        let album = "";
                                        let title = "";
                                        let playcount = "";
                                        if (scrob.artist && scrob.artist.name)
                                                artist = scrob.artist.name;
                                        /*if (scrob.album && scrob.album["#text"])
                                                album = scrob.album["#text"];*/
                                        if (scrob.name)
                                                title = scrob.name;
                                        if (scrob.playcount)
                                                playcount = scrob.playcount;
                                        return {
                                                "artist": artist,
                                                "title": title,
                                                "page": pages,
                                                "rank": scrob["@attr"].rank,
                                        }
                                });


                                /*if (pages > 1){
                                    allData = JSON.parse(fs.readFileSync(`${__dirname}/toptracks.json`, 'utf-8'));
                                } TODO: start backup if stopped execution*/

                                allData.push(scrobbles);
                                // TODO: only writeFileSync when user presses Q
                                fs.writeFileSync(`${__dirname}/toptracks.json`, `${JSON.stringify(allData)}`, 'utf8');
                                setTimeout( () => {callback(null, pages)}, 1000);
                        }else{
                                console.error('error: ', error);
                                console.error(JSON.stringify(error));
                                callback(error, pages);
                        }
                });}
        ,
        function (err, pages) {
                console.log(`pages processed = ${pages}`);
                if (err)
                        console.error(err);
                else
                        console.log(`processed all pages :)`);
        }
);
