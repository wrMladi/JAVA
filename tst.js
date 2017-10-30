var cookies = {
 topDomain: function(domain) {
    if (!domain) {
        return null;
    }
    var parts = domain.split('.');
    if (parts.length > 1) {
        var result = parts[ parts.length - 2 ] + '.' + parts[ parts.length - 1 ];
        if (result.indexOf(':') + 1){
            return result.substr(0, result.length-5)
        }
        else {
            return result
        }
    }
    return '';
},

set: function (name, value, exmins) {
    var exdate = new Date();
        exdate.setTime(exdate.getTime() + (60*exmins*1000)); //time in milliseconds
        var c_value = encodeURIComponent(value) + ((exmins == null) ? "" : "; expires=" + exdate.toUTCString());
        var top_domain = cookies.topDomain(window.location.hostname);
        var cookie = name + "=" + c_value + "; path=/" + "; domain=" + (top_domain ? '.'+top_domain : '');
        document.cookie = cookie;
    },

    get: function (name){
        var val = document.cookie;
        var start = val.indexOf(" " + name + "=");
        if (start == -1) {
            start = val.indexOf(name + "=");
        }
        if (start == -1) {
            val = null;
        }else{
            start = val.indexOf("=", start) + 1;
            var end = val.indexOf(";", start);
            if (end == -1) {
                end = val.length;
            }
            val = decodeURIComponent(val.substring(start, end));
        }
        return val;
    },

    //Deletes a cookie @param name cookie name to delete
    delete: function (name){
        cookies.set(name, null, -10);
    }

};



function getQueryStringValue (key) {  
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}

function generateClientIdSelf() {
    return Math.floor(Math.random() * 0x7FFFFFFF) + "." + Math.floor(Date.now() / 1000);
}

if (cookies.get('pzvnmnepzvn_clid')) {
    var clidctrk=cookies.get('pzvnmnepzvn_clid');
} else {
    var clidctrk=generateClientIdSelf();
    cookies.set('pzvnmnepzvn_clid', clidctrk, '10')
}








;(function(root, factory) {

    "use strict";
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.sipuniCalltracking = factory();
    }
}(this, function() {

    "use strict";

/**
 * Default parameters
 */
 var default_options = {
    targets: ['.c333t_phone'],
    callback: null,
    pattern: '+# (###) ###-##-##',
    sources: {
        'organic':{'ref':/:\/\/(?:www\.)?(google|yandex|mail\.ru|search\.tut\.by|rambler|bing|yahoo)(?:\.(\w+))?/ig},
        'social':{'ref':/:\/\/[^\/]*(twitter|t\.co|facebook|linkedin|vk\.com|odnoklassniki)/ig},
        'email':{'utm_source':'email'},
        'adwords':{'dst': 'utm_source=google&utm_medium=cpc'},
        'ydirect_utm':{'utm_source':'direct.yandex.ru'},
        'ydirect_openstat':{'dst': function(subject){
            var o = query.getRawParam(subject, '_openstat');
            return (o && a2b(o).indexOf('direct.yandex.ru')>-1);
        }}
    },
    cookie_key: 'pzvnmnepzvn',
    cookie_key_clid: 'pzvnmnepzvn_clid',
    cookie_ttl_minutes: 15
};



/**
 * querySelectorAll for all browsers
 */
 var select = document.querySelectorAll || function(selector) {
    var style = document.styleSheets[0] || document.createStyleSheet();
    style.addRule(selector, 'foo:bar');
    var all = document.all, resultSet = [];
    for (var i = 0, l = all.length; i < l; i++) {
        if (all[i].currentStyle.foo === 'bar') resultSet[resultSet.length] = all[i];
    }
    style.removeRule(0);
    return resultSet;
};



/**
 * Base64 decode for all browsers
 */
 var a2b = window.atob || function a2b(a) {
    var b, c, d, e = {}, f = 0, g = 0, h = "", i = String.fromCharCode, j = a.length;
    for (b = 0; 64 > b; b++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b)] = b;
        for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
            return h;
    };


/**
 * Type detection methods
 */
 var type = {
    isArray: Array.isArray || function(o) {
        return (
            typeof o === 'object' && Object.prototype.toString.call(o) === '[object Array]'
            );
    },

    isDictionary: function(o) {
        return (
            typeof o === 'object' && Object.prototype.toString.call(o) === '[object Object]'
            );
    },

    isRegExp: function(o) {
        return (
            Object.prototype.toString.call(o) === '[object RegExp]'
            );
    },

    isFunction: function(o) {
        return (
            typeof o === 'function' && Object.prototype.toString.call(o) === '[object Function]'
            );
    }
};

// Query related methods
// Получает запрос на поиск параметра и отдает по регулярке
var query = {
    getRawParam: function(url, name){
        var regex = new RegExp(name+"=([^&]+)");
        var found = regex.exec(url);
        return (found !== null ? found[1] : null);
    },
    getParam: function(url, name){
        var found = query.getRawParam(url, name);
        return (found !== null ? decodeURIComponent(found) : null);
    }
};


/**
 * Parameters manipulation methods
 */
 var dict = {
    /**
     * Updated one dictionary with the elements of another one.
     * @param dict_dst destination dictionary
     * @param dict_src source dictionary
     */
     update: function  (dict_dst, dict_src) {
        var is_array = type.isArray(dict_src);
        dict_dst = dict_dst || (is_array?[]:{});
        for (var prop in dict_src) {
            var v = dict_src[prop];
            if (type.isDictionary(v)) {
                var d = dict_dst.hasOwnProperty(prop) ? dict_dst[prop] : null;
                dict_dst[prop] = dict.update(d, v);
            } else {
                dict_dst[prop] = v;
            }
        }
        return dict_dst;
    },

    /**
     * Merges two dictionaries and creates a new dictionary with results.
     * @param dict1 first dictionary
     * @param dict2 second dictionar
     * @returns object A new dictionary containing both dictionaries
     */
     merge: function(dict1, dict2){
        var result = {};
        dict.update(result, dict1);
        dict.update(result, dict2);
        return result;
    },

    /**
     * Returns dictionary keys
     * @param dict dictionary to search for
     * @returns Array An array with keys
     */
     keys: function(dictionary){
        var keys = [];
        for (var key in dictionary) {
            if (dictionary.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    },

    /**
     * Returns a value from the dictionary or default value
     * @param dictionary
     * @param key
     * @param default_value
     * @returns a value of default_value
     */
     getVal: function(dictionary, key, default_value) {
        if (!dictionary || !dictionary.hasOwnProperty(key))
            return default_value;
        return dictionary[key];
    }

};


var actions = {
    place: function(targets, value) {
        for (var i = 0; i < targets.length; i++) {
            targets[i].innerHTML = value;
        }
    },

    getTargets: function(selectors) {
        return select.call(document, selectors);
    },

    execCallback: function(phone, src_url, dst_url, options, template) {
        var cb = dict.getVal(options, 'callback', null);
        if (cb && type.isFunction(cb)){
            return cb(phone, src_url, dst_url, options, template);
        }
        return null;
    }
};

/**
 * Finds a phone number matching conditions
 */
 var tracker = {

    find: function(sources, phones, src_url, dst_url){
        for (var i=0; i<phones.length; i++){
            var phone = phones[i];
            var src = phone['src'];

            if(sources.hasOwnProperty(src)){

                if(tracker.match(sources[src], src_url, dst_url)){
                    return phone;
                }
            }
        }

        return null;
    },

    match: function(source, src_url, dst_url){

        var subject=null;
        var condition = null;
        var keys = dict.keys(source);

        for(var i=0; i<keys.length; i++){

            var key = keys[i];

            if( key.indexOf('utm_')>-1 ){
                subject = query.getParam(dst_url, key);
                condition = source[key];
            }else if( key=='ref' ){
                subject = src_url;
                condition = source[key];
            }else if( key == 'dst' ){
                subject = dst_url;
                condition = source[key];
            }
        }

        if(!subject || !condition){
            return false;
        }

        return (
            (type.isRegExp(condition) && condition.exec(subject)) ||
            (typeof(condition)=='string' && subject.indexOf(condition)>-1) ||
            (type.isFunction(condition) && condition(subject))
            );
    },

    findBySrc: function(phones, src){
        for (var i=0; i<phones.length; i++){
            var phone = phones[i];
            if (phone.hasOwnProperty('src') && phone['src'] == src){
                return phone;
            }
        }
        return null;
    }
};

/**
 * Phone number formatting support
 */
 var template = {

    /**
     * Formats the phone number, removes a plus sign for the 8-800 numbers.
     * @param string phone number
     * @param string pattern, 9 as a placeholder. E.g. +9 (999) 999-99-99
     * @returns {string} formatter phone number
     */
     format_number: function (num, pattern){

        if(num.toString().match(/^8800/) && pattern && pattern[0]=='+'){
            pattern = pattern.replace(/^\+/, '');
        }
        return template.format(num, pattern);
    },

    /**
     * Formats the phone number using the pattern
     * @param string phone number
     * @param string pattern, 9 as a placeholder. E.g. +9 (999) 999-99-99
     * @returns {string} formatter phone number
     */
     format: function (num, pattern){

        if(!(typeof(num) === "string")){
            num = num.toString();
        }

        if(!num)
            return '';

        if(typeof(pattern) === "undefined" || !pattern)
            return num;

        var arr_res=[];
        var num_counter = num.length-1;

        for(var i=pattern.length-1; i>=0; i--){
            var s = pattern[i];
            if(s=='#'){
                if(num_counter>=0){
                    arr_res.push(num[num_counter--]);
                }
            }
            else{
                arr_res.push(s);
            }
        }
        return arr_res.reverse().join('');
    }
};


return function(user_options, wnd) {

    var options = dict.merge(default_options, user_options);
    var phone = null;
    var sources = options['sources'];
    var phones = options['phones'];
    var src_url = wnd.document.referrer;
    var dst_url = wnd.location.href;

    // find from cookies first
    var existing_src = cookies.get(options['cookie_key']);
    if(existing_src && sources.hasOwnProperty(existing_src)){

        phone = tracker.findBySrc(phones, existing_src);

    }

    // find from urls
    if( phone === null ){

        phone = tracker.find(
            sources,
            phones,
            src_url,
            dst_url);

// store in cookies
if(phone !== null){
    cookies.set(options['cookie_key'], phone['src'], options['cookie_ttl_minutes']);
    var sourc = phone['src'];
    var sessionid = cookies.get('_ga');
    var refererrr = escape(src_url);
    var dsturl = escape(dst_url);
    var utm_source = getQueryStringValue("utm_source");
    var utm_medium = getQueryStringValue("utm_medium");
    var utm_campaign = getQueryStringValue("utm_campaign");
    var utm_term = getQueryStringValue("utm_term");
    var alls = escape(window.location.search);

    (function(d, s, h) {
        var p = d.location.protocol == "https:" ? "https://" : "http://";
        var u = '/start_session.php?referer='+refererrr+'&p_clid='+clidctrk+'&destination='+dsturl+'&sourc='+sourc+'&sessionid='+sessionid+'&st_id=".$project_id."&utm_source='+utm_source+'&utm_medium='+utm_medium+'&utm_campaign='+utm_campaign+'&utm_term='+utm_term+'&alls='+alls;
        var js = d.createElement(s);
        js.async = 0;
        js.src = p + h + u;
        var js2 = d.getElementsByTagName(s)[0];
        js2.parentNode.insertBefore(js, js2);
    })(document, 'script', 'pozvoni-mne-pozvoni.ru');


}
}

    // insert phone numbers
    if (phone){
    // alert(JSON.stringify(phone));
    var targets = options['targets'];
    var numbers = phone['phone'];
    for(var i=0, len=Math.min(targets.length, numbers.length); i<len; i++){
        var elements = actions.getTargets(targets[i]);
        var number = template.format_number(numbers[i], options['pattern']);
        actions.place(elements, number);
    }
}

actions.execCallback(phone, src_url, dst_url, options, template);


};

}));




(function(d, s, h) {
    var p = d.location.protocol == "https:" ? "https://" : "http://";
    var u = '/numms_return.php?clidctrk='+clidctrk;
    var js = d.createElement(s);
    js.async = 0;
    js.src = p + h + u;
    var js2 = d.getElementsByTagName(s)[0];
    js2.parentNode.insertBefore(js, js2);
})(document, 'script', 'pozvoni-mne-pozvoni.ru');