
var express = require('express');
var request=require('request')
var router = express.Router();
var xmlreader=require('xmlreader');
const MD5 = require('blueimp-md5')

const {LessonModel} = require('../db/db_test')





router.get('/getPrePayId', function (req, res) {

    const {openId,lessonId,godsTitle,godsPrice} = req.query;

    var appid = "wxa372f08bd326c566"; //小程序ID
    var mch_id = "1516099401"; //商户号
    var body; // 商品描述

    var nonce_str = Math.random().toString(36).substr(2, 30)//随机字符串
    var sign;//签名
    var total_fee;//标价金额 分
    var out_trade_no = nonce_str+1;// 商户订单号

    var spbill_create_ip = '192.168.1.100' // 获取客户端ip
    var notify_url = 'https://www.talltree.com.cn:3000/api/v1/getPrepayId' // 支付成功的回调地址  可访问 不带参数
    var trade_type = 'JSAPI';
    var key = "hewhrhhfuwh123186jasfjaojoja98fo";

    var timestamp = String(Math.round(new Date().getTime() / 1000)); // 当前时间

    if(lessonId=="-1"){
            console.log("会员2999")
            body=godsTitle
            total_fee=godsPrice*100;
            var ret = [{
                appid: appid,
                body: body,
                mch_id: mch_id,
                nonce_str: nonce_str,
                notify_url: notify_url,
                openid: openId,
                out_trade_no: out_trade_no,
                spbill_create_ip: spbill_create_ip,
                total_fee: total_fee,
                trade_type: trade_type
            }
            ]
            //签名

            sign = signMd5(ret[0], key);

            var bodyData = '<xml>';
            bodyData += '<appid>' + appid + '</appid>';  // 小程序ID
            bodyData += '<body>' + body + '</body>'; // 商品描述
            bodyData += '<mch_id>' + mch_id + '</mch_id>'; // 商户号
            bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
            bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
            bodyData += '<openid>' + openId + '</openid>'; // 用户标识
            bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
            bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
            bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
            bodyData += '<trade_type>' + trade_type + '</trade_type>'; // 交易类型 小程序取值如下
            bodyData += '<sign>' + sign + '</sign>';
            bodyData += '</xml>';

            // 微信小程序统一下单接口

            var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
            request({url: urlStr, method: 'POST', body: bodyData}, function (err, response, body) {

                if (!err && response.statusCode == 200) {


                    xmlreader.read(body.toString("utf-8"), function (errors, response) {
                        if (null !== errors) {
                            console.log(errors)
                            return;
                        }
                        //console.log('长度===', response.xml.prepay_id.text().length);
                        var prepay_id = response.xml.prepay_id.text();
                        //console.log('解析后的prepay_id==', prepay_id);                  //将预支付订单和其他信息一起签名后返回给前端
                        var package='prepay_id='+prepay_id;
                        let finalsign = paysignjsapifinal(appid, prepay_id, nonce_str, timestamp, key);
                        console.log(finalsign)
                        res.json({
                            'appId': appid,
                            'nonceStr': nonce_str,
                            'package': package,
                            'signType':'MD5',
                            'timeStamp': timestamp,
                            'sign': finalsign
                        });

                    })
                }


        })
    }else{
        console.log("单视频购买")
        LessonModel.find( async function (err,lessons) {
            console.log(lessons[parseInt(lessonId)])
            body=lessons[parseInt(lessonId)].title;
            total_fee=parseInt(lessons[parseInt(lessonId)].price)*100;
            var ret = [{
                appid: appid,
                body: body,
                mch_id: mch_id,
                nonce_str: nonce_str,
                notify_url: notify_url,
                openid: openId,
                out_trade_no: out_trade_no,
                spbill_create_ip: spbill_create_ip,
                total_fee: total_fee,
                trade_type: trade_type
            }
            ]
            //签名

            sign = signMd5(ret[0], key);

            var bodyData = '<xml>';
            bodyData += '<appid>' + appid + '</appid>';  // 小程序ID
            bodyData += '<body>' + body + '</body>'; // 商品描述
            bodyData += '<mch_id>' + mch_id + '</mch_id>'; // 商户号
            bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
            bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
            bodyData += '<openid>' + openId + '</openid>'; // 用户标识
            bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
            bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
            bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
            bodyData += '<trade_type>' + trade_type + '</trade_type>'; // 交易类型 小程序取值如下
            bodyData += '<sign>' + sign + '</sign>';
            bodyData += '</xml>';

            // 微信小程序统一下单接口

            var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
            request({url: urlStr, method: 'POST', body: bodyData}, function (err, response, body) {

                if (!err && response.statusCode == 200) {


                    xmlreader.read(body.toString("utf-8"), function (errors, response) {
                        if (null !== errors) {
                            console.log(errors)
                            return;
                        }
                        //console.log('长度===', response.xml.prepay_id.text().length);
                        var prepay_id = response.xml.prepay_id.text();
                        //console.log('解析后的prepay_id==', prepay_id);                  //将预支付订单和其他信息一起签名后返回给前端
                        var package='prepay_id='+prepay_id;
                        let finalsign = paysignjsapifinal(appid, prepay_id, nonce_str, timestamp, key);
                        console.log(finalsign)
                        res.json({
                            'appId': appid,
                            'nonceStr': nonce_str,
                            'package': package,
                            'signType':'MD5',
                            'timeStamp': timestamp,
                            'sign': finalsign
                        });

                    })
                }
            })

        })
    }
















})



function returnPrePayId() {

}
function paysignjsapifinal(appid,prepay_id, nonce_str, timestamp, key){
    var stringB="";
    stringB=('appId='+appid+'&nonceStr='+nonce_str+'&package=prepay_id='+prepay_id+'&signType=MD5'+'&timeStamp='+timestamp+'&key='+key);
    console.log(stringB);
    return MD5(stringB)
}

function signMd5(res, key1) {

    var stringA = "";
    for (var key in res) {
        stringA += (key + '=' + res[key] + '&');
    }
    stringA += ('key=' + key1);
    var sign = MD5(stringA).toUpperCase();
    return sign;
}

module.exports = router;