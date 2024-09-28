import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { PostCode, SearchRow, Form, Categories, searchReturns, Item, details, shippingInfo } from '../format';
import axios from 'axios';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent {
  @Input() resultData?:SearchRow[];
  @Input() searchTime?:number
  @Input() root_url = ''
  @Input() curDetail=""
  @Input() nextDetail=""
  @Input() detailData:details={
    itemid:"",
    itemidx:-1,
  }
  @Output() loadingEvent = new EventEmitter<string>()
  @Output() unloadingEvent = new EventEmitter<string>()
  @Output() setResultDetail = new EventEmitter<details>()
  
  oldsearchTime:number = 0
  pageIdx:number[] = []
  curPage = 0
  tableData:SearchRow[] = []
  tableHeads = ['#', 'Image', 'Title', 'Price', 'Shipping', 'zip', 'Favorite']
  
  resultDetailDisable = true
  showList = true
  showDetail = false
  @Input() wishids:string[]=[]
  oldwishids:string[]=[]

  constructor(private cd: ChangeDetectorRef) {}
  

  ngDoCheck(){
    if (this.searchTime != this.oldsearchTime){
      if (typeof this.searchTime === 'number'){
        this.oldsearchTime = this.searchTime
      }
      
      if (this.resultData){
        // this.curDetail=""
        this.makePagi(Math.ceil(this.resultData.length/10))
        // console.log("Before show page")
        this.showPage(0);
        // console.log("After show page")
      }
    }
    if(this.wishids != this.oldwishids){
      this.oldwishids = this.wishids
      this.updateInWish()
    }
  }

  makePagi(total:number){
    this.pageIdx.length = 0
    for(let i = 0;i<total;i++){
      this.pageIdx.push(i)
    }
  }

  showPage(pageIdx:number){
    if (this.resultData){
      let end = Math.min((pageIdx+1)*10,this.resultData.length)
      this.curPage = pageIdx
      this.tableData.length = 0
      for (let i = pageIdx*10;i<end;i++){
        this.tableData.push(this.resultData[i])
      }
      // console.log(this.curPage,this.pageIdx)
    }
    
  }

  showPNPage(mode:number){
    this.showPage(this.curPage+mode)
  }

  addWish(idx:number){
    let that = this
    let payload = undefined
    if(this.resultData){
      // console.log(this.resultData[idx], idx)
      payload = this.resultData[idx]
    }

    axios.get(this.root_url+'/addWish',{
      params:payload
    }).then(function(res){
      that.wishids = that.getWishIdsArray(res.data.ids)
      that.updateInWish()
    }).catch(function(err){
      console.log(err)
    })
  }

  removeWish(idx:number){
    let that = this
    let payload = undefined
    if(this.resultData){
      // console.log(this.resultData[idx], idx)
      payload = this.resultData[idx]
    }
    axios.get(this.root_url+'/removeWish',{
      params:payload
    }).then(function(res){
      that.wishids = that.getWishIdsArray(res.data.ids)
      that.updateInWish()
    }).catch(function(err){
      console.log(err)
    })
  }
  toggleCart(idx:number){
    if (this.tableData[idx].inWish == "add_shopping_cart"){
      this.addWish(idx)
      this.tableData[idx].inWish = "remove_shopping_cart"
    }else{
      this.removeWish(idx)
      this.tableData[idx].inWish = "add_shopping_cart"
    }
  }

  toDetail(id:string, idx:number, shipInfo:shippingInfo|string){
    let that = this
    this.loadingEvent.emit()
    that.curDetail = id
    that.showList = false
    this.showDetail = false
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
          if(item.ReturnPolicy.ReturnsWithin){
            policy += ` Within ${item.ReturnPolicy.ReturnsWithin}`
          }
        }else if(item.ReturnPolicy.ReturnsWithin){
          policy += `Within ${item.ReturnPolicy.ReturnsWithin}`
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
      // that.detailData = {
      //   itemid: id,
      //   itemidx: idx,
      //   pictureURL:item.PictureURL,
      //   ViewItemURLForNaturalSearch:item.ViewItemURLForNaturalSearch,
      //   price:item.CurrentPrice.Value,
      //   location:item.Location,
      //   ReturnPolicy:policy,
      //   ReturnsAccepted: item.ReturnPolicy.ReturnsAccepted,
      //   itemspecifics:item.ItemSpecifics,
      //   title: item.Title,
      //   seller: item.Seller,
      //   storefront: item.Storefront,
      //   shippingInfo: shipInfo
      // }      
      // switch to the detail page
      that.unloadingEvent.emit()
      that.showDetail = true
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

  updateInWish(){
    if(this.resultData){
      for(let item of this.resultData){
        item.inWish = ((item.itemId && this.wishids.findIndex(function(id){
          return id==item.itemId
        })!=-1) ? "remove_shopping_cart" : "add_shopping_cart")
      }
    }
  }

  getWishIds(){
    let that = this
    axios.get(this.root_url+'/getWishIds')
    .then(function(res){
      that.wishids = that.getWishIdsArray(res.data.ids)
      that.updateInWish()
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

  setDetail(detail:details){
    // this.curDetail = detail.itemid
    this.setResultDetail.emit(detail)
    // console.log(this.curDetail)
  }

}
