// ==UserScript==
// @name         overScrobblingDetector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  quickly visualize duplicated srobbles, works best in english version of the website
// @include     https://www.last.fm/*/user/*/library/music/*/_/*
// @include     https://www.last.fm/user/*/library/music/*/_/*
// @include     https://www.last.fm/user/*/library
// @include     https://www.last.fm/user/*/library?page=*
// @author       https://github.com/wozacosta
// @grant        GM_addStyle
// @require      http://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==


// making no use of Date() for now. next patch


GM_addStyle ( "tr.samemonth-jan td {background-color: #AFF0FF !important; }");
GM_addStyle ( "tr.samemonth-feb td {background-color: #01FF70 !important; }");
GM_addStyle ( "tr.samemonth-mar td {background-color: #FFDC00 !important; }");
GM_addStyle ( "tr.samemonth-apr td {background-color: #b1cbbb !important; }");
GM_addStyle ( "tr.samemonth-may td {background-color: #f7cac9 !important; }");
GM_addStyle ( "tr.samemonth-jun td {background-color: #80ced6 !important; }");
GM_addStyle ( "tr.samemonth-jul td {background-color: #ffef96 !important; }");
GM_addStyle ( "tr.samemonth-aug td {background-color: #d5f4e6 !important; }");
GM_addStyle ( "tr.samemonth-sep td {background-color: #e4d1d1 !important; }");
GM_addStyle ( "tr.samemonth-oct td {background-color: #ddeedd !important; }");
GM_addStyle ( "tr.samemonth-nov td {background-color: #f4e1d2 !important; }");
GM_addStyle ( "tr.samemonth-dec td {background-color: #b8a9c9 !important; }");
GM_addStyle ( "tr.sameday td.chartlist-timestamp span {color: red !important; font-weight: bold !important; background-color: black !important}");
GM_addStyle ( "td.deletion {cursor: pointer !important; }");
GM_addStyle ( "td.chartlist-timestamp, td.chartlist-album span a, td.chartlist-duration {color: black !important; }");

(function() {
    'use strict';

    if (!String.prototype.trim) {
        console.log('no trim found');
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    }

    let getDateObject = function (dateText){   // when not current year ---> 31 Dec 2016, 1:58pm
        let dateTextSplit = dateText.split(',');
        let date = dateTextSplit[0].trim();
        let time = "";
        if (dateTextSplit.length === 1){ // if current year, split[0] kept the hour  --->         18 Feb 6:32am
            time = date.split(' ')[2].trim();
            date = date.slice(0,-(time.length)).trim();
        }else{
            time = dateTextSplit[1].trim();
        }
        return {
            fullDate: dateText,
            date,
            month: date.split(' ')[1].trim(),
            time,
        };
    };
    // check if in  Scrobbles part of the library
    if (document.querySelector('#mantle_skin .secondary-nav-item-link--active').innerText.toLowerCase().includes('scrobbles')){
        console.log('in scrobble tab of library');

        let songNames = [...document.querySelectorAll('.chartlist-name')].map((songNameEl) => {
            return songNameEl.innerText.trim();
        });

        let songNamesElements = [...document.querySelectorAll('.chartlist-name')].map((songEl) => {
            return songEl.parentElement; 
        });

        for (let i = 1; i < songNames.length; i++){
            // same time
            if (songNames[i] === songNames[i-1]){
                songNamesElements[i].className += songNamesElements[i].classList.contains("sameday") ? "" : " sameday "; //TODO: rename sameday here to same-consecutive-song
                songNamesElements[i - 1].className += songNamesElements[i - 1].classList.contains("sameday") ? "" : " sameday ";
            }
        }

    }else{
        console.log('in tracks tab of library');

        let datesSongElements = [...document.querySelectorAll('.chartlist-timestamp')].filter((el) => {
            return (el.innerText && !el.innerText.trim().includes('ago'));
        });
        let datesSong = datesSongElements.map((dateSong) => {
            let dateSongText = dateSong.innerText.trim();
            return  getDateObject(dateSongText);
        });
        datesSongElements = [...document.querySelectorAll('.chartlist-timestamp')].map((el) => el.parentElement);
        datesSongElements.forEach((el) => {
            let delBtn = $(el.querySelector('form button'));

            let delTd = document.createElement("td");
            let delDiv = document.createElement("div");
            let t = document.createTextNode("unscrobble");
            delDiv.appendChild(t);
            delTd.appendChild(delDiv);
            delTd.className = "deletion";
            delTd.style.width = "10%";
            delTd.style.padding = "3px 4px 3px 20px";
            delTd.onclick = (e) => {
                e.preventDefault();
                delBtn.click();
            };
            el.appendChild(delTd);
        });
        let nbSongs = +datesSongElements.length;
        for (let i = 1; i < nbSongs; i++){
            // same time
            if (datesSong[i].fullDate === datesSong[i-1].fullDate){
                datesSongElements[i].style.color = datesSongElements[i-1].style.color = 'red';
                datesSongElements[i].style.fontWeight = datesSongElements[i-1].style.fontWeight = 'bold';
            }
            // same day
            if (datesSong[i].date === datesSong[i - 1].date){
                datesSongElements[i].className += datesSongElements[i].classList.contains("sameday") ? "" : " sameday ";
                datesSongElements[i - 1].className += datesSongElements[i - 1].classList.contains("sameday") ? "" : " sameday ";
            }
            // same month
            if (datesSong[i - 1].month === datesSong[i].month) {

                let monthClass = `samemonth-${datesSong[i].month.toLowerCase()}`;
                datesSongElements[i].className += datesSongElements[i].classList.contains(monthClass) ? "" : ` ${monthClass} `;
                datesSongElements[i - 1].className += datesSongElements[i - 1].classList.contains(monthClass) ? "" :` ${monthClass} `;

                datesSongElements[i - 1].style.border = datesSongElements[i].style.border =  "solid blue";
                if (i - 2 < 0 || datesSong[i-2].month !== datesSong[i].month){
                    datesSongElements[i-1].style.borderWidth = "2px 2px 0px 2px";
                }else{
                    datesSongElements[i-1].style.borderWidth = "0px 2px 0px 2px";
                }
                if (i + 1 >= nbSongs || datesSong[i+1].month !== datesSong[i].month){
                    datesSongElements[i].style.borderWidth = "0px 2px 2px 2px";
                }else{
                    datesSongElements[i].style.borderWidth = "0px 2px 0px 2px";
                }
            }}
    }
})();