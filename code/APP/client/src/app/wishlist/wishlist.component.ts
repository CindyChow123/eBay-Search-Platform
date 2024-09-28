import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchRow, shippingInfo, details } from '../format';
import axios from 'axios';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent {
  @Input() wishData?:SearchRow[];
  @Input() wishCheckTime?:number;
  @Input() root_url=''
  @Output() removeWishEvent = new EventEmitter<string>()
  @Output() changeWishIdsEvent = new EventEmitter<string[]>()
  @Output() setWishDetail = new EventEmitter<details>()
  @Output() unloadingEvent = new EventEmitter<string>()
  @Output() loadingEvent = new EventEmitter<string>()
  @Input() wishids:string[]=[]
  @Input() curDetail=""
  @Input() detailData:details={
    itemid:"",
    itemidx:-1,
  }
  oldwishids:string[]=[]
  oldwishCheckTime = 0
  tableData:SearchRow[] = []
  tableHeads = ['#', 'Image', 'Title', 'Price', 'Shipping Option', 'Favorite']
  wishDetailDisable = true
  showList = true
  showDetail = false
  totalprice=0
  totalprstr=""
  
  curTableData:SearchRow={idx:-1, itemId:"N/A", img: "N/A", name: "N/A", price: "N/A", ship:"N/A", zip:"N/A", shippingInfo:"N/A", inWish:false}

  ngDoCheck(){
    if (this.wishCheckTime != this.oldwishCheckTime){
      if (typeof this.wishCheckTime === 'number'){
        this.oldwishCheckTime = this.wishCheckTime
      }
      // console.log("results: ",this.wishData)
      this.tableData = this.wishData as SearchRow[]
      this.totalprice = 0
      for(let t of this.tableData){
        this.totalprice += parseFloat(t.price)
      }
      this.totalprstr = this.totalprice.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  showPage(){
    if (this.wishData){
      for (let i = 0;i<this.wishData.length;i++){
        this.tableData.push(this.wishData[i])
      }
    }
  }

  getWishIdsArray(oldids:[{itemId:any}]){
    let temp = []
    for(let i of oldids){
      temp.push(i.itemId)
    }
    return temp
  }

  removeCart(idx:number){
    let that = this
    console.log(idx)
    axios.get(this.root_url+'/removeWish',{
      params:this.tableData[idx]
    }).then(function(res){
      if (res.data.deleteRes.deletedCount==1){
        that.tableData[idx].inWish = 'add_shopping_cart'
        that.removeWishEvent.emit("remove")
        that.changeWishIds(that.getWishIdsArray(res.data.ids))
      }
      console.log(res.data.deleteRes.deletedCount)
      if(res.data.ids.length == 0){
        that.tableData.length = 0
      }
    }).catch(function(err){
      console.log(err)
    })
      
  }

  addCart(){
    let that = this
    axios.get(this.root_url+'/addWish',{
      params:this.curTableData
    }).then(function(res){
      that.removeWishEvent.emit("remove")
      that.changeWishIds(that.getWishIdsArray(res.data.ids))
    }).catch(function(err){
      console.log(err)
    })
  }

  toDetail(id:string, idx:number, shipInfo:shippingInfo){
    let that = this
    this.curTableData = this.tableData[idx]
    that.showList = false
    this.showDetail = false
    this.loadingEvent.emit()
    axios.get(this.root_url+"/getDetail",{
      params: {itemid:id}
    }).then(function(res){
      // store fields that detail page needs
      let item  = res.data.Item
      that.detailData = {
        itemid: id,
        itemidx: idx,
      }
      let policy = ""
      if(item.ReturnPolicy){
        if(item.ReturnPolicy.ReturnsAccepted){
          policy += item.ReturnPolicy.ReturnsAccepted
        }
        if(item.ReturnPolicy.ReturnsWithin){
          policy += `Within${item.ReturnPolicy.ReturnsWithin}`
        }
      }
      if(item.PictureURL){
        that.detailData.pictureURL = item.PictureURL
      }
      if(item.ViewItemURLForNaturalSearch){
        that.detailData.ViewItemURLForNaturalSearch = item.ViewItemURLForNaturalSearch
      }
      if(item.CurrentPrice && item.CurrentPrice.Value){
        that.detailData.price = item.CurrentPrice.Value
      }
      if(item.Location){
        that.detailData.location = item.Location
      }
      if(policy.length > 0){
        that.detailData.ReturnPolicy = policy
      }
      if(item.ReturnPolicy && item.ReturnPolicy.ReturnsAccepted){
        that.detailData.ReturnsAccepted = item.ReturnPolicy.ReturnsAccepted
      }
      if(item.ItemSpecifics && item.ItemSpecifics.NameValueList){
        that.detailData.itemspecifics = item.ItemSpecifics.NameValueList
      }
      if(item.Title){
        that.detailData.title = item.Title
      }
      if(item.Seller){
        that.detailData.seller = item.Seller
      }
      if(item.Storefront){
        that.detailData.storefront = item.Storefront
      }
      if(typeof shipInfo !== 'string'){
        that.detailData.shippingInfo = shipInfo
      }
      // switch to the detail page
      that.unloadingEvent.emit()
      that.showDetail = true
      that.curDetail = id
      // console.log(that.detailData)
    }).catch(function(err){
      console.log(err)
    })
  }

  goBack(id:string){
    this.curDetail = id
    this.showList = true
    this.showDetail = false
  }

  toPreDetail(){
    this.showList=false
    this.showDetail = true
  }

  changeWishIds(list:string[]){
    this.changeWishIdsEvent.emit(list)
  }

  setDetail(detail:details){
    this.curDetail = detail.itemid
    this.setWishDetail.emit(detail)
  }

  formatShip(price:string){
    if(price == "N/A") return price
    let pricefloat = parseFloat(price)
    if(pricefloat == 0) return "Free Shipping"
    else return "$"+price
  }

  formatPrice(price:string){
    if(price == "N/A") return price
    return `$${price}`
  }
}
