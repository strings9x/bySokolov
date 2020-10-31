(function($){

$('.menu .item').tab()
$('.ui .accordion').accordion({ duration:0 })
$('.ui .dropdown').dropdown({ duration:0 })

$('.ui .menu .item').on('click', function() {
    let element = $(this)
    if (element.hasClass('active header')) {
        element.removeClass('active header')
    } else {
        element.addClass('active header').siblings().removeClass('active header')
    }
})






const type6CategoryChange = async function(value, text){
    let item = await Goods.getGoodsById(value)
    Helper.comboboxSetItems(Elements.type6Group, await Goods.getGoodsByFilterDGrouping('type6Group', item?.group))
}

const type6GroupChange = async function(value, text){
    let item = await Goods.getGoodsById(value)
    Helper.comboboxSetItems(Elements.type6Goods, await Goods.getGoodsByFilterDGrouping('type6Goods', item?.group))
}




// App
const App = window.App = {}
App.user = null
App.config = {

    property:{
        // refactoring
        catalog:{
            ID:21
        },

        goods:{
            PURCHASE:173,
            CURRENCY:175,
            SURCHARGE:151,
            DESTINATION:153,
            GROUP:155,
            GROUPING:157,
            TITLE:177
        },

        deal:{
            DATA:'UF_CRM_1602618769674'
        }

    }

}
App.install = function(){
    // проверить поле в сделках UF_CRM_CABFUR
    // записать название поля в BX24.app.option.set
}
App.initialize = async function(){

    $('#buttonNewOrder').on('click', newOrderClick)
    $('#buttonCloseOrder').on('click', btnCloseFrameDealClick)
    $('#buttonSaveOrder').on('click', saveOrderClick)
    $('#buttonPrintOrder').on('click', printOrderClick)
    $('#tableDeals').on('dblclick', tableDealsDoubleClick)
    $('#listConstructors').on('click', listConstructorsClick)
    $('#btnConstructorAddItem').on('click', btnConstructorAddItemClick)
    $('#btnConstructorChangeItem').on('click', btnConstructorChangeItemClick)
    $('#btnRemoveSelectDealItem').on('click', btnRemoveSelectDealItemClick)

    Elements.type4Goods.on('click', function(event){
        let element = $(event.target)
        let activeRow = element.parent().find('.active')
        if (activeRow) {
            activeRow.removeClass('active')
        }
        element.addClass('active')
    })

    $('#constructorType6').find('.controlCategory').parent().dropdown({ duration:0, onChange:type6CategoryChange })
    $('#constructorType6').find('.controlGroup').parent().dropdown({ duration:0, onChange:type6GroupChange })
    

    BX24.init(App.run)
    
}
App.run = async function(){
    
    console.log('application run')
    // check size frame application
    if (80 > (window.innerHeight / window.screen.availHeight)*100) {
        BX24.openApplication()
    }

    App.user = await CRM.getCurrentUser()
    let listDeals = await CRM.getDealsList()
    Renders.tableDeals(listDeals || [])
    
}


// Enums
const Enums = {}
Enums.builderTypes = { type1:'корпус', type2:'лдсп/фасад', type3:'столешница', type4:'опции и допы', type5:'стекла и зеркала', type6:'фурнитура', type7:'дополнительно' }


// Helper
const Helper = window.Helper = {}
Helper.recordCRMProduct = function(item){
    let id = item['ID']
    let name = item['NAME']
    let purchase = item[`PROPERTY_${App.config.property.goods.PURCHASE}`]?.value || ''
    let currency = item[`PROPERTY_${App.config.property.goods.CURRENCY}`]?.value || ''
    let surcharge = item[`PROPERTY_${App.config.property.goods.SURCHARGE}`]?.value || ''
    let destination = item[`PROPERTY_${App.config.property.goods.DESTINATION}`]?.value || ''
    let group = item[`PROPERTY_${App.config.property.goods.GROUP}`]?.value || ''
    let grouping = item[`PROPERTY_${App.config.property.goods.GROUPING}`]?.value || ''
    let title = item[`PROPERTY_${App.config.property.goods.TITLE}`]?.value || name
    return { id, name, purchase, currency, surcharge, destination, group, grouping, title }
}
Helper.recordTableDealItems = function(item){
    let { type, goods, price, count, cost, note } = item
    let title = 'сформировать загаловок' // goods.title
    let typeTitle = Enums.builderTypes[type]
    return { type, typeTitle, title, price, count, cost, note }
}
Helper.recordTableDeals = function(item){
    let { ID, DATE_CREATE, TITLE, OPPORTUNITY, CURRENCY_ID } = item
    let id = ID
    let date = (new Date(DATE_CREATE)).toLocaleDateString()
    let title = TITLE
    let cost = `${OPPORTUNITY} ${CURRENCY_ID}`
    let note = ''
    return { id, date, title, cost, note }
}
Helper.inputGetValue = function(aElement){
    return aElement.val()
}
Helper.inputSetValue = function(aElement, aValue){
    aElement.val(aValue)
}
Helper.comboboxGetValue = function(aElement){
    return aElement.find('.active').attr('data-value')
}
Helper.comboboxSetValue = function(aElement, aValue){
}
Helper.comboboxSetItems = function(aElement, aItems = []){
    let items = ''
    for (let item of aItems) {
        items += `<div class="item" data-value=${item.id}>${item.title}</div>`
    }
    aElement.empty().html(items)
}
Helper.listGetValue = function(aElement){
    return aElement.find('.active').attr('data-value')
}
Helper.listSetValue = function(aElement, aValue){
    aElement.find('.active').removeClass('.active')
    aElement.find(`[name="${aValue}"]`)
}
Helper.listSetItems = function(aElement, aItems = []){
    let items = ''
    for (let item of aItems) {
        items += `<div class="item" data-value=${item.id}>${item.title}</div>`
    }
    aElement.empty().html(items)
}

// USER

const USER = {}






// CRM
const CRM = App.CRM = {}
CRM.getDealsList = function(){
    return new Promise(function(resolve, reject){
        BX24.callMethod('crm.deal.list', {}, function(result){
            if (result.error()) {
                console.log(result.error())
                resolve(null)
                return
            }
            resolve(result.answer.result)
        })
    })
}
CRM.getDealData = function(){
    return new Promise(function(resolve, reject){
    })
}
CRM.setDealData = function(){
    return new Promise(function(resolve, reject){
    })
}
CRM.getCurrentUser = function(){
    return new Promise(function(resolve, reject){
        BX24.callMethod('user.current', {}, function(result){
            if (result.error()) {
                console.log(result.error())
                resolve(null)
                return
            }
            let user = result.answer.result
            let IS_ADMIN = BX24.isAdmin()
            resolve({ ...user, IS_ADMIN })
        })
    })
}
CRM.getProducts = async function(){
    return new Promise(function(resolve, reject){
        let order = { 'NAME':'ASC' }
        let filter = { 'ACTIVE':'Y', 'CATALOG_ID':App.config.property.catalog.ID }
        let select = [ 'ID', 'NAME', 'PROPERTY_*' ]
        let config = { order, filter, select, start:-1 }
        let array = []
        BX24.callMethod('crm.product.list', config, async function(result){
            if (result.error()) {
                console.error(result.error())
                resolve({})
            } else {
                array = array.concat(result.data())
                if (result.more()) {
                    //await (new Promise((resolve)=>{ setTimeout(resolve, 50) }))
                    result.next()
                } else {
                    resolve(array)
                }
            }
        })
    })
}
CRM.getProductById = async function(aId){
    return new Promise(function(resolve){
        BX24.callMethod("crm.product.get", 
            { id: aId }, 
            function(result) 
            {
                if(result.error()) {
                    console.error(result.error());
                    resolve()
                } else {
                    resolve(result.data())
                }
            }
        );
    })
}
CRM.getProductsFilterByD = async function(aDestination){
    return new Promise(function(resolve){

        let order = { 'NAME': 'ASC' }
        let filter = { 'ACTIVE':'Y', 'CATALOG_ID':App.config.property.catalog.ID }
            filter[`?PROPERTY_${App.config.property.goods.DESTINATION}`] = aDestination
        let select = [ 'ID', 'NAME', 'PROPERTY_*' ]
        let args = { order, filter, select }

        let array = []

        BX24.callMethod('crm.product.list', args, async function(result){
            if (result.error()) {
                console.error(result.error())
                resolve()
            } else {
                array = array.concat(result.data())
                if (result.more()) {
                    result.next()
                } else {
                    resolve(array)
                }
            }
        })
    })
}
CRM.getProductsFilterByDGroup = async function(aDestination, aGroup){
    return new Promise(function(resolve){

        let order = { 'NAME': 'ASC' }
        let filter = { 'ACTIVE':'Y', 'CATALOG_ID':App.config.property.catalog.ID }
            filter[`?PROPERTY_${App.config.property.goods.DESTINATION}`] = aDestination
            filter[`?PROPERTY_${App.config.property.goods.GROUP}`] = aGroup
        let select = [ 'ID', 'NAME', 'PROPERTY_*' ]
        let args = { order, filter, select }

        let array = []

        BX24.callMethod('crm.product.list', args, async function(result){
            if (result.error()) {
                console.error(result.error())
                resolve()
            } else {
                array = array.concat(result.data())
                if (result.more()) {
                    result.next()
                } else {
                    resolve(array)
                }
            }
        })
    })
}
CRM.getProductsFilterByDGrouping = async function(aDestination, aGrouping){
    return new Promise(function(resolve){

        let order = { 'NAME': 'ASC' }
        let filter = { 'ACTIVE':'Y', 'CATALOG_ID':App.config.property.catalog.ID }
            filter[`?PROPERTY_${App.config.property.goods.DESTINATION}`] = aDestination
            filter[`?PROPERTY_${App.config.property.goods.GROUPING}`] = aGrouping
        let select = [ 'ID', 'NAME', 'PROPERTY_*' ]
        let args = { order, filter, select }

        let array = []

        BX24.callMethod('crm.product.list', args, async function(result){
            if (result.error()) {
                console.error(result.error())
                resolve()
            } else {
                array = array.concat(result.data())
                if (result.more()) {
                    result.next()
                } else {
                    resolve(array)
                }
            }
        })
    })
}
CRM.getProductsFilterByDGG = async function(aDestination, aGroup, aGrouping){
    return new Promise(function(resolve){

        let order = { 'NAME': 'ASC' }
        let filter = { 'ACTIVE':'Y', 'CATALOG_ID':App.config.property.catalog.ID }
            filter[`?PROPERTY_${App.config.property.goods.DESTINATION}`] = aDestination
            filter[`?PROPERTY_${App.config.property.goods.GROUP}`] = aGroup
            filter[`?PROPERTY_${App.config.property.goods.GROUPING}`] = aGrouping
        let select = [ 'ID', 'NAME', 'PROPERTY_*' ]
        let args = { order, filter, select }

        let array = []

        BX24.callMethod('crm.product.list', args, async function(result){
            if (result.error()) {
                console.error(result.error())
                resolve()
            } else {
                array = array.concat(result.data())
                if (result.more()) {
                    result.next()
                } else {
                    resolve(array)
                }
            }
        })
    })
}
CRM.addCatalog = async function(aCatalog, aName){
    let ARGS = arguments
    return new Promise(function(resolve, reject){
        let fields = {
            NAME:aName,
            SECTION_ID:aCatalog
        }
        let config = { fields }
        BX24.callMethod('crm.productsection.add', config, function(result){
            if (result.error()) {
                console.error('CRM.addCatalog', ARGS, result.error())
                resolve(-1)
            } else {
                resolve(result.data())
            }
        })
    })
}
CRM.addProduct = async function(aCatalog, aName, aPurchase, aCurrency, aSurcharge, aDestination, aGroup, aGrouping, aTitle){
    let ARGS = arguments
    return new Promise(function(resolve){
        let fields = {
            SORT:500,
            NAME:aName,
            SECTION_ID:aCatalog,
        }
        fields[`PROPERTY_${App.config.property.goods.PURCHASE}`] = { value:aPurchase || '' }
        fields[`PROPERTY_${App.config.property.goods.CURRENCY}`] = { value:aCurrency || '' }
        fields[`PROPERTY_${App.config.property.goods.SURCHARGE}`] = { value:aSurcharge || '' }
        fields[`PROPERTY_${App.config.property.goods.DESTINATION}`] = { value:aDestination || '' }
        fields[`PROPERTY_${App.config.property.goods.GROUP}`] = { value:aGroup || '' }
        fields[`PROPERTY_${App.config.property.goods.GROUPING}`] = { value:aGrouping || '' }
        fields[`PROPERTY_${App.config.property.goods.TITLE}`] = { value:aTitle || '' }
        let config = { fields }
        BX24.callMethod('crm.product.add', config, function(result){
            if (result.error()) {
                console.error('CRM.addProduct', ARGS, result.error())
                resolve(-1)
            } else {
                resolve(result.data())
            }  
        })
    })
}
CRM.callMethod = async function(aMethod, aARGS){
    
}
CRM.callBatchMain = async function(calls){
    return new Promise(function(resolve){
        BX24.callBatch(calls, function(aResult){
            resolve(aResult)
        })
    })
}
CRM.callBatchSame = async function(aMethod, aARGS){
    let result = {}
    let calls = {}
    let index = 0
    for await (let args of aARGS) {
        calls[index] = [aMethod, args]
        index++
        if (index === 49) {
            index = 0
            result = Object.assign({}, result, await CRM.callBatchMain(calls))
            calls = {}
        }
    }
    if (index > 0 && index < 49) {
        index = 0
        result = Object.assign({}, result, await CRM.callBatchMain(calls))
        calls = {}
    }
    return result
}



const Elements = App.Elements = {}
Elements.HIDDEN_CONTROLS = $('#HIDDEN_CONTROLS')
Elements.buttonNewOrder = $('#buttonNewOrder')
Elements.tableDeals = $('#tableDeals')
// Frame
Elements.buttonCloseOrder = $('#buttonCloseOrder')
Elements.buttonSaveOrder = $('#buttonSaveOrder')
Elements.buttonPrintOrder = $('#buttonPrintOrder')
Elements.labelID = $('#labelID')
Elements.labelClient = $('#labelClient')
Elements.tableDealItems = $('#tableDealItems')
Elements.listConstructors = $('#listConstructors')
Elements.labelCost = $('#labelCost')
// Frame-Constructor
Elements.btnConstructorAddItem = $('#btnConstructorAddItem')
Elements.btnConstructorChangeItem = $('#btnConstructorChangeItem')
Elements.btnRemoveSelectDealItem = $('#btnRemoveSelectDealItem')

Elements.type1Constructor = $('#constructorType1')
Elements.type1Seller = Elements.type1Constructor.find('.controlSeller')
Elements.type1Count = Elements.type1Constructor.find('.controlCount')
Elements.type1Note = Elements.type1Constructor.find('.controlNote')

Elements.type2Constructor = $('#constructorType2')
Elements.type2Seller = Elements.type2Constructor.find('.controlSeller')
Elements.type2Count = Elements.type2Constructor.find('.controlCount')
Elements.type2Note = Elements.type2Constructor.find('.controlNote')

Elements.type3Constructor = $('#constructorType3')
// ***
Elements.type3Count = Elements.type3Constructor.find('.controlCount')
Elements.type3Note = Elements.type3Constructor.find('.controlNote')

Elements.type4Constructor = $('#constructorType4')
Elements.type4Goods = Elements.type4Constructor.find('.controlGoods')
Elements.type4Count = Elements.type4Constructor.find('.controlCount')
Elements.type4Note = Elements.type4Constructor.find('.controlNote')

Elements.type5Constructor = $('#constructorType5')
Elements.type5Stuff = Elements.type5Constructor.find('.controlStuff')
Elements.type5View = Elements.type5Constructor.find('.controlView')
Elements.type5Goods = Elements.type5Constructor.find('.controlGoods')
Elements.type5Tech = Elements.type5Constructor.find('.controlTech')
Elements.type5Height = Elements.type5Constructor.find('.controlHeight')
Elements.type5Width = Elements.type5Constructor.find('.controlWidth')
Elements.type5Count = Elements.type5Constructor.find('.controlCount')
Elements.type5Note = Elements.type5Constructor.find('.controlNote')

Elements.type6Constructor = $('#constructorType6')
Elements.type6Category = Elements.type6Constructor.find('.controlCategory')
Elements.type6CategoryControl = Elements.type6Category.parent()
Elements.type6Group = Elements.type6Constructor.find('.controlGroup')
Elements.type6GroupControl = Elements.type6Group.parent()
Elements.type6Goods = Elements.type6Constructor.find('.controlGoods')
Elements.type6GoodsControl = Elements.type6Goods.parent()
Elements.type6Count = Elements.type6Constructor.find('.controlCount')
Elements.type6Note = Elements.type6Constructor.find('.controlNote')

Elements.type7Constructor = $('#constructorType7')
Elements.type7Seller = Elements.type7Constructor.find('.controlSeller')
Elements.type7Article = Elements.type7Constructor.find('.controlArticle')
Elements.type7Price = Elements.type7Constructor.find('.controlPrice')
Elements.type7Count = Elements.type7Constructor.find('.controlCount')
Elements.type7Note = Elements.type7Constructor.find('.controlNote')





// UI Renders
const Renders = App.Renders = {}
Renders.UIElementError = function(){
    // red
}
Renders.UIElementWarning = function(){
    // yellow
}
Renders.dealDataClear = function(){
    Renders.labelID()
    Renders.labelClient()
    Renders.labelCost()
    Renders.tableDealItems()
}
Renders.dealDataWrite = function(){
    let record = Deal.BXRecord
    let bill = Deal.getCurrentBill()
    Renders.labelID(record.ID)
    Renders.labelClient(record.TITLE)
    Renders.labelCost(0)
    Renders.tableDealItems(bill.items)
}

Renders.tableDeals = function(items){
    let element = Elements.tableDeals.children('tbody')
    if (items) {
        let rowsHTML = ''
        for (let item of items) {
            let record = Helper.recordTableDeals(item)
            rowsHTML += `<tr>
                <td>${record.id}</td>
                <td>${record.date}</td>
                <td>${record.title}</td>
                <td>${record.cost}</td>
                <td>${record.note}</td>
            </tr>`
        }
        element.empty().html(rowsHTML)
    } else {
        element.empty()
    }
}
Renders.labelID = function(value){
    let element = Elements.labelID.find('.control-value')
    if (typeof value !== 'undefined') {
        element.html(value)
    } else {
        element.empty()
    }
}
Renders.labelClient = function(value){
    let element = Elements.labelClient.find('.control-value')
    if (typeof value !== 'undefined') {
        element.html(value)
    } else {
        element.empty()
    }
}
Renders.labelCost = function(value){
    let element = Elements.labelCost.find('.control-value')
    if (typeof value !== 'undefined') {
        element.html(value)
    } else {
        element.empty()
    }
}
Renders.tableDealItems = function(items){
    let element = Elements.tableDealItems.children('tbody')
    if (typeof items !== 'undefined') {
        let rowsHTML = ''
        let index = 0
        for (let item of items) {
            let record = Helper.recordTableDealItems(item)
            rowsHTML += `<tr data-item-index=${index}>
                <td class="controls"></td>
                <td>${record.typeTitle}</td>
                <td>${record.title}</td>
                <td>${record.count}</td>
                <td>${record.cost}</td>
                <td>${record.note}</td>
            </tr>`
            index ++
        }
        element.empty().html(rowsHTML)
    } else {
        element.empty()
    }
}

// FrameDeal
const FrameDeal = App.FrameDeal = {}
FrameDeal.open = async function(ID){
    Deal.ID = ID
    let result = await Deal.dataGet()
    if (result) {

        Helper.listSetItems(Elements.type4Goods, await Goods.getGoodsByDestination('type4Goods'))
        Helper.listSetItems(Elements.type6Category, await Goods.getGoodsByDestination('type6Category'))

        Renders.dealDataWrite()
        $('.ui.modal').modal({duration:0}).modal('show')
    } else {
        alert('не удалось загрузить сделку')
    }    
}
FrameDeal.close = async function(){
    if (!Deal.dataEqual()) {
        if (!confirm('выйти без сохранения?')) {
            return
        }
    }
    Renders.dealDataClear()
    $('.ui.modal').modal({duration:0}).modal('hide')
    Deal.ID = 0  
}

// Deal
const Deal = App.Deal = {}
Deal.ID = 0
Deal.BXRecord = null
Deal.ORIGIN = '{}'
Deal.CURRENT = null
Deal.dataGet = function(){
    return new Promise(function(resolve){
        if (Deal.ID <= 0) {
            resolve(false)
            return
        }
        BX24.callMethod('crm.deal.get', { id:Deal.ID }, function(result){
            if (result.error()) {
                console.error('error at Deal.dataGet', result.error())
                resolve(false)
                return
            }
            Deal.BXRecord = result.data()
            if (App.user.ID !== Deal.BXRecord.ASSIGNED_BY_ID) {
                if (App.user.IS_ADMIN) {
                    alert('вы не являетесь ответственным к данной сделке, но являетесь администратором данного поратала. сохранение возможно.')
                } else {
                    alert('вы не являетесь ответственным к данной сделке. сохранение не возможно.')
                }
            }
            Deal.ORIGIN = Deal.BXRecord[App.config.property.deal.DATA]
            try {
                Deal.CURRENT = JSON.parse(Deal.ORIGIN)
                if (!Deal.dataStructCheck(Deal.CURRENT)) {
                    throw 'create struct'
                }
            } catch (error) {
                let struct = Deal.dataStructCreate()
                Deal.ORIGIN = JSON.stringify(struct)
                Deal.CURRENT = struct
            }
            console.log(Deal)
            resolve(true)
        })
    })
}
Deal.dataSet = function(){
    return new Promise(function(resolve){
        if (Deal.ID === 0) {
            resolve(false)
            return
        }
        // refactoring
        if (App.user.ID !== Deal.BXRecord.ASSIGNED_BY_ID) {
            if (App.user.IS_ADMIN) {
                alert('вы не являетесь ответственным к данной сделке, но являетесь администратором данного поратала. сохранение возможно.')
            } else {
                alert('вы не являетесь ответственным к данной сделке. сохранение не возможно.')
                return
            }
        }
        let fields = {}
        let current = JSON.stringify(Deal.CURRENT)
        fields[App.config.property.deal.DATA] = current
        let params = {}
        BX24.callMethod('crm.deal.update', { id:Deal.ID, fields, params }, function(result){
            if (result.error()) {
                console.error('error at Deal.dataSet', result.error())
                resolve(false)
                return
            }
            Deal.ORIGIN = current
            resolve(true)
        })
    })
}
Deal.dataEqual = function(){
    return (Deal.ORIGIN === JSON.stringify(Deal.CURRENT))
}
Deal.dataStructCreate = function(){
    let struct = {
        billCurrentIndex: 0,
        bills: [ Deal.billStructCreate() ]
    }
    return struct
}
Deal.dataStructCheck = function(struct){
    try { 
        if (typeof struct !== 'object') {
            return false
        }
        if (typeof struct.billCurrentIndex !== 'number' || struct.billCurrentIndex < 0) {
            return false
        }
        if (!Array.isArray(struct.bills)) {
            return false
        }
        let bill = struct.bills[0]
        if (typeof bill !== 'object') {
            return false
        }
        if (typeof bill.title !== 'string'){
            return false
        }
        if (typeof bill.property !== 'object'){
            return false
        }
        if (!Array.isArray(bill.items)) {
            return false
        }
        return true
    } catch (error) {
        return false
    }
}
Deal.billStructCreate = function(){
    let struct = {}
    struct.items = []
    struct.property = {}
    struct.title = 'DEFAULT'
    return struct
}
Deal.billStructCheck = function(){
    // нужна ли эта функция?
}
Deal.billCreate = function(aTitle = 'DEFAULT'){
    if (typeof aTitle !== 'string' && aTitle.length <= 0) {
        return false
    }
    let bill = { items:[], property:{}, title:aTitle }
    Deal.CURRENT.bills.push(bill)
    return true
}
Deal.billDelete = function(){
    // get current
    // check more 1
    // remove by index
    // set current 0
    // CODE HERE
    return true
}
Deal.billRename = function(aTitle){
    if (typeof aTitle !== 'string' && aTitle.length <= 0) {
        return false
    }
    // get current
    // 
    // CODE HERE
    return true
}
Deal.billClone = function(aTitle){
    if (typeof aTitle !== 'string' && aTitle.length <= 0) {
        return false
    }
    // get current
    // JSON.stringify
    // JSON.parse
    // push
    // CODE HERE
    return true
}
Deal.billSelect = function(aIndex){
    if (typeof aIndex !== 'number' && aIndex < 0) {
        return false
    }
    // CODE HERE
    // добавить проверку на наличие элемента в массиве
    return true
}
Deal.getCurrentBill = function(){
    let { CURRENT } = Deal
    let { bills, billCurrentIndex } = CURRENT
    return bills[billCurrentIndex]
}
Deal.setCurrentBill = function(aBill){
    let { CURRENT } = Deal
    let { bills, billCurrentIndex } = CURRENT
    aBill.items.sort(function(a, b){
        return Number(a.type.replace('type', '')) - Number(b.type.replace('type', ''))
    })
    bills[billCurrentIndex] = aBill
}

// Constructor
let Constructor = App.Constructor = {}
Constructor.currentType = ''
Constructor.element = $('#constructor')
Constructor.visible = function(args){

    let { type } = args

    if (this.currentType === type) {
        this.element.addClass('hide')
        this.element.find(`#${this.currentType}`).addClass('hide')    
        this.currentType = ''
        return
    }

    this.element.removeClass('hide')
    if (this.currentType !== '' && this.currentType !== type) {
        this.element.find(`#${this.currentType}`).addClass('hide')    
    }

    this.element.find(`#${type}`).removeClass('hide')
    this.currentType = type

}

Constructor.getRecord = async function(){
    let type = Constructor.currentType.replace('constructorT', 't')
    let handler = Constructor[`${type}DataManage`]
    if (typeof handler !== 'function') {
        return null
    }
    let record = await handler()
    console.log('getRecord', record)
    return { ...record, type }
}
Constructor.setRecord = async function(aRecord){
    let { type } = aRecord
    type = type.replace('t', 'constructorT')
    Constructor.visible({ type })
    let handler = Constructor[`${aRecord.type}DataManage`]
    if (typeof handler !== 'function') {
        return null
    }
    console.log('setRecord', aRecord)
    await handler(aRecord)
    
}

Constructor.type1DataManage = async function(aRecord){
    if (aRecord) {
        // setter

    } else {
        // getter

        let count = Number(0)
        let note = ''
        let record = { count, note }
        let cost = Constructor.type1Calculate(record)
        return { ...record, cost }
    }
}
Constructor.type2DataManage = async function(aRecord){
    if (aRecord) {
        // setter

    } else {
        // getter

        let count = Number(0)
        let note = ''
        let record = { count, note }
        let cost = Constructor.type2Calculate(record)
        return { ...record, cost }
    }
}
Constructor.type3DataManage = async function(aRecord){
    if (aRecord) {
        // setter

    } else {
        // getter

        let count = Number(0)
        let note = ''
        let record = { count, note }
        let cost = Constructor.type3Calculate(record)
        return { ...record, cost }
    }
}
Constructor.type4DataManage = async function(aRecord){
    if (aRecord) {
        // setter
        let { goods, count, note } = aRecord
        Helper.listSetValue(Elements.type4Goods, goods.id)
        Helper.inputSetValue(Elements.type4Count, count)
        Helper.inputSetValue(Elements.type4Note, note)
    } else {
        // getter
        let goods = await Goods.getGoodsById(Helper.listGetValue(Elements.type4Goods))
        let count = Helper.inputGetValue(Elements.type4Count)
        let note = Helper.inputGetValue(Elements.type4Note)
        let record = { goods, count, note }
        let cost = Constructor.type4Calculate(record)
        return { ...record, cost }
    }
}
Constructor.type5DataManage = async function(aRecord){
    if (aRecord) {
        // setter
        let { stuff, view, goods, tech, height, width, count, note } = aRecord
        Helper.comboboxGetValue(Elements.type5Stuff, stuff)
        Helper.comboboxGetValue(Elements.type5View, view)
        Helper.comboboxGetValue(Elements.type5Goods, goods)
        Helper.comboboxGetValue(Elements.type5Tech, tech)
        Helper.inputSetValue(Elements.type5Height, height)
        Helper.inputSetValue(Elements.type5Width, width)
        Helper.inputSetValue(Elements.type5Count, count)
        Helper.inputSetValue(Elements.type5Note, note)
    } else {
        // getter
        let stuff = Helper.comboboxGetValue(Elements.type5Stuff)
        let view = Helper.comboboxGetValue(Elements.type5View)
        let goods = Helper.comboboxGetValue(Elements.type5Goods)
        let tech = Helper.comboboxGetValue(Elements.type5Tech)
        let height = Helper.inputGetValue(Elements.type5Height)
        let width = Helper.inputGetValue(Elements.type5Width)
        let count = Helper.inputGetValue(Elements.type5Count)
        let note = Helper.inputGetValue(Elements.type5Note)
        let record = { stuff, view, goods, tech, height, width, count, note }
        let cost = Constructor.type5Calculate(record)
        return {  ...record, cost }
    }
}
Constructor.type6DataManage = async function(aRecord){
    if (aRecord) {
        // setter
        let { category, group, goods, count, note } = aRecord
        Helper.comboboxSetValue(Elements.type6Category, category)
        Helper.comboboxSetValue(Elements.type6Group, group)
        Helper.comboboxSetValue(Elements.type6Goods, goods)
        Helper.inputSetValue(Elements.type6Count, count)
        Helper.inputSetValue(Elements.type6Note, note)
    } else {
        // getter
        let category = await Goods.getGoodsById(Helper.comboboxGetValue(Elements.type6Category))
        let group = await Goods.getGoodsById(Helper.comboboxGetValue(Elements.type6Group))
        let goods = await Goods.getGoodsById(Helper.comboboxGetValue(Elements.type6Goods))
        let count = Helper.inputGetValue(Elements.type6Count)
        let note = Helper.inputGetValue(Elements.type6Note)
        let record = { category, group, goods, count, note }
        let cost = Constructor.type6Calculate(record)
        return { ...record, cost }
    }
}
Constructor.type7DataManage = async function(aRecord){
    if (aRecord) {
        // setter
        let { seller, article, price, count, note } = aRecord
        Helper.inputSetValue(Elements.type7Seller, seller)
        Helper.inputSetValue(Elements.type7Article, article)
        Helper.inputSetValue(Elements.type7Price, price)
        Helper.inputSetValue(Elements.type7Count, count)
        Helper.inputSetValue(Elements.type7Note, note)
    } else {
        // getter
        let seller = Helper.inputGetValue(Elements.type7Seller)
        let article = Helper.inputGetValue(Elements.type7Article)
        let price = Helper.inputGetValue(Elements.type7Price)
        let count = Helper.inputGetValue(Elements.type7Count)
        let note = Helper.inputGetValue(Elements.type7Note)
        let record = { seller, article, price, count, note }
        let cost = Constructor.type7Calculate(record)
        return { ...record, cost }
    }
}

Constructor.type1Calculate = function(record){
    return Number( -1 ).toFixed(3).ceil().toFixed(2)
}
Constructor.type2Calculate = function(record){
    return Number( -1 ).toFixed(3).ceil().toFixed(2)
}
Constructor.type3Calculate = function(record){
    return Number( -1 ).toFixed(3).ceil().toFixed(2)
}
Constructor.type4Calculate = function(record){
    let { count, goods } = record
    let { purchase, surcharge } = goods
    return Number( ( purchase * count ) * surcharge ).toFixed(3).ceil().toFixed(2)
}
Constructor.type5Calculate = function(record){
    let { count, price, width, height } = record
    return Number( ( ( ( width * height ) * price ) * count ) ).toFixed(3).ceil().toFixed(2)
}
Constructor.type6Calculate = function(record){
    let { count, goods } = record
    let { purchase, surcharge } = goods
    return Number( ( purchase * count ) * surcharge ).toFixed(3).ceil().toFixed(2)
}
Constructor.type7Calculate = function(record){
    let { count, price } = record
    return Number( ( price * count ) ).toFixed(3).ceil().toFixed(2)
}

// LIST_CONSTRUCTORS
const listConstructorsClick = async function(event){
    let { target } = event
    let element = $(target)
    let type = element.attr('constructor-type')
    Constructor.visible({ type })
}

const btnConstructorAddItemClick = async function(event){
    let bill = Deal.getCurrentBill()
    let record = await Constructor.getRecord()
    if (!record) {
        alert('ошибка добавления данных')
    }
    bill.items.push(record)
    Deal.setCurrentBill(bill)
    Renders.tableDealItems(bill.items)
}
const btnConstructorChangeItemClick = async function(event){
    let index = TableDealItems.selectIndex
    let bill = Deal.getCurrentBill()
    let record = await Constructor.getRecord()
    if (!record) {
        alert('ошибка добавления данных')
    }
    bill.items[index] = record
    Deal.setCurrentBill(bill)
    Renders.tableDealItems(bill.items)
}

const btnRemoveSelectDealItemClick = async function(event){
    console.log('remove dealitem btn click', event)
    event.stopPropagation()
    Elements.HIDDEN_CONTROLS.append(Elements.btnRemoveSelectDealItem)

    let index = TableDealItems.selectIndex
    let bill = Deal.getCurrentBill()
    bill.items.splice(index, 1)
    Deal.setCurrentBill(bill)
    Renders.tableDealItems(bill.items)
}













const newOrderClick = function(){
    $('.ui.modal').modal({duration:0}).modal('show');
    // get data of modal
    // write data to orders
}

const btnCloseFrameDealClick = function(){
    FrameDeal.close()
}

const saveOrderClick = function(){
    Deal.dataSet()
}

const printOrderClick = function(){
    console.log('todo: print order')
}

const tableDealsDoubleClick = function(event){
    let ID = Number(event.target.parentNode.childNodes[1].innerText)
    FrameDeal.open(ID)
}



const TableDeals = App.TableDeals = {}
TableDeals.element = $('#tableDeals tbody')
TableDeals.clearRows = function(){
    this.element.empty()
}

const TableDealItems = App.TableDealItems = {}
TableDealItems.selectIndex = null
TableDealItems.element = $('#tableDealItems tbody') // move this code to UIControls Object

TableDealItems.element.on('click', function(event){
    
    let element = $(event.target.parentNode)
    TableDealItems.selectIndex = element.attr('data-item-index')// Number(event.target.parentNode.getAttribute('data-item-index'))

    let activeRow = TableDealItems.element.find('.active')
    if (activeRow) {
        activeRow.removeClass('active')
    }
    element.addClass('active').find('.controls').append(Elements.btnRemoveSelectDealItem)
})

TableDealItems.element.on('dblclick', async function(event){
    let index = Elements.tableDealItems.find('.active').attr('data-item-index')
    let bill = Deal.getCurrentBill()
    let item = bill.items[index]
    await Constructor.setRecord(item)
})





const recordImportRowToAddCRMCatalog = function(aCatalog, aName){
    let fields = {
        NAME:aName,
        SECTION_ID:aCatalog
    }
    return { fields }
}
const recordImportRowToAddCRMProduct = function(aCatalog, aName, aPurchase, aCurrency, aSurcharge, aDestination, aGroup, aGrouping, aTitle){
    let fields = {
        SORT:500,
        NAME:aName,
        SECTION_ID:aCatalog
    }
    fields[`PROPERTY_${App.config.property.goods.PURCHASE}`] = { value:aPurchase || '' }
    fields[`PROPERTY_${App.config.property.goods.CURRENCY}`] = { value:aCurrency || '' }
    fields[`PROPERTY_${App.config.property.goods.SURCHARGE}`] = { value:aSurcharge || '' }
    fields[`PROPERTY_${App.config.property.goods.DESTINATION}`] = { value:aDestination || '' }
    fields[`PROPERTY_${App.config.property.goods.GROUP}`] = { value:aGroup || '' }
    fields[`PROPERTY_${App.config.property.goods.GROUPING}`] = { value:aGrouping || '' }
    fields[`PROPERTY_${App.config.property.goods.TITLE}`] = { value:aTitle || '' }
    return { fields }
}

const Goods = App.Goods = {}
Goods.indexes = {}
Goods.import = async function(aString){

    if (typeof aString !== 'string' || aString.length <= 0) {
        return false
    }

    let catalogs = {}
    let rows = aString.split('\n')

    let argsProductBatch = []

    for await (let item of rows) {

        let row = item.split('\t')
        let type = row[0]

        if (type === 'catalog') {

            let catalog = catalogs[row[1]] || App.config.property.catalog.ID
            let name = row[2]
            let id = await CRM.addCatalog(catalog, name)

            catalogs[name] = id

            // @catalog
            let purchase = (row[3] || '').replace(',', '.')
            let currency = row[4]
            let surcharge = (row[5] || '').replace(',', '.')
            let destination = row[6] || ''
            let group = row[7] || ''
            let grouping = row[8] || ''
            let title = row[9] || name
            
            await CRM.addProduct(catalogs[name], '@CATALOG', purchase, currency, surcharge, destination, group, grouping, title)

            console.log('catalog', name)

            await (new Promise(function(resolve){setTimeout(resolve, 500)}))

        } else if (type === 'product') {

            let catalog = catalogs[row[1]]
            let name = row[2]
            let purchase = (row[3] || '').replace(',', '.')
            let currency = row[4]
            let surcharge = (row[5] || '').replace(',', '.')
            let destination = row[6] || ''
            let group = row[7] || ''
            let grouping = row[8] || ''
            let title = row[9] || ''
            let record = recordImportRowToAddCRMProduct(catalog, name, purchase, currency, surcharge, destination, group, grouping, title)
            
            argsProductBatch.push(record)

            console.log('product', name)

        }

    }

    if (argsProductBatch.length > 0) {
        console.log(await CRM.callBatchSame('crm.product.add', argsProductBatch))
    }

    return true

}
Goods.export = async function(){

}
Goods.migration = async function(){

}

Goods.indexing = async function(items){

    let idIndex = Goods.indexes['id'] || ( Goods.indexes['id'] = {} )
    let destinationIndex = Goods.indexes['destination'] || ( Goods.indexes['destination'] = {} )
    let groupIndex = Goods.indexes['group'] || ( Goods.indexes['group'] = {} )
    let groupingIndex = Goods.indexes['grouping'] || ( Goods.indexes['grouping'] = {} )

    let indexDestinationGroup = Goods.indexes['destination.group'] || ( Goods.indexes['destination.group'] = {} )
    let indexDestinationGrouping = Goods.indexes['destination.grouping'] || ( Goods.indexes['destination.grouping'] = {} )

    console.log(items)
    if (!Array.isArray(items) && typeof items === 'object') {
        items = [items]
    }


    for (let item of items) {

        let record = Helper.recordCRMProduct(item)

        if (idIndex[record.id]) {
            return
        }

        idIndex[record.id] = record

        let destinationValues = destinationIndex[record.destination]
        if (!destinationValues) {
            destinationValues = destinationIndex[record.destination] = []
        }
        destinationValues.push(record)

        let groupValues = groupIndex[record.group]
        if (!groupValues) {
            groupValues = groupIndex[record.group] = []
        }
        groupValues.push(record)

        let groupingValues = groupingIndex[record.grouping]
        if (!groupingValues) {
            groupingValues = groupingIndex[record.grouping] = []
        }
        groupingValues.push(record)

        // make unioun index
        let valuesDestinationGroup = indexDestinationGroup[`${record.destination}.${record.group}`]
        if (!valuesDestinationGroup) {
            valuesDestinationGroup = indexDestinationGroup[`${record.destination}.${record.group}`] = []
        }
        valuesDestinationGroup.push(record)

        let valuesDestinationGrouping = indexDestinationGrouping[`${record.destination}.${record.grouping}`]
        if (!valuesDestinationGrouping) {
            valuesDestinationGrouping = indexDestinationGrouping[`${record.destination}.${record.grouping}`] = []
        }
        valuesDestinationGrouping.push(record)

    }
}

Goods.getGoodsById = async function(id){
    let goods = Goods.getGoodsByIndex('id', id)
    console.log(id, goods)
    if (!goods) {
        goods = await CRM.getProductById(id)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('id', id)
        }
    }
    return goods || null
}
Goods.getGoodsByFilterD = async function(aDestination){
    let goods = Goods.getGoodsByIndex('destination', `${aDestination}`)
    if (!goods) {
        goods = await CRM.getProductsFilterByD(aDestination)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('destination', `${aDestination}`)
        }
    }
    return goods || []
}
Goods.getGoodsByFilterDGroup = async function(aDestination, aGroup){
    let goods = Goods.getGoodsByIndex('destination.group', `${aDestination}.${aGroup}`)
    if (!goods) {
        goods = await CRM.getProductsFilterByDGroup(aDestination, aGroup)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('destination.group', `${aDestination}.${aGroup}`)
        }
    }
    return goods || []
}
Goods.getGoodsByFilterDGrouping = async function(aDestination, aGrouping){
    let goods = Goods.getGoodsByIndex('destination.grouping', `${aDestination}.${aGrouping}`)
    if (!goods) {
        goods = await CRM.getProductsFilterByDGrouping(aDestination, aGrouping)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('destination.grouping', `${aDestination}.${aGrouping}`)
        }
    }
    return goods || []
}
Goods.getGoodsByFilterDGG = async function(aDestination, aGroup, aGrouping){
    let goods = Goods.getGoodsByIndex('destination.group.grouping', `${aDestination}.${aGroup}.${aGrouping}`)
    console.log(goods)
    if (!goods) {
        goods = await CRM.getProductsFilterByDGG(aDestination, aGroup, aGrouping)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('destination.group.grouping', `${aDestination}.${aGroup}.${aGrouping}`)
        }
    }
    return goods || []
}




// deprecated
Goods.getGoodsByDestination = async function(aDestination){
    let goods = Goods.getGoodsByIndex('destination', aDestination)
    if (!goods) {
        goods = await CRM.getProductsFilterByD(aDestination)
        if (goods) {
            Goods.indexing(goods)
            goods = Goods.getGoodsByIndex('destination', aDestination)
        }
    }
    return goods || []
}
Goods.getGoodsByGroup = function(group){
    return Goods.indexes['group']?.[group]
}
Goods.getGoodsByGrouping = function(grouping){
    return Goods.indexes['grouping']?.[grouping]
}
Goods.getGoodsByIndex = function(name, value){
    return Goods.indexes[name]?.[value]
}





App.initialize()

})($)