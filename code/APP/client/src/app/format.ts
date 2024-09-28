export interface PostCode {
    'ISO3166-2': string,
    adminCode1: string,
    adminCode2: string,
    adminName1: string,
    adminName2: string,
    countryCode: string,
    lat: number,
    lng: number,
    placeName: string,
    postalCode: string
}

export interface SearchRow{
    idx:any,
    itemId:any,
    img:any,
    name:any,
    price:any,
    ship:any,
    zip:any,
    shippingInfo:any,
    inWish:any
}

interface NameValue{
    name: string,
    value: any,
    paramName?:string,
    paramValue?:string
}
export interface Form {
    keywords: any,
    sortOrder?: any,
    buyerPostalCode: any,
    categoryId:any,
    itemFilter: NameValue[]
}

export interface Categories{
    "Art":number,
    "Baby":number,
    "Books":number, 
    "Clothing, Shoes & Accessories":number,
    "Computers/Tablets & Networking":number,
    "Health & Beauty":number, 
    "Music":number, 
    "Video Games & Consoles":number
}

export interface Item{
    itemId:any,
    galleryURL:string[],
    title: string[],
    sellingStatus:[{
        currentPrice:[{
            "@currencyId":any,
            "__value__": any
        }]
    }],
    shippingInfo:[{
        shippingServiceCost:[{
            "@currencyId":any,
            "__value__":any
        }]
    }],
    postalCode:string[]
}

export interface searchReturns{
    searchResult:[{item:Item[]}]
}

// google search engine cx=c04b4d2774eba418b

export interface shippingInfo{
    expeditedShipping?:any,
    handlingTime?:any,
    oneDayShippingAvailable?:any,
    shipToLocations?:any,
    shippingServiceCost?:[
        {
            "@currencyId":any,
            "__value__":any
        }
    ],
    shippingType?:any
}
export interface details{
    itemid:any,
    itemidx:any,
    pictureURL?:any,
    ViewItemURLForNaturalSearch?:any,
    price?:any,
    location?:any,
    ReturnPolicy?:any,
    ReturnsAccepted?:any,
    itemspecifics?:[{
        Name:any,
        Value:any
    }]
        // NameValueList?:[{
        //     Name:any,
        //     Value:any
        // }]
    ,
    title?:any,
    seller?:{
        FeedbackRatingStar?:any,
        FeedbackScore?:any,
        PositiveFeedbackPercent?:any,
        TopRatedSeller?:any,
        UserID?:any
    },
    storefront?:{
        StoreName?:any,
        StoreURL?:any
    },
    shippingInfo?:shippingInfo
}

export interface googlePhoto{
    items:[
        {
            link:any
        }
    ]
}

export interface similar{
    buyItNowPrice:{
        "@currencyId":any,
        "__value__":any
    },
    title:any,
    imageURL:any,
    viewItemURL?:any,
    shippingCost:{
        "@currencyId":any,
        "__value__":any,
    },
    timeLeft:any
}