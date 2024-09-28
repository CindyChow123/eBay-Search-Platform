import { Component, EventEmitter, Input, Output } from '@angular/core';
import { details, googlePhoto, similar } from '../format'
import * as bootstrap from 'bootstrap';
import axios from 'axios';
import { data } from 'jquery';

@Component({
  selector: 'app-detail-page',
  templateUrl: './detail-page.component.html',
  styleUrls: ['./detail-page.component.css']
})
export class DetailPageComponent {
  @Input() data?:details;
  @Input() root_url?:string;
  @Input() wishids:string[]=[]
  oldwishids:string[]=[]
  @Output() itemidEvent = new EventEmitter<details>()
  @Output() goBackEvent = new EventEmitter<string>()
  @Output() removeEvent = new EventEmitter<number>()
  @Output() addEvent = new EventEmitter<number>()
  olddataid="";
  tabs=[true,false,false,false,false];
  curpropic = 0
  photoLinks:string[] = []
  similarListfull:similar[] = []
  similarListtemp:similar[] = []
  similarList:similar[] = []
  similarListDefault:similar[] = []
  showControl="Show More"
  showBtn=false
  inWish = ""
  oldinWish=""
  sortLabel="0"
  sortOrder="0"
  end=5
  loaded=0
  imgs:string[]=[]

  ngDoCheck(){
    if(this.olddataid != this.data?.itemid){
      this.olddataid = this.data?.itemid
      this.showBtn = false
      this.showControl="Show More"
      this.itemidEvent.emit(this.data)
      this.searchPhotos(this.data?.title)
      this.searchSimilar(this.data?.itemid)
    }
    if(this.oldwishids != this.wishids){
      // console.log(this.wishids)
      console.log(this.data?.itemid)
      this.oldwishids = this.wishids
      let that = this
      this.inWish = ((this.wishids.findIndex(function(id){
        return id == that.data?.itemid
      })!=-1) ? "remove_shopping_cart" : "add_shopping_cart")
    }
  }

  changeActive(num:number){
    // console.log(this.data)
    for(let i = 0; i < this.tabs.length;i++){
      if (i == num){
        this.tabs[i] = true
      }else{
        this.tabs[i] = false
      }
    }
  }

  showPicModal(){
    var pictureModal = new bootstrap.Modal(document.getElementById('pictureModal') as HTMLElement)
    pictureModal.show()
  }

  searchPhotos(title:string){
    let that = this
    let payload = {
      q:title,
    }
    // that.photoLinks = [
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg",
    //   "https://i.ebayimg.com/images/g/xT4AAOSwZrxirSGo/s-l1600.jpg"
    // ]
    axios.get(this.root_url+"/getPhotos",{
      params:payload
    }).then(function(res){
      // console.log(res)
      that.photoLinks.length = 0
      let temp = res.data as googlePhoto
      if(temp.items){
        for(let i = 0;i<temp.items.length;i++){
          that.photoLinks.push(temp.items[i].link)
        }
      }
      
      // console.log(that.photoLinks)
    }).catch(function(err){
      console.log(err)
    })
  }

  imgloaded(){
    this.loaded++;
    if(this.imgs.length == this.loaded){
      console.log("loaded")
    }
  }


  searchSimilar(id:string){
    let payload = {
      itemid:id
    }
    let that = this
    axios.get(this.root_url+"/getSimilar",{
      params:payload
    }).then(function(res){
      that.similarListfull = res.data.item as similar[]
      
      for(let i of that.similarListfull){
        i.timeLeft = i.timeLeft.substring(
          i.timeLeft.indexOf("P") + 1, 
          i.timeLeft.lastIndexOf("D"))
      }
      that.similarListDefault = JSON.parse(JSON.stringify(that.similarListfull))
      if(that.similarListfull.length > 5){
        that.showBtn = true
        that.similarList = that.similarListfull.slice(0,5)
      }else{
        that.similarList = that.similarListfull
      }
      
    }).catch(function(err){
      console.log(err)
    })
  }

  toggleShowControl(){
    if(this.showControl == "Show More"){
      this.end = this.similarListfull.length
      this.showControl = "Show Less"
    }else{
      this.end = 5
      this.showControl = "Show More"
    }
    this.similarList = this.similarListfull.slice(0,this.end)
  }

  triggerGoBack(id:string){
    this.goBackEvent?.emit(id)
  }

  toggleCart(){
    if(this.inWish == "add_shopping_cart"){
      // this.inWish = "remove_shopping_cart"
      this.addEvent.emit(this.data?.itemidx)
      this.inWish = "remove_shopping_cart"
    }else if(this.inWish == "remove_shopping_cart"){
      // this.inWish = "add_shopping_cart"
      this.removeEvent.emit(this.data?.itemidx)
      this.inWish = "add_shopping_cart"
    }
  }

  sortChange(){
    // console.log(this.similarListDefault)
    let reverse = (this.sortOrder=="0") ? 1 : -1
    if(this.sortLabel=="1"){
      this.similarListtemp = this.similarListfull.sort(function(a,b){
        let x = a.title;
        let y = b.title;
        if (x < y) {return reverse*-1;}
        if (x > y) {return reverse*1;}
        return 0;
      })
    }else if(this.sortLabel=="2"){
      this.similarListtemp = this.similarListfull.sort(function(a,b){
        let x = parseInt(a.timeLeft)
        let y = parseInt(b.timeLeft);
        if (x < y) {return reverse*-1;}
        if (x > y) {return reverse*1;}
        return 0;
      })
    }else if(this.sortLabel=="3"){
      this.similarListtemp = this.similarListfull.sort(function(a,b){
        let x = parseFloat(a.buyItNowPrice['__value__'])
        let y = parseFloat(b.buyItNowPrice['__value__']);
        if (x < y) {return reverse*-1;}
        if (x > y) {return reverse*1;}
        return 0;
      })
    }else if(this.sortLabel=="4"){
      this.similarListtemp = this.similarListfull.sort(function(a,b){
        let x = parseFloat(a.shippingCost['__value__'])
        let y = parseFloat(b.shippingCost['__value__']);
        if (x < y) {return reverse*-1;}
        if (x > y) {return reverse*1;}
        return 0;
      })
    }else if(this.sortLabel=="0"){
      this.similarListtemp = JSON.parse(JSON.stringify(this.similarListDefault))
    }
    this.similarListfull = JSON.parse(JSON.stringify(this.similarListDefault))
    this.similarList = this.similarListtemp.slice(0,this.end)
  }

  clickableTitle(url:string){
    window.open(url,"_blank")
  }

  formatDaysLeft(str:string){
    str.substring(str.indexOf("P")+1,str.indexOf("D"))
    return str
  }
}
