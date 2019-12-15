const MD5 = require('crypto-js/md5');
const AES = require('crypto-js/aes');
const ENC_Utf8 = require('crypto-js/enc-utf8');
const PAD = require('crypto-js/pad-pkcs7');
const MODE = require('crypto-js/mode-cfb');


module.exports = function(data, key, tab) {
  const _md5 = MD5(key).toString();
  const enc_Utf8_0_16 = ENC_Utf8.parse(_md5.substring(0, 16));
  const enc_Utf8_16 = ENC_Utf8.parse(_md5.substring(16));
  if (tab) {
    return AES.decrypt(data, enc_Utf8_16, {
      iv: enc_Utf8_0_16,
      padding: PAD,
    }).toString(ENC_Utf8);
  }
  return AES.encrypt(data, enc_Utf8_16, {
    iv: enc_Utf8_0_16,
    mode: MODE,
    padding: PAD,
  }).toString();
};
/**
 * secret(data.data, data.key, true)
 * @param a 加密文体
 * @param b 密钥
 * @param c 是否切换解密模式
 * @returns {*}
 */

/* function secret(a, b, c) {
  b = CryptoJS.MD5(b).toString();
  var d = CryptoJS.enc.Utf8.parse(b.substring(0, 16));
  var e = CryptoJS.enc.Utf8.parse(b.substring(16));
  if (c) {
    return CryptoJS.AES.decrypt(a, e, {iv: d, padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
  }
  return CryptoJS.AES.encrypt(a, e, {iv: d, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString();
}*/
