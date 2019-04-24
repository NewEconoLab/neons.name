/**
 * ///<reference path="../lib/neo-ts.d.ts"/>
 */
//网络请求部分 使用 fetch
const WWW = class
{
    constructor()
    {
        this.api="https://api.nel.group/api/mainnet"
        this.apiaggr = "https://apiwallet.nel.group/api/mainnet";
    }
    makeRpcUrl(url, method, ..._params)
    {
        if (url[ url.length - 1 ] != '/')
            url = url + "/";
        var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
        for (var i = 0; i < _params.length; i++)
        {
            urlout += JSON.stringify(_params[ i ]);
            if (i != _params.length - 1)
                urlout += ",";
        }
        urlout += "]";
        return urlout;
    }
    makeRpcPostBody(method, ..._params)
    {
        var body = {};
        body[ "jsonrpc" ] = "2.0";
        body[ "id" ] = 1;
        body[ "method" ] = method;
        var params = [];
        for (var i = 0; i < _params.length; i++)
        {
            params.push(_params[ i ]);
        }
        body[ "params" ] = params;
        return body;
    }

    /**
     * 查询当前地址下的分红信息
     * @param {string} addr 要查询的地址
     */
    async getcurrentbonus(addr)
    {
        var postdata = this.makeRpcPostBody("getcurrentbonus", addr);
        var result = await fetch(this.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
        var json = await result.json();
        if (json["result"])
        {
            var r = json["result"][0];
            return r;
        } else
        {
            throw "not data";
        }
    }
    
    /**
     * 申请CGAS分红
     * @param {string} addr 申请分红的地址
     */
    async applybonus(addr)
    {
        var postdata = this.makeRpcPostBody("applybonus", addr);
        var result = await fetch(this.apiaggr, { "method": "post", "body": JSON.stringify(postdata) });
        var json = await result.json();
        if (json["result"])
        {
            var r = json["result"][0];
            return r;
        } else
        {
            throw "not data";

        }
    }
}

class BonusAlert{
    constructor(modal)
    {        
        this.www = new WWW();
        this.mybonus = 0;
        this.bonusModal = document.getElementById(modal);
        this.close = document.getElementById("close"+modal);
        this.queryBonusBtn = document.getElementById("query-btn"+modal);
        this.applyBonusBtn = document.getElementById("apply"+modal);
        this.applying = document.getElementById("applying"+modal);
        this.applyed = document.getElementById("applyed"+modal);
        this.bonusInput = document.getElementById("input"+modal);
        this.claimsMessage = document.getElementById("message-claims"+modal);
        this.claimnum = document.getElementById("claimnum"+modal);
        this.claimstate0 = document.getElementById("claims-state-0"+modal);
        this.claimstate1 = document.getElementById("claims-state-1"+modal);
        this.claimstate2 = document.getElementById("claims-state-2"+modal);
        this.errorAddr = document.getElementById("error-addr"+modal);
        this.errorClaims = document.getElementById("error-claims"+modal);
        // this.bonusState = document.getElementById("bonusState"+modal);
        // this.clear();
    }

    init()
    {
        this.queryBonusBtn.onclick=()=>{
            let addr = this.bonusInput.value;
            this.queryBonus(addr);
        }
        this.close.onclick=()=>{
            this.closeModal();
        }
        this.applyBonusBtn.onclick=()=>{
            this.toApplyBonus();
        }
    }

    clear()
    {
        this.claimsMessage.hidden = true;
        this.errorClaims.hidden=true;
        this.errorAddr.hidden=true;
        this.claimstate0.hidden=true;
        this.claimstate1.hidden=true;
        this.claimstate2.hidden=true;
        this.applyBonusBtn.hidden=true;
        this.applying.hidden = true;
        this.applyed.hidden = true;
        this.claimnum.textContent="";
        // this.bonusInput.value = "";
        // this.bonusState. = "";
        // this.claimmsg = "";
    }

    clearMessage()
    {
        
    }

    stateSwitch(state)
    {
        switch (state) {
            case 0:     //可领取
                this.claimstate0.hidden = false;
                break;
        
            case 1:     //已发放
                this.claimstate1.hidden = false;
                break;
                
            case 2:     //待发放
                this.claimstate2=false;
                break;
            default:
                break;
        }
    }
    
    /**
     * 查询地址下所拥有的分红
     * @param {string} addr 查询地址
     */
    async queryBonus(addr){
        this.clear();
        if(this.verifyAddr(addr))
        {
            try {
                let result = await this.www.getcurrentbonus(addr);
                
                // console.log(result);
                
                this.mybonus = this.claimnum.textContent = parseFloat(result.send) != 0 ? result.send : 0;
                if(this.mybonus==0)
                {
                    this.errorClaims.hidden=false;
                }
                else 
                {
                    this.claimsMessage.hidden=false;
                    if(result.txid !='')
                    {
                        this.claimstate1.hidden = false;
                        this.applyed.hidden=false;
                    }
                    else if(result.applied)
                    {
                        this.claimstate2.hidden = false;
                        this.applying.hidden = false;
                    }else
                    {
                        this.claimstate0.hidden =false;
                        this.applyBonusBtn.hidden =false;
                    }
                }
            } catch (error) {
                this.errorClaims.hidden = false;
            }
        }
        else
        {
            this.errorAddr.hidden = false;
        }
        this.www.getcurrentbonus("")
    }

    // 申请领取分红
    async toApplyBonus()
    {
        let res = await this.www.applybonus(this.bonusInput.value);
        if (res.result)
        {
            // this.applyBonusBtn.hidden=true;
            this.clear();
            // this.applyBonusBtn.hidden=true;
            // this.claimstate0.hidden=true;
            // this.claimstate1.hidden=true;
            this.claimnum.textContent = this.mybonus;
            this.claimstate2.hidden=false;
            this.claimsMessage.hidden=false;
            this.applying.hidden = false;
        } else
        {
            
        }
    }
    /**
     * 验证地址格式是否正确
     * @param {string} addr 要验证的地址
     */
    verifyAddr(addr)
    {
        var verify = /^[a-zA-Z0-9]{34,34}$/;
        // var res = verify.test(addr) ? this.verifyPublicKey(addr) : false;
        var res = verify.test(addr);
        return res;
    }

        /**
     * verifyPublicKey 验证地址
     * @param publicKey 公钥
     */
    verifyPublicKey(publicKey)
    {
        var array = Neo.Cryptography.Base58.decode(publicKey);
        var check = array.subarray(21, 21 + 4); //

        var checkdata = array.subarray(0, 21);//
        var hashd = Neo.Cryptography.Sha256.computeHash(checkdata);//
        hashd = Neo.Cryptography.Sha256.computeHash(hashd);//
        var hashd = hashd.slice(0, 4);//    
        var checked = new Uint8Array(hashd);//

        var error = false;
        for (var i = 0; i < 4; i++)
        {
            if (checked[ i ] != check[ i ])
            {
                error = true;
                break;
            }
        }
        return !error;
    }
    
    closeModal()
    {
        this.clear();
        this.bonusInput.value = "";
        this.bonusModal.hidden=true;
    }
}

class app 
{
    constructor()
    {
        let pc = new BonusAlert("_pc-bonus");
        let mobile = new BonusAlert("_mobile-bonus");
        this.ledgerBtn = document.getElementById("ledger-bonus");
        pc.bonusModal.hidden=true;
        mobile.bonusModal.hidden=true;
        this.ledgerBtn.onclick=()=>{
            pc.bonusModal.hidden=false;
            mobile.bonusModal.hidden=false;
        }
        pc.init();
        mobile.init();
    }
    init()
    {

    }
}

var page = new app();
page.init();

