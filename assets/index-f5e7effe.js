import{W as pe}from"./mud-5a7edd13.js";const me=Symbol(),ee=Object.getPrototypeOf,F=new WeakMap,ge=e=>e&&(F.has(e)?F.get(e):ee(e)===Object.prototype||ee(e)===Array.prototype),he=e=>ge(e)&&e[me]||null,te=(e,t=!0)=>{F.set(e,t)},J=e=>typeof e=="object"&&e!==null,D=new WeakMap,x=new WeakSet,be=(e=Object.is,t=(n,W)=>new Proxy(n,W),s=n=>J(n)&&!x.has(n)&&(Array.isArray(n)||!(Symbol.iterator in n))&&!(n instanceof WeakMap)&&!(n instanceof WeakSet)&&!(n instanceof Error)&&!(n instanceof Number)&&!(n instanceof Date)&&!(n instanceof String)&&!(n instanceof RegExp)&&!(n instanceof ArrayBuffer),i=n=>n.configurable&&n.enumerable&&n.writable,c=n=>{switch(n.status){case"fulfilled":return n.value;case"rejected":throw n.reason;default:throw n}},d=new WeakMap,g=(n,W,C=c)=>{const b=d.get(n);if(b?.[0]===W)return b[1];const y=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n));return te(y,!0),d.set(n,[W,y]),Reflect.ownKeys(n).forEach(k=>{if(Object.getOwnPropertyDescriptor(y,k))return;const A=Reflect.get(n,k),P={value:A,enumerable:!0,configurable:!0};if(x.has(A))te(A,!1);else if(A instanceof Promise)delete P.value,P.get=()=>C(A);else if(D.has(A)){const[v,z]=D.get(A);P.value=g(v,z(),C)}Object.defineProperty(y,k,P)}),Object.preventExtensions(y)},m=new WeakMap,h=[1,1],M=n=>{if(!J(n))throw new Error("object required");const W=m.get(n);if(W)return W;let C=h[0];const b=new Set,y=(a,o=++h[0])=>{C!==o&&(C=o,b.forEach(l=>l(a,o)))};let k=h[1];const A=(a=++h[1])=>(k!==a&&!b.size&&(k=a,v.forEach(([o])=>{const l=o[1](a);l>C&&(C=l)})),C),P=a=>(o,l)=>{const r=[...o];r[1]=[a,...r[1]],y(r,l)},v=new Map,z=(a,o)=>{if(b.size){const l=o[3](P(a));v.set(a,[o,l])}else v.set(a,[o])},Y=a=>{var o;const l=v.get(a);l&&(v.delete(a),(o=l[1])==null||o.call(l))},ue=a=>(b.add(a),b.size===1&&v.forEach(([l,r],I)=>{const S=l[3](P(I));v.set(I,[l,S])}),()=>{b.delete(a),b.size===0&&v.forEach(([l,r],I)=>{r&&(r(),v.set(I,[l]))})}),H=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n)),Z=(a,o,l,r,I)=>{if(a&&(e(o,r)||m.has(r)&&e(o,m.get(r))))return;Y(l),J(r)&&(r=he(r)||r);let S=r;if(r instanceof Promise)r.then(E=>{r.status="fulfilled",r.value=E,y(["resolve",[l],E])}).catch(E=>{r.status="rejected",r.reason=E,y(["reject",[l],E])});else{!D.has(r)&&s(r)&&(S=M(r));const E=!x.has(S)&&D.get(S);E&&z(l,E)}I(S),y(["set",[l],r,o])},V=t(H,{deleteProperty(a,o){const l=Reflect.get(a,o);Y(o);const r=Reflect.deleteProperty(a,o);return r&&y(["delete",[o],l]),r},set(a,o,l,r){const I=Reflect.has(a,o),S=Reflect.get(a,o,r);return Z(I,S,o,l,E=>{Reflect.set(a,o,E,r)}),!0},defineProperty(a,o,l){if(i(l)){const r=Reflect.getOwnPropertyDescriptor(a,o);if(!r||i(r))return Z(!!r&&"value"in r,r?.value,o,l.value,I=>{Reflect.defineProperty(a,o,{...l,value:I})}),!0}return Reflect.defineProperty(a,o,l)}});m.set(n,V);const fe=[H,A,g,ue];return D.set(V,fe),Reflect.ownKeys(n).forEach(a=>{const o=Object.getOwnPropertyDescriptor(n,a);"value"in o&&(V[a]=n[a],delete o.value,delete o.writable),Object.defineProperty(H,a,o)}),V})=>[M,D,x,e,t,s,i,c,d,g,m,h],[ye]=be();function j(e={}){return ye(e)}function _(e,t,s){const i=D.get(e);let c;const d=[],g=i[3];let m=!1;const M=g(n=>{if(d.push(n),s){t(d.splice(0));return}c||(c=Promise.resolve().then(()=>{c=void 0,m&&t(d.splice(0))}))});return m=!0,()=>{m=!1,M()}}function ve(e,t){const s=D.get(e),[i,c,d]=s;return d(i,c(),t)}const u=j({history:["ConnectWallet"],view:"ConnectWallet",data:void 0}),de={state:u,subscribe(e){return _(u,()=>e(u))},push(e,t){e!==u.view&&(u.view=e,t&&(u.data=t),u.history.push(e))},reset(e){u.view=e,u.history=[e]},replace(e){u.history.length>1&&(u.history[u.history.length-1]=e,u.view=e)},goBack(){if(u.history.length>1){u.history.pop();const[e]=u.history.slice(-1);u.view=e}},setData(e){u.data=e}},p={WALLETCONNECT_DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",WCM_VERSION:"WCM_VERSION",RECOMMENDED_WALLET_AMOUNT:9,isMobile(){return typeof window<"u"?!!(window.matchMedia("(pointer:coarse)").matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)):!1},isAndroid(){return p.isMobile()&&navigator.userAgent.toLowerCase().includes("android")},isIos(){const e=navigator.userAgent.toLowerCase();return p.isMobile()&&(e.includes("iphone")||e.includes("ipad"))},isHttpUrl(e){return e.startsWith("http://")||e.startsWith("https://")},isArray(e){return Array.isArray(e)&&e.length>0},formatNativeUrl(e,t,s){if(p.isHttpUrl(e))return this.formatUniversalUrl(e,t,s);let i=e;i.includes("://")||(i=e.replaceAll("/","").replaceAll(":",""),i=`${i}://`),i.endsWith("/")||(i=`${i}/`),this.setWalletConnectDeepLink(i,s);const c=encodeURIComponent(t);return`${i}wc?uri=${c}`},formatUniversalUrl(e,t,s){if(!p.isHttpUrl(e))return this.formatNativeUrl(e,t,s);let i=e;i.endsWith("/")||(i=`${i}/`),this.setWalletConnectDeepLink(i,s);const c=encodeURIComponent(t);return`${i}wc?uri=${c}`},async wait(e){return new Promise(t=>{setTimeout(t,e)})},openHref(e,t){window.open(e,t,"noreferrer noopener")},setWalletConnectDeepLink(e,t){try{localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:e,name:t}))}catch{console.info("Unable to set WalletConnect deep link")}},setWalletConnectAndroidDeepLink(e){try{const[t]=e.split("?");localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:t,name:"Android"}))}catch{console.info("Unable to set WalletConnect android deep link")}},removeWalletConnectDeepLink(){try{localStorage.removeItem(p.WALLETCONNECT_DEEPLINK_CHOICE)}catch{console.info("Unable to remove WalletConnect deep link")}},setModalVersionInStorage(){try{typeof localStorage<"u"&&localStorage.setItem(p.WCM_VERSION,"2.6.1")}catch{console.info("Unable to set Web3Modal version in storage")}},getWalletRouterData(){var e;const t=(e=de.state.data)==null?void 0:e.Wallet;if(!t)throw new Error('Missing "Wallet" view data');return t}},we=typeof location<"u"&&(location.hostname.includes("localhost")||location.protocol.includes("https")),f=j({enabled:we,userSessionId:"",events:[],connectedWalletId:void 0}),Ie={state:f,subscribe(e){return _(f.events,()=>e(ve(f.events[f.events.length-1])))},initialize(){f.enabled&&typeof(crypto==null?void 0:crypto.randomUUID)<"u"&&(f.userSessionId=crypto.randomUUID())},setConnectedWalletId(e){f.connectedWalletId=e},click(e){if(f.enabled){const t={type:"CLICK",name:e.name,userSessionId:f.userSessionId,timestamp:Date.now(),data:e};f.events.push(t)}},track(e){if(f.enabled){const t={type:"TRACK",name:e.name,userSessionId:f.userSessionId,timestamp:Date.now(),data:e};f.events.push(t)}},view(e){if(f.enabled){const t={type:"VIEW",name:e.name,userSessionId:f.userSessionId,timestamp:Date.now(),data:e};f.events.push(t)}}},O=j({chains:void 0,walletConnectUri:void 0,isAuth:!1,isCustomDesktop:!1,isCustomMobile:!1,isDataLoaded:!1,isUiLoaded:!1}),w={state:O,subscribe(e){return _(O,()=>e(O))},setChains(e){O.chains=e},setWalletConnectUri(e){O.walletConnectUri=e},setIsCustomDesktop(e){O.isCustomDesktop=e},setIsCustomMobile(e){O.isCustomMobile=e},setIsDataLoaded(e){O.isDataLoaded=e},setIsUiLoaded(e){O.isUiLoaded=e},setIsAuth(e){O.isAuth=e}},B=j({projectId:"",mobileWallets:void 0,desktopWallets:void 0,walletImages:void 0,chains:void 0,enableAuthMode:!1,enableExplorer:!0,explorerExcludedWalletIds:void 0,explorerRecommendedWalletIds:void 0,termsOfServiceUrl:void 0,privacyPolicyUrl:void 0}),T={state:B,subscribe(e){return _(B,()=>e(B))},setConfig(e){var t,s;Ie.initialize(),w.setChains(e.chains),w.setIsAuth(!!e.enableAuthMode),w.setIsCustomMobile(!!((t=e.mobileWallets)!=null&&t.length)),w.setIsCustomDesktop(!!((s=e.desktopWallets)!=null&&s.length)),p.setModalVersionInStorage(),Object.assign(B,e)}};var Ee=Object.defineProperty,se=Object.getOwnPropertySymbols,Oe=Object.prototype.hasOwnProperty,Le=Object.prototype.propertyIsEnumerable,ne=(e,t,s)=>t in e?Ee(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,We=(e,t)=>{for(var s in t||(t={}))Oe.call(t,s)&&ne(e,s,t[s]);if(se)for(var s of se(t))Le.call(t,s)&&ne(e,s,t[s]);return e};const G="https://explorer-api.walletconnect.com",Q="wcm",X="js-2.6.1";async function K(e,t){const s=We({sdkType:Q,sdkVersion:X},t),i=new URL(e,G);return i.searchParams.append("projectId",T.state.projectId),Object.entries(s).forEach(([c,d])=>{d&&i.searchParams.append(c,String(d))}),(await fetch(i)).json()}const U={async getDesktopListings(e){return K("/w3m/v1/getDesktopListings",e)},async getMobileListings(e){return K("/w3m/v1/getMobileListings",e)},async getInjectedListings(e){return K("/w3m/v1/getInjectedListings",e)},async getAllListings(e){return K("/w3m/v1/getAllListings",e)},getWalletImageUrl(e){return`${G}/w3m/v1/getWalletImage/${e}?projectId=${T.state.projectId}&sdkType=${Q}&sdkVersion=${X}`},getAssetImageUrl(e){return`${G}/w3m/v1/getAssetImage/${e}?projectId=${T.state.projectId}&sdkType=${Q}&sdkVersion=${X}`}};var Ae=Object.defineProperty,oe=Object.getOwnPropertySymbols,Ce=Object.prototype.hasOwnProperty,Se=Object.prototype.propertyIsEnumerable,re=(e,t,s)=>t in e?Ae(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,De=(e,t)=>{for(var s in t||(t={}))Ce.call(t,s)&&re(e,s,t[s]);if(oe)for(var s of oe(t))Se.call(t,s)&&re(e,s,t[s]);return e};const ie=p.isMobile(),L=j({wallets:{listings:[],total:0,page:1},search:{listings:[],total:0,page:1},recomendedWallets:[]}),Te={state:L,async getRecomendedWallets(){const{explorerRecommendedWalletIds:e,explorerExcludedWalletIds:t}=T.state;if(e==="NONE"||t==="ALL"&&!e)return L.recomendedWallets;if(p.isArray(e)){const s={recommendedIds:e.join(",")},{listings:i}=await U.getAllListings(s),c=Object.values(i);c.sort((d,g)=>{const m=e.indexOf(d.id),h=e.indexOf(g.id);return m-h}),L.recomendedWallets=c}else{const{chains:s,isAuth:i}=w.state,c=s?.join(","),d=p.isArray(t),g={page:1,sdks:i?"auth_v1":void 0,entries:p.RECOMMENDED_WALLET_AMOUNT,chains:c,version:2,excludedIds:d?t.join(","):void 0},{listings:m}=ie?await U.getMobileListings(g):await U.getDesktopListings(g);L.recomendedWallets=Object.values(m)}return L.recomendedWallets},async getWallets(e){const t=De({},e),{explorerRecommendedWalletIds:s,explorerExcludedWalletIds:i}=T.state,{recomendedWallets:c}=L;if(i==="ALL")return L.wallets;c.length?t.excludedIds=c.map(W=>W.id).join(","):p.isArray(s)&&(t.excludedIds=s.join(",")),p.isArray(i)&&(t.excludedIds=[t.excludedIds,i].filter(Boolean).join(",")),w.state.isAuth&&(t.sdks="auth_v1");const{page:d,search:g}=e,{listings:m,total:h}=ie?await U.getMobileListings(t):await U.getDesktopListings(t),M=Object.values(m),n=g?"search":"wallets";return L[n]={listings:[...L[n].listings,...M],total:h,page:d??1},{listings:M,total:h}},getWalletImageUrl(e){return U.getWalletImageUrl(e)},getAssetImageUrl(e){return U.getAssetImageUrl(e)},resetSearch(){L.search={listings:[],total:0,page:1}}},N=j({open:!1}),q={state:N,subscribe(e){return _(N,()=>e(N))},async open(e){return new Promise(t=>{const{isUiLoaded:s,isDataLoaded:i}=w.state;if(p.removeWalletConnectDeepLink(),w.setWalletConnectUri(e?.uri),w.setChains(e?.chains),de.reset("ConnectWallet"),s&&i)N.open=!0,t();else{const c=setInterval(()=>{const d=w.state;d.isUiLoaded&&d.isDataLoaded&&(clearInterval(c),N.open=!0,t())},200)}})},close(){N.open=!1}};var je=Object.defineProperty,ae=Object.getOwnPropertySymbols,Me=Object.prototype.hasOwnProperty,Pe=Object.prototype.propertyIsEnumerable,le=(e,t,s)=>t in e?je(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,Ue=(e,t)=>{for(var s in t||(t={}))Me.call(t,s)&&le(e,s,t[s]);if(ae)for(var s of ae(t))Pe.call(t,s)&&le(e,s,t[s]);return e};function Re(){return typeof matchMedia<"u"&&matchMedia("(prefers-color-scheme: dark)").matches}const $=j({themeMode:Re()?"dark":"light"}),ce={state:$,subscribe(e){return _($,()=>e($))},setThemeConfig(e){const{themeMode:t,themeVariables:s}=e;t&&($.themeMode=t),s&&($.themeVariables=Ue({},s))}},R=j({open:!1,message:"",variant:"success"}),$e={state:R,subscribe(e){return _(R,()=>e(R))},openToast(e,t){R.open=!0,R.message=e,R.variant=t},closeToast(){R.open=!1}};class _e{constructor(t){this.openModal=q.open,this.closeModal=q.close,this.subscribeModal=q.subscribe,this.setTheme=ce.setThemeConfig,ce.setThemeConfig(t),T.setConfig(t),this.initUi()}async initUi(){if(typeof window<"u"){await pe(()=>import("./index-c3c804bd.js"),["assets/index-c3c804bd.js","assets/browser-26af7422.js","assets/index-8cbc8e09.js","assets/mud-5a7edd13.js","assets/react-2aec0df7.js","assets/phaser-ae52f4d1.js","assets/index-70c9ecab.css"]);const t=document.createElement("wcm-modal");document.body.insertAdjacentElement("beforeend",t),w.setIsUiLoaded(!0)}}}const Ve=Object.freeze(Object.defineProperty({__proto__:null,WalletConnectModal:_e},Symbol.toStringTag,{value:"Module"}));export{Ie as R,de as T,p as a,Ve as i,ce as n,$e as o,w as p,q as s,Te as t,T as y};
//# sourceMappingURL=index-f5e7effe.js.map
