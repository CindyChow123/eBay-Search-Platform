import { Component } from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {AfterContentInit} from '@angular/core';
import axios from 'axios';
import * as $ from 'jquery';
import * as qs from 'qs'
import { PostCode, SearchRow, Form, Categories, searchReturns, Item, details } from './format';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css',"../../scss/custom.min.css"],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterContentInit {
  categeryList:Categories= {
    "Art":550,"Baby":2984,"Books":267, "Clothing, Shoes & Accessories":11450,"Computers/Tablets & Networking":58058,
    "Health & Beauty":26395, "Music":11233, "Video Games & Consoles":1249
  };

  tableHeads = ['#', 'Image', 'Title', 'Price', 'Shipping', 'zip', 'Favorite']
  tableData:SearchRow[] = []
  searchData:SearchRow[] = []
  pageIdx:number[] = []
  curPage = 0
  cnt = 1
  kword=""

  wishData:SearchRow[] = []
  wishcnt = 1

  locDisable = true;
  searchDisable = true;
  loc = ''
  zipcodes:Array<String> = []
  cusZip = ''
  localChecked = false
  freeChecked = false
  newChecked = false
  useChecked = false
  unspChecked = false
  locopt = "from-cur"
  maxDist = 10
  category = "All"
  root_url = ''
  // root_url = "http://localhost:3000"
  showResultTable = false
  showResultPage = true
  // showNoResult = false
  showNoResultWish = false
  showNoResultSearch = false
  detailBtnDisabled = true
  showWishList = false
  loading = false

  fromcurcheck = true
  fromothcheck = false

  wishids:string[]=[]

  resultDetail:details={
    itemid:"",
    itemidx:-1,
}
  wishDetail:details={
    itemid:"",
    itemidx:-1,
}
  emptyDetail:details={
    itemid:"",
    itemidx:-1,
}
  emptyDetailString=JSON.stringify(this.emptyDetail)

  tempResultid=""
  tempWishid=""

  setResult(detail:details){
    this.resultDetail = detail
  }

  setWish(detail:details){
    this.wishDetail = detail
  }

  ngAfterContentInit(){
    this.getLocation();
    console.log('From ngafterinit')
  }

  checkKeyword(){
    let v = this.kword.replaceAll(' ','');
    return (v == "");
  }

  checkLocation(){
    const pattern = /\d{5}/g;
    return (!pattern.test(this.cusZip) || this.cusZip.length!=5)
  }

  emptyLocation(){
    if (this.cusZip.length == 0){
      this.showZipRequired()
    }else{
      this.hideZipRequired()
    }
  }

  getKwInvalid(){
    if(this.checkKeyword()){
      $("#inputKword").addClass('is-invalid')
    }else{
      $("#inputKword").removeClass('is-invalid')
    }
  }

  getSearchDisable(){
    if(this.checkKeyword()) return true
    if(this.locopt=="from-oth" && this.checkLocation())return true
    return false
  }

  getLocInvalid(){
    this.emptyLocation()
    return this.checkLocation()
  }
  showClick(){
    console.log("clicked");
  }
  toggleLocation(e:Event){
    this.hideZipRequired()
    if (e.target !== null){
      if ((e.target as HTMLInputElement).value == "from-cur"){
        this.locDisable = true;
        this.fromcurcheck = true;
        this.fromothcheck = false
        this.locopt = "from-cur"
        $('#from-zip').removeClass('is-invalid')
        // this.searchDisable = this.checkKeyword()
      }else if((e.target as HTMLInputElement).value == "from-oth"){
        this.locDisable = false;
        this.fromcurcheck = false;
        this.fromothcheck = true
        this.locopt = "from-oth"
        this.getLocInvalid()
        // this.searchDisable = (this.checkKeyword() || locinvalid)
      }
    }
  }
  showZipRequired(){
    $('#from-zip').addClass('is-invalid')
  }
  hideZipRequired(){
    $('#from-zip').removeClass('is-invalid')
  }
  
  getLocation(){
    let that = this;
    axios.get('https://ipinfo.io/json?token=aa3901ec8f9655')
    .then(function(res){
      // console.log(res.data.postal)
      that.loc = res.data.postal
    }).catch(function(err){
      console.log(err)
    })
  }
  getZips(){
    let that = this;
    axios.get(that.root_url + '/getZipCode',{
      params: {start:this.cusZip}
    }).then(function(res){
      var codes:PostCode[] = res.data.postalCodes;
      that.zipcodes.length = 0;
      for (let i = 0;i<codes.length;i++){
        that.zipcodes.push(codes[i].postalCode);
      }
    }).catch(function(err){
      that.zipcodes.length = 0;
      console.log(err)
    })
    // Get the related zip codes by requesting the Node.js backend
  }
  //https://ipinfo.io/json?token=aa3901ec8f9655
  //http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=900&maxRows=5&username=xinyi223&country=US

  newSearchRow(idx:number,item:Item):SearchRow{
    let newObj:SearchRow = {idx:idx, itemId:"N/A", img: "N/A", name: "N/A", price: "N/A", ship:"N/A", zip:"N/A", shippingInfo:"N/A", inWish:false}
    newObj.idx = idx
    newObj.itemId = ((item.itemId) ? item.itemId[0] : "N/A")
    newObj.img = ((item.galleryURL && item.galleryURL[0]) ? item.galleryURL[0] : "https://csci571.com/hw/hw6/images/ebay_default.jpg")
    newObj.name = ((item.title) ? item.title[0] : "N/A")
    newObj.price = ((item.sellingStatus && item.sellingStatus[0].currentPrice) ? item.sellingStatus[0].currentPrice[0]["__value__"] : "N/A")
    newObj.ship = ((item.shippingInfo && item.shippingInfo[0].shippingServiceCost) ? item.shippingInfo[0].shippingServiceCost[0]["__value__"]: "N/A")
    newObj.zip = ((item.postalCode) ? item.postalCode[0] : "N/A")
    newObj.shippingInfo = ((item.shippingInfo && item.shippingInfo[0]) ? item.shippingInfo[0]:"N/A")
    return newObj
  }

  getFormValues(){
    // Define by object and its properties
    var data = {} as Form;
    data.keywords = $("#inputKword").val();
    // Check if keywords is empty - use required
    if (data.keywords === "") {
      return [data, -1] // don't make the getSearchResults have request
    }
    if(this.loc==""){
      this.getLocation();
    }
    if (this.locDisable){
      data.buyerPostalCode = this.loc;
    }else{
      data.buyerPostalCode = this.cusZip;
    }
    data.itemFilter = [];
    if(this.localChecked){
      data.itemFilter.push({name:'LocalPickupOnly',value:this.localChecked})
    }
    if(this.freeChecked){
      data.itemFilter.push({name:'FreeShippingOnly',value:this.freeChecked})
    }
    // Condition
    var conds = [];
    if (this.newChecked){
        conds.push("New");
    }
    if (this.useChecked){
        conds.push("Used");
    }
    //If only "Unspecified" is selected (or nothing is selected) then don't use any condition codes in the eBay API call. If "Unspecified" is selected with any other conditions, pass those other conditions
    // if (this.unspChecked){
    //     conds.push("Unspecified");
    // }
    if (conds.length > 0){
        data.itemFilter.push({name:'Condition', value:conds})
    }
    // MaxDist
    // if(this.maxDist)
    data.itemFilter.push(
      {name: 'MaxDistance', value:this.maxDist}
    )
    if (this.category !== "All"){
      data.categoryId = this.categeryList[this.category as keyof Categories]
    }
    console.log(data)
    return [data, 0]
  }

  clearResults(){
    this.showNoResultWish = false
    this.showNoResultSearch = false
    this.showResultTable = false
    this.showWishList = false
    this.searchData.length = 0
    this.tableData.length = 0
    $("#nav-wish").removeClass("active")
    $("#nav-res").addClass("active")

    this.resultDetail = JSON.parse(this.emptyDetailString)
    this.wishDetail = JSON.parse(this.emptyDetailString)
    this.tempResultid = ""
    this.tempWishid = ""
  }

  getWishIds(){
    let that = this
    axios.get(this.root_url+'/getWishIds')
    .then(function(res){
      that.wishids = that.getWishIdsArray(res.data.ids)
      console.log(that.wishids)
    }).catch(function(err){
      console.log(err)
    })
  }

  getWishIdsArray(oldids:[{itemId:any}]){
    let temp = []
    for(let i of oldids){
      temp.push(i.itemId)
    }
    return temp
  }

  resetAll(){
    this.clearResults()

    this.maxDist = 10
    this.kword = ""
    this.searchDisable = true
    this.locDisable = true
    this.localChecked = false
    this.newChecked = false
    this.useChecked = false
    this.freeChecked = false
    this.unspChecked = false
    this.category = "All"
    this.cusZip = ""
    this.locopt = 'from-cur'
    $("#inputKword").removeClass('is-invalid')
    $('#from-zip').removeClass('is-invalid')

  }

  getSearchResults(){
    this.clearResults()
    this.getWishIds()
    this.loading = true
    const [data, status] = this.getFormValues();
    let that = this
    // Invalid User Inputs
    if (status == -1) return;
    else if (status == 0) {
        axios.get(this.root_url+'/getSearchResult', {
            params: data,
        }).then(function (res) {
          that.showSearchRows(res.data[0] as searchReturns);
        }).catch(function (err) {
            console.log(err);
            //TODO: add error showing message
            // document.getElementById("show-text").innerText = err.data;
        })
    }
  }

  showSearchRows(res:searchReturns){
    // console.log(res)
    if(res.searchResult && res.searchResult[0].item){
      let data = res.searchResult[0].item
      this.searchData.length = 0
      if (typeof data !== 'undefined') {
        // console.log("here")
        if(data.length > 0){
          for (let i = 0;i<data.length;i++){
            this.searchData.push(this.newSearchRow(i,data[i]));
          }
          this.cnt += 1
          // this.showResultTable = true
        }else{
          this.showNoResultSearch = true
        }
      }else{
        // this.showNoResult = true
        this.showNoResultSearch = true
      }
    }else{
      this.searchData.length = 0
      this.showNoResultSearch = true
    }
    this.loading = false
    this.showResultTable = true
    console.log(this.showNoResultSearch)
  }

  makePagi(total:number){
    this.pageIdx.length = 0
    for(let i = 0;i<total;i++){
      this.pageIdx.push(i)
    }
  }

  showPage(pageIdx:number){
    let end = Math.min((pageIdx+1)*10,this.searchData.length)
    this.curPage = pageIdx
    this.tableData.length = 0
    for (let i = pageIdx*10;i<end;i++){
      this.tableData.push(this.searchData[i])
    }
  }

  showPNPage(mode:number){
    this.showPage(this.curPage+mode)
  }

  showWish(){
    // Fetch the wish list data here
    // this.clearResults()
    let that = this
    this.tempWishid=this.wishDetail.itemid
    let tempids:string[] = []
    if (that.wishData.length == 0){
      // that.showNoResult = true
      that.showNoResultWish = true
    }
    axios.get(this.root_url+"/getWishList")
    .then(function(res){
      that.wishData = res.data
      for(let i = 0;i<that.wishData.length;i++){
        that.wishData[i].idx = i
        tempids.push(that.wishData[i].itemId)
      }
      if (that.wishData.length > 0){
        that.wishcnt += 1
        // that.showNoResult = false
        that.showNoResultWish = false
      }else{
        // that.showNoResult = true
        that.showNoResultWish = true
      }
      that.wishids = tempids
    }).catch(function(err){
      console.log(err)
    })
    // Show
    this.showWishList = true;
    this.showResultTable = false;
    $("#nav-res").removeClass("active")
    $("#nav-wish").addClass("active")
  }

  showResults(){
    this.showWishList = false;
    this.getWishIds()
    if (this.searchData.length > 0){
      this.tempResultid = this.resultDetail.itemid
    }
    this.showResultTable = true;
    $("#nav-wish").removeClass("active")
    $("#nav-res").addClass("active")
  }

  updateWishIds(list:string[]){
    this.wishids = list
  }
}


