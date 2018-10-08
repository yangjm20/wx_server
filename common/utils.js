const request=require('request')
class Ut {
    static promiseReq(opts={}){
        return new Promise((resolve ,reject)=>{
            request(opts,(err,r,data)=>{
                if(err){
                    return reject(err);
                }
                if(r.statusCode!=200){
                    return reject(`back statusCode:${r.statusCode}`);
                }

                return resolve(data);
            })
        })
    }
}

module.exports=Ut;