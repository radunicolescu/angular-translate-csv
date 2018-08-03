﻿var path = require('path');
var Config = require(path.resolve(process.cwd(), process.argv[2]));

module.exports = {
    processCsv: processCsv
}

function csvToArray(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (Config.csvFieldSeparator === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
};

function processCsv(fileContents) {
    if (!fileContents) {
        return {};
    }
    var results = [];
    var regex = new RegExp('([^' + Config.csvEol + ']*)' + Config.csvEol, 'g');
    
    for (var i = 0; i < Config.csvEolAlt.length; i++) {
        fileContents = fileContents.split(Config.csvEolAlt[i]).join(Config.csvEol);
    }

    var languages = regex.exec(fileContents)[1].split(Config.csvFieldSeparator);
    languages.shift();
    var to = {};

    for (var j = 0; j < languages.length; j++) {
        to[languages[j]] = {};
    }
    
    while ((results = regex.exec(fileContents)) !== null) {
        for (var str in Config.jsonReplace) {
            if (Config.jsonReplace.hasOwnProperty(str)) {
                results[1] = results[1].replace(new RegExp(str, 'g'), Config.jsonReplace[str]);
            }
        }
        
        var translations = csvToArray(results[1])//.split(Config.csvFieldSeparator);
        var nss = translations[0].slice(0, translations[0].lastIndexOf('.')).split('.');
        var id = translations[0].slice(translations[0].lastIndexOf('.') + 1);
        translations.shift();
        for (var languageIndex = 0; languageIndex < languages.length; languageIndex++) {
            var currentPointer = to[languages[languageIndex]];
            
            for (var nsIndex = 0; nsIndex < nss.length; nsIndex++) {
                if (currentPointer[nss[nsIndex]] === undefined) {
                    currentPointer[nss[nsIndex]] = {};
                }
                
                currentPointer = currentPointer[nss[nsIndex]];
            }

            if (!Config.jsonIgnoreEmptyString || translations[languageIndex] !== '') {
                currentPointer[id] = translations[languageIndex];
            }
        }
    }
    
    return to;
}
