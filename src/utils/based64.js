// private property

// public method for encoding

function encode(input) {
  var _keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0
  input = _utf8_encode(input)
  while (i < input.length) {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output =
      output +
      _keyStr.charAt(enc1) +
      _keyStr.charAt(enc2) +
      _keyStr.charAt(enc3) +
      _keyStr.charAt(enc4)
  }
  return output
}

// public method for decoding
function decode(input) {
  var _keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  var chr1, chr2, chr3
  var enc1, enc2, enc3, enc4
  var i = 0
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++))
    enc2 = _keyStr.indexOf(input.charAt(i++))
    enc3 = _keyStr.indexOf(input.charAt(i++))
    enc4 = _keyStr.indexOf(input.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3)
    }
  }
  output = _utf8_decode(output)
  return output
}

// private method for UTF-8 encoding
function _utf8_encode(string) {
  // string = string.replace(/\r\n/g, "\n");
  string = string.toString().replace(/\r\n/g, '\n')
  var utftext = ''
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n)
    if (c < 128) {
      utftext += String.fromCharCode(c)
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192)
      utftext += String.fromCharCode((c & 63) | 128)
    } else {
      utftext += String.fromCharCode((c >> 12) | 224)
      utftext += String.fromCharCode(((c >> 6) & 63) | 128)
      utftext += String.fromCharCode((c & 63) | 128)
    }
  }
  return utftext
}

// private method for UTF-8 decoding
function _utf8_decode(utftext) {
  var string = ''
  var i = 0
  var c = 0
  var c1 = 0
  var c2 = 0
  while (i < utftext.length) {
    c = utftext.charCodeAt(i)
    if (c < 128) {
      string += String.fromCharCode(c)
      i++
    } else if (c > 191 && c < 224) {
      c2 = utftext.charCodeAt(i + 1)
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
      i += 2
    } else {
      c2 = utftext.charCodeAt(i + 1)
      var c3 = utftext.charCodeAt(i + 2)
      string += String.fromCharCode(
        ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
      )
      i += 3
    }
  }
  return string
}
function decode1(buffer) {
  if (buffer.length < 8) throw new Error('DER sequence length is too short')
  if (buffer.length > 72) throw new Error('DER sequence length is too long')
  if (buffer[0] !== 0x30) throw new Error('Expected DER sequence')
  if (buffer[1] !== buffer.length - 2)
    throw new Error('DER sequence length is invalid')
  if (buffer[2] !== 0x02) throw new Error('Expected DER integer')

  var lenR = buffer[3]
  if (lenR === 0) throw new Error('R length is zero')
  if (5 + lenR >= buffer.length) throw new Error('R length is too long')
  if (buffer[4 + lenR] !== 0x02) throw new Error('Expected DER integer (2)')

  var lenS = buffer[5 + lenR]
  if (lenS === 0) throw new Error('S length is zero')
  if (6 + lenR + lenS !== buffer.length) throw new Error('S length is invalid')

  if (buffer[4] & 0x80) throw new Error('R value is negative')
  if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
    throw new Error('R value excessively padded')

  if (buffer[lenR + 6] & 0x80) throw new Error('S value is negative')
  if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
    throw new Error('S value excessively padded')

  // non-BIP66 - extract R, S values
  return {
    r: buffer.slice(4, 4 + lenR),
    s: buffer.slice(6 + lenR)
  }
}

function native2hex(strNative) {
  var keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  for (var i = 0; i < strNative.length; i++) {
    var c = strNative.charAt(i)
    var cc = strNative.charCodeAt(i)
    if (cc > 0xff) output += '\\u' + toHex1(cc >> 8) + toHex1(cc & 0xff)
    else output += c
  }
  return toHex(output)
}

function toHex1(n) {
  var hexChars = '0123456789ABCDEF'
  var nH = (n >> 4) & 0x0f
  var nL = n & 0x0f
  return hexChars.charAt(nH) + hexChars.charAt(nL)
}

function toHex(str) {
  var symbols = ' !"#$%&\'()*+,-./0123456789:;<=>?@'
  var loAZ = 'abcdefghijklmnopqrstuvwxyz'
  symbols += loAZ.toUpperCase()
  symbols += '[\\]^_`'
  symbols += loAZ
  symbols += '{|}~'
  var valueStr = str
  var hexChars = '0123456789abcdef'
  var text = ''
  for (var i = 0; i < valueStr.length; i++) {
    var oneChar = valueStr.charAt(i)
    var asciiValue = symbols.indexOf(oneChar) + 32
    var index1 = asciiValue % 16
    var index2 = (asciiValue - index1) / 16
    if (text != '') text += ''
    text += hexChars.charAt(index2)
    text += hexChars.charAt(index1)
  }
  return text
}

function EnBase64ThreeDes(s) {
  var r = ''
  var w = new Array()
  var hexes = new Array(
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f'
  )
  for (var i = 0; i < s.length; i++) {
    r += hexes[s.charCodeAt(i) >> 4] + hexes[s.charCodeAt(i) & 0xf]
  }
  return r
  //s是那串乱码r就是转换后的16进制字符串
}
function tounicode(data) {
  if (data == '') return '请输入汉字'
  var str = ''
  for (var i = 0; i < data.length; i++) {
    str += '\\u' + parseInt(data[i].charCodeAt(0), 10).toString(16)
  }
  return str
}
function clamp(words, sigBytes) {
  // Shortcuts
  var words = words
  var sigBytes = sigBytes

  // Clamp
  words[sigBytes >>> 2] &= 4294967295 << (32 - (sigBytes % 4) * 8)
  words.length = Math.ceil(sigBytes / 4)
}

function stringify(wordArray) {
  // Shortcuts
  var words = wordArray.words
  var sigBytes = wordArray.sigBytes
  var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

  // Clamp excess bits
  //wordArray.clamp();

  // Convert
  var base64Chars = []
  for (var i = 0; i < sigBytes; i += 3) {
    var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff
    var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff

    var triplet = (byte1 << 16) | (byte2 << 8) | byte3

    for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
      base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f))
    }
  }

  // Add padding
  var paddingChar = map.charAt(64)
  if (paddingChar) {
    while (base64Chars.length % 4) {
      base64Chars.push(paddingChar)
    }
  }

  return base64Chars.join('')
}

module.exports = {
  encode: encode,
  decode: decode,
  _utf8_decode: _utf8_decode,
  decode1: decode1,
  native2hex: native2hex,
  tounicode: tounicode,
  stringify: stringify
}
