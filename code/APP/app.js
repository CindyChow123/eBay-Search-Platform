import favors from './db.mjs';
import express from "express";
import axios from "axios";
import OAuthToken from './ebay_oauth_token.js';
import path from 'path';
const app = express()
// const port = 3000
app.use(express.static('client/dist/client/'))

let app_id = 'XinyiZho-SearchEv-PRD-a72bbdc3d-76241c35'
let cert_id = 'PRD-72bbdc3d190e-2d7f-4ff0-a9e2-2b55'
const client_id = app_id;
const client_secret = cert_id;
const oauthToken = new OAuthToken(client_id, client_secret);

app.get('/', function(req,res) {
    res.sendFile(path.resolve('client/dist/client/index.html'));
    // res.send("<h1>Hello</h1>")
});

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin",  
               "http://localhost:4200"); 
    res.header("Access-Control-Allow-Headers",  
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"); 
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");

    next(); 
}); 

app.get('/getZipCode',(req,res)=>{
    let data={
        postalcode_startsWith:req.query.start,
        maxRows:5,
        username:'xinyi223',
        country:'US'
    }
    axios.get('http://api.geonames.org/postalCodeSearchJSON',{
        params: data
    }).then(function(r){
        res.send(r.data)
    }).catch(function(err){
        res.send({postalCodes:[]})
        console.log(err)
    })
})

app.get('/getSearchResult', (req,res)=>{
    console.log(req.query)
    let data = req.query
    let payload = {
        'OPERATION-NAME':'findItemsAdvanced',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': app_id,
        'RESPONSE-DATA-FORMAT':'JSON',
        'REST-PAYLOAD':'true',
        'keywords':data['keywords'],
        'buyerPostalCode':data['buyerPostalCode'],
        'categoryId':data['categoryId'],
        'paginationInput.entriesPerPage':'50',
        'outputSelector(0)':'SellerInfo',
        'outputSelector(1)':'StoreInfo'
    }
    let itemFilter = data['itemFilter']
    for(let i = 0; i<itemFilter.length;i++){
        let cur = itemFilter[i]
        if (Array.isArray(cur['value'])){
            payload[`itemFilter(${i}).name`] = cur['name']
            for(let j = 0;j<cur['value'].length;j++){
                payload[`itemFilter(${i}).value(${j})`]=cur['value'][j]
            }
        }else{
            payload[`itemFilter(${i}).name`] = cur['name']
            payload[`itemFilter(${i}).value`] = cur['value']
        }
    }
    let r = axios.get('https://svcs.ebay.com/services/search/FindingService/v1',{params:payload})
    .then(function(result){
        res.send(result.data.findItemsAdvancedResponse)
    }).catch(function(err){
        res.send(err)
    })
})

app.get('/getAllDetail', (req, res)=>{
    let reqData = req.query
    let payload_similar = {
        "OPERATION-NAME":"getSimilarItems",
        "SERVICE-NAME":"MerchandisingService",
        "SERVICE-VERSION":"1.1.0",
        "CONSUMER-ID":app_id,
        "RESPONSE-DATA-FORMAT":"JSON",
        "REST-PAYLOAD":null,
        itemId:reqData.itemid,
        maxResults:20
    }
    let payload_photo =  {
        q:reqData.q,
        cx:"c04b4d2774eba418b",
        imgSize:"huge",
        num:8,
        searchType:"image",
        key:"AIzaSyCezwDBIreFflDllPS8GRIUjDLE-84bvSc"
    }
    let payload_details = {
        callname:'GetSingleItem',
        responseencoding: 'JSON',
        appid: app_id,
        siteid: '0',
        version: '967',
        ItemId: reqData.itemid,
        IncludeSelector:'Description,Details,ItemSpecifics'
    }
    oauthToken.getApplicationToken()
    .then((accessToken) => {
        let header = {}
        header["X-EBAY-API-IAF-TOKEN"] = accessToken
        axios.all([
            axios.get("https://svcs.ebay.com/MerchandisingService",{
                params:payload_similar
            }),
            axios.get("https://www.googleapis.com/customsearch/v1",{
                params:payload_photo
            }),
            axios.get("https://open.api.ebay.com/shopping",{
                headers:header,
                params:payload_details
            })
        ]).then(axios.spread((data_similar, data_photo,  data_details)=>{
            let res_data = {
                "similarAPI":data_similar.data.getSimilarItemsResponse.itemRecommendations,
                "photoAPI": data_photo.data,
                "detailAPI":data_details.data
            }
            res.send(res_data)
        })).catch(function(err){
            res.send(err)
        })
    })
    
})

app.get('/getSimilar', (req, res)=>{
    let reqData = req.query
    let payload = {
        "OPERATION-NAME":"getSimilarItems",
        "SERVICE-NAME":"MerchandisingService",
        "SERVICE-VERSION":"1.1.0",
        "CONSUMER-ID":app_id,
        "RESPONSE-DATA-FORMAT":"JSON",
        "REST-PAYLOAD":null,
        itemId:reqData.itemid,
        maxResults:20
    }
    axios.get("https://svcs.ebay.com/MerchandisingService",{
        params:payload
    }).then(function(result){
        res.send(result.data.getSimilarItemsResponse.itemRecommendations)
    }).catch(function(err){
        res.send(err)
    })
})

app.get('/getPhotos', (req, res)=>{
    let reqData = req.query
    let payload = {
        q:reqData.q,
        cx:"c04b4d2774eba418b",
        imgSize:"huge",
        num:8,
        searchType:"image",
        key:"AIzaSyCezwDBIreFflDllPS8GRIUjDLE-84bvSc"
    }
    axios.get("https://www.googleapis.com/customsearch/v1",{
      params:payload
    }).then(function(result){
        res.send(result.data)
    }).catch(function(err){
        res.send(err)
    })
})

app.get('/getDetail', (req, res, next)=>{
    let reqData = req.query
    let payload = {
        callname:'GetSingleItem',
        responseencoding: 'JSON',
        appid: app_id,
        siteid: '0',
        version: '967',
        ItemId: reqData.itemid,
        IncludeSelector:'Description,Details,ItemSpecifics'
    }
    let header = {}

    oauthToken.getApplicationToken()
    .then((accessToken) => {
        // console.log(accessToken)
        header["X-EBAY-API-IAF-TOKEN"] = accessToken
        axios.get("https://open.api.ebay.com/shopping",{
            headers:header,
            params:payload
        }).then(function(result){
            res.send(result.data)
        }).catch(function(err){
            res.send(err)
        })
    })
    .catch((error) => {
        console.error('OAUTH token Error:', error);
    });
    
})

app.get('/getWishList', async(req, res, next)=>{
    try{
        const data = favors.find({})
        let result = []
        for await (const doc of data) {
            result.push(doc)
        }
        res.send(result)
    } catch (error) {
        return next(error)
    }
})

app.get('/getWishIds', async(req, res, next)=>{
    let result = {}
    try{
        const data_ids = favors.find({}).project({itemId:1, _id:0})
        let temp = []
        for await (const doc of data_ids) {
            temp.push(doc)
        }
        result.ids = temp
    } catch (error) {
        return next(error)
    }
    res.send(result)
})

app.get('/addWish', async(req, res, next)=>{
    // console.log(req.query)
    delete req.query.idx
    req.query.inWish = 'remove_shopping_cart'
    let result={}
    result.insertRes = await favors.insertOne(req.query);
    try{
        const data_ids = favors.find({}).project({itemId:1, _id:0})
        let temp = []
        for await (const doc of data_ids) {
            temp.push(doc)
        }
        result.ids = temp
    } catch (error) {
        return next(error)
    }
    res.send(result).status(204);
})

app.get('/removeWish', async(req, res, next)=>{
    let result={}
    result.deleteRes = await favors.deleteOne({itemId:req.query.itemId});
    try{
        const data_ids = favors.find({}).project({itemId:1, _id:0})
        let temp = []
        for await (const doc of data_ids) {
            temp.push(doc)
        }
        result.ids = temp
    } catch (error) {
        return next(error)
    }
    res.send(result).status(204);
})

app.get('/submit',(req,res)=>{
    response = {
        first_name:"abc",
        last_name:"cde"
     };
    //  console.log(response);
     res.end(JSON.stringify(response));
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})