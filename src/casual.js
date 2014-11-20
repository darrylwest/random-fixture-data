var helpers = require('./helpers'),
    exists = require('fs').existsSync;

var safe_require = function(filename) {
	if (exists(filename + '.js')) {
		return require(filename);
	}
	return {};
};

var capitalizeName = function(name) {
    var ss = name.split('_'),
        nm = ss.shift();
    
    if (ss.length === 0) {
        return name;
    }

    ss.forEach(function(s) {
        nm += s.replace(/^[a-z]/, function(m) {
            return m.toUpperCase();
        });
    });
    
    return nm ;
};

var build_casual = function() {
	var casual = helpers.extend({}, helpers);

	casual.functions = function() {
		var adapter = {};

		Object.keys(this).forEach(function(name) {
			if (name[0] === '_') {
                var nm = name.slice(1);
                adapter[ nm ] = casual[ name ];
                
                if (nm.indexOf('_') > 0) {
                    adapter[ capitalizeName( nm ) ] = casual[ name ];
                }
			}
		});

		return adapter;
	};

	var providers = [
		'address',
		'text',
		'internet',
		'person',
		'number',
		'date',
		'payment',
		'misc',
		'color'
	];

	casual.register_locale = function(locale) {
		casual.define(locale, function() {
			var casual = build_casual();

			providers.forEach(function(provider) {
				casual.register_provider(helpers.extend(
					require('./providers/' + provider),
					safe_require(__dirname + '/providers/' + locale + '/' + provider)
				));
			});

			return casual;
		});
	}

	var locales = [
		'en_US',
		'ru_RU',
		'uk_UA',
		'nl_NL',
		'en_CA',
		'it_CH'
	];

	locales.forEach(casual.register_locale);
    
	return casual;
};

// create mixed case methods
var build = function() {
    // Default locale is en_US
    var casual = build_casual().en_US;
    
    Object.keys( casual ).forEach(function(key) {
        if (key[0] === '_') {
            var name = key.slice(1),
                nm;
            
            if (name.indexOf('_') > 0) {
                nm = capitalizeName( name );
                casual.define( nm, function() {
                    return casual[ name ];
                });
            }
        }
    });
    
    return casual;
};

module.exports = build();
