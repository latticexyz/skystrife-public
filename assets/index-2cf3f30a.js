import{b as $r,s as Pr,n as Dr,c as ne,I as jr,E as Pt,f as _t,J as dt,H as Hr}from"./http-c41e2d8f.js";import{g as Pe,b as Dt}from"./react-60d820b0.js";import{an as Br,ao as Wr,ap as Fr,aq as zr,ar as Qr,as as Vr,at as Jr,au as Gr,av as Yr,aw as Kr,ax as Zr,ay as Xr,az as eo,aA as to,aB as no,aC as ro,aD as oo,aE as io}from"./index-444a8a0c.js";import{b as so}from"./browser-6e00ca07.js";import"./mud-7b3e2a9c.js";import"./phaser-f1ffc97e.js";var re,v,jt,H,ft,Ht,Te,Bt,z={},Wt=[],ao=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,pe=Array.isArray;function A(t,e){for(var n in e)t[n]=e[n];return t}function Ft(t){var e=t.parentNode;e&&e.removeChild(t)}function M(t,e,n){var r,o,i,c={};for(i in e)i=="key"?r=e[i]:i=="ref"?o=e[i]:c[i]=e[i];if(arguments.length>2&&(c.children=arguments.length>3?re.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(i in t.defaultProps)c[i]===void 0&&(c[i]=t.defaultProps[i]);return K(t,c,r,o,null)}function K(t,e,n,r,o){var i={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:o??++jt};return o==null&&v.vnode!=null&&v.vnode(i),i}function zt(){return{current:null}}function L(t){return t.children}function N(t,e){this.props=t,this.context=e}function X(t,e){if(e==null)return t.__?X(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__d||n.__e;return typeof t.type=="function"?X(t):null}function Qt(t){var e,n;if((t=t.__)!=null&&t.__c!=null){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null){t.__e=t.__c.base=n.__e;break}return Qt(t)}}function Oe(t){(!t.__d&&(t.__d=!0)&&H.push(t)&&!_e.__r++||ft!==v.debounceRendering)&&((ft=v.debounceRendering)||Ht)(_e)}function _e(){var t,e,n,r,o,i,c,u,d;for(H.sort(Te);t=H.shift();)t.__d&&(e=H.length,r=void 0,o=void 0,i=void 0,u=(c=(n=t).__v).__e,(d=n.__P)&&(r=[],o=[],(i=A({},c)).__v=c.__v+1,De(d,c,i,n.__n,d.ownerSVGElement!==void 0,c.__h!=null?[u]:null,r,u??X(c),c.__h,o),Yt(r,c,o),c.__e!=u&&Qt(c)),H.length>e&&H.sort(Te));_e.__r=0}function Vt(t,e,n,r,o,i,c,u,d,y,g){var s,E,b,m,k,R,a,l,f,_=0,h=r&&r.__k||Wt,C=h.length,w=C,x=e.length;for(n.__k=[],s=0;s<x;s++)(m=n.__k[s]=(m=e[s])==null||typeof m=="boolean"||typeof m=="function"?null:typeof m=="string"||typeof m=="number"||typeof m=="bigint"?K(null,m,null,null,m):pe(m)?K(L,{children:m},null,null,null):m.__b>0?K(m.type,m.props,m.key,m.ref?m.ref:null,m.__v):m)!=null?(m.__=n,m.__b=n.__b+1,(l=co(m,h,a=s+_,w))===-1?b=z:(b=h[l]||z,h[l]=void 0,w--),De(t,m,b,o,i,c,u,d,y,g),k=m.__e,(E=m.ref)&&b.ref!=E&&(b.ref&&je(b.ref,null,m),g.push(E,m.__c||k,m)),k!=null&&(R==null&&(R=k),(f=b===z||b.__v===null)?l==-1&&_--:l!==a&&(l===a+1?_++:l>a?w>x-a?_+=l-a:_--:_=l<a&&l==a-1?l-a:0),a=s+_,typeof m.type!="function"||l===a&&b.__k!==m.__k?typeof m.type=="function"||l===a&&!f?m.__d!==void 0?(d=m.__d,m.__d=void 0):d=k.nextSibling:d=Gt(t,k,d):d=Jt(m,d,t),typeof n.type=="function"&&(n.__d=d))):(b=h[s])&&b.key==null&&b.__e&&(b.__e==d&&(b.__=r,d=X(b)),Ne(b,b,!1),h[s]=null);for(n.__e=R,s=C;s--;)h[s]!=null&&(typeof n.type=="function"&&h[s].__e!=null&&h[s].__e==n.__d&&(n.__d=h[s].__e.nextSibling),Ne(h[s],h[s]))}function Jt(t,e,n){for(var r,o=t.__k,i=0;o&&i<o.length;i++)(r=o[i])&&(r.__=t,e=typeof r.type=="function"?Jt(r,e,n):Gt(n,r.__e,e));return e}function q(t,e){return e=e||[],t==null||typeof t=="boolean"||(pe(t)?t.some(function(n){q(n,e)}):e.push(t)),e}function Gt(t,e,n){return n==null||n.parentNode!==t?t.insertBefore(e,null):e==n&&e.parentNode!=null||t.insertBefore(e,n),e.nextSibling}function co(t,e,n,r){var o=t.key,i=t.type,c=n-1,u=n+1,d=e[n];if(d===null||d&&o==d.key&&i===d.type)return n;if(r>(d!=null?1:0))for(;c>=0||u<e.length;){if(c>=0){if((d=e[c])&&o==d.key&&i===d.type)return c;c--}if(u<e.length){if((d=e[u])&&o==d.key&&i===d.type)return u;u++}}return-1}function lo(t,e,n,r,o){var i;for(i in n)i==="children"||i==="key"||i in e||de(t,i,null,n[i],r);for(i in e)o&&typeof e[i]!="function"||i==="children"||i==="key"||i==="value"||i==="checked"||n[i]===e[i]||de(t,i,e[i],n[i],r)}function ht(t,e,n){e[0]==="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||ao.test(e)?n:n+"px"}function de(t,e,n,r,o){var i;e:if(e==="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||ht(t.style,e,"");if(n)for(e in n)r&&n[e]===r[e]||ht(t.style,e,n[e])}else if(e[0]==="o"&&e[1]==="n")i=e!==(e=e.replace(/(PointerCapture)$|Capture$/,"$1")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+i]=n,n?r?n.u=r.u:(n.u=Date.now(),t.addEventListener(e,i?mt:pt,i)):t.removeEventListener(e,i?mt:pt,i);else if(e!=="dangerouslySetInnerHTML"){if(o)e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!=="width"&&e!=="height"&&e!=="href"&&e!=="list"&&e!=="form"&&e!=="tabIndex"&&e!=="download"&&e!=="rowSpan"&&e!=="colSpan"&&e!=="role"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!=="-"?t.removeAttribute(e):t.setAttribute(e,n))}}function pt(t){var e=this.l[t.type+!1];if(t.t){if(t.t<=e.u)return}else t.t=Date.now();return e(v.event?v.event(t):t)}function mt(t){return this.l[t.type+!0](v.event?v.event(t):t)}function De(t,e,n,r,o,i,c,u,d,y){var g,s,E,b,m,k,R,a,l,f,_,h,C,w,x,I=e.type;if(e.constructor!==void 0)return null;n.__h!=null&&(d=n.__h,u=e.__e=n.__e,e.__h=null,i=[u]),(g=v.__b)&&g(e);e:if(typeof I=="function")try{if(a=e.props,l=(g=I.contextType)&&r[g.__c],f=g?l?l.props.value:g.__:r,n.__c?R=(s=e.__c=n.__c).__=s.__E:("prototype"in I&&I.prototype.render?e.__c=s=new I(a,f):(e.__c=s=new N(a,f),s.constructor=I,s.render=_o),l&&l.sub(s),s.props=a,s.state||(s.state={}),s.context=f,s.__n=r,E=s.__d=!0,s.__h=[],s._sb=[]),s.__s==null&&(s.__s=s.state),I.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=A({},s.__s)),A(s.__s,I.getDerivedStateFromProps(a,s.__s))),b=s.props,m=s.state,s.__v=e,E)I.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(I.getDerivedStateFromProps==null&&a!==b&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(a,f),!s.__e&&(s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(a,s.__s,f)===!1||e.__v===n.__v)){for(e.__v!==n.__v&&(s.props=a,s.state=s.__s,s.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.forEach(function(O){O&&(O.__=e)}),_=0;_<s._sb.length;_++)s.__h.push(s._sb[_]);s._sb=[],s.__h.length&&c.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(a,s.__s,f),s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(b,m,k)})}if(s.context=f,s.props=a,s.__P=t,s.__e=!1,h=v.__r,C=0,"prototype"in I&&I.prototype.render){for(s.state=s.__s,s.__d=!1,h&&h(e),g=s.render(s.props,s.state,s.context),w=0;w<s._sb.length;w++)s.__h.push(s._sb[w]);s._sb=[]}else do s.__d=!1,h&&h(e),g=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++C<25);s.state=s.__s,s.getChildContext!=null&&(r=A(A({},r),s.getChildContext())),E||s.getSnapshotBeforeUpdate==null||(k=s.getSnapshotBeforeUpdate(b,m)),Vt(t,pe(x=g!=null&&g.type===L&&g.key==null?g.props.children:g)?x:[x],e,n,r,o,i,c,u,d,y),s.base=e.__e,e.__h=null,s.__h.length&&c.push(s),R&&(s.__E=s.__=null)}catch(O){e.__v=null,(d||i!=null)&&(e.__e=u,e.__h=!!d,i[i.indexOf(u)]=null),v.__e(O,e,n)}else i==null&&e.__v===n.__v?(e.__k=n.__k,e.__e=n.__e):e.__e=uo(n.__e,e,n,r,o,i,c,d,y);(g=v.diffed)&&g(e)}function Yt(t,e,n){for(var r=0;r<n.length;r++)je(n[r],n[++r],n[++r]);v.__c&&v.__c(e,t),t.some(function(o){try{t=o.__h,o.__h=[],t.some(function(i){i.call(o)})}catch(i){v.__e(i,o.__v)}})}function uo(t,e,n,r,o,i,c,u,d){var y,g,s,E=n.props,b=e.props,m=e.type,k=0;if(m==="svg"&&(o=!0),i!=null){for(;k<i.length;k++)if((y=i[k])&&"setAttribute"in y==!!m&&(m?y.localName===m:y.nodeType===3)){t=y,i[k]=null;break}}if(t==null){if(m===null)return document.createTextNode(b);t=o?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,b.is&&b),i=null,u=!1}if(m===null)E===b||u&&t.data===b||(t.data=b);else{if(i=i&&re.call(t.childNodes),g=(E=n.props||z).dangerouslySetInnerHTML,s=b.dangerouslySetInnerHTML,!u){if(i!=null)for(E={},k=0;k<t.attributes.length;k++)E[t.attributes[k].name]=t.attributes[k].value;(s||g)&&(s&&(g&&s.__html==g.__html||s.__html===t.innerHTML)||(t.innerHTML=s&&s.__html||""))}if(lo(t,b,E,o,u),s)e.__k=[];else if(Vt(t,pe(k=e.props.children)?k:[k],e,n,r,o&&m!=="foreignObject",i,c,i?i[0]:n.__k&&X(n,0),u,d),i!=null)for(k=i.length;k--;)i[k]!=null&&Ft(i[k]);u||("value"in b&&(k=b.value)!==void 0&&(k!==t.value||m==="progress"&&!k||m==="option"&&k!==E.value)&&de(t,"value",k,E.value,!1),"checked"in b&&(k=b.checked)!==void 0&&k!==t.checked&&de(t,"checked",k,E.checked,!1))}return t}function je(t,e,n){try{typeof t=="function"?t(e):t.current=e}catch(r){v.__e(r,n)}}function Ne(t,e,n){var r,o;if(v.unmount&&v.unmount(t),(r=t.ref)&&(r.current&&r.current!==t.__e||je(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(i){v.__e(i,e)}r.base=r.__P=null,t.__c=void 0}if(r=t.__k)for(o=0;o<r.length;o++)r[o]&&Ne(r[o],e,n||typeof t.type!="function");n||t.__e==null||Ft(t.__e),t.__=t.__e=t.__d=void 0}function _o(t,e,n){return this.constructor(t,n)}function ee(t,e,n){var r,o,i,c;v.__&&v.__(t,e),o=(r=typeof n=="function")?null:n&&n.__k||e.__k,i=[],c=[],De(e,t=(!r&&n||e).__k=M(L,null,[t]),o||z,z,e.ownerSVGElement!==void 0,!r&&n?[n]:o?null:e.firstChild?re.call(e.childNodes):null,i,!r&&n?n:o?o.__e:e.firstChild,r,c),Yt(i,t,c)}function Kt(t,e){ee(t,e,Kt)}function fo(t,e,n){var r,o,i,c,u=A({},t.props);for(i in t.type&&t.type.defaultProps&&(c=t.type.defaultProps),e)i=="key"?r=e[i]:i=="ref"?o=e[i]:u[i]=e[i]===void 0&&c!==void 0?c[i]:e[i];return arguments.length>2&&(u.children=arguments.length>3?re.call(arguments,2):n),K(t.type,u,r||t.key,o||t.ref,null)}function Zt(t,e){var n={__c:e="__cC"+Bt++,__:t,Consumer:function(r,o){return r.children(o)},Provider:function(r){var o,i;return this.getChildContext||(o=[],(i={})[e]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(c){this.props.value!==c.value&&o.some(function(u){u.__e=!0,Oe(u)})},this.sub=function(c){o.push(c);var u=c.componentWillUnmount;c.componentWillUnmount=function(){o.splice(o.indexOf(c),1),u&&u.call(c)}}),r.children}};return n.Provider.__=n.Consumer.contextType=n}re=Wt.slice,v={__e:function(t,e,n,r){for(var o,i,c;e=e.__;)if((o=e.__c)&&!o.__)try{if((i=o.constructor)&&i.getDerivedStateFromError!=null&&(o.setState(i.getDerivedStateFromError(t)),c=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(t,r||{}),c=o.__d),c)return o.__E=o}catch(u){t=u}throw t}},jt=0,N.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=A({},this.state),typeof t=="function"&&(t=t(A({},n),this.props)),t&&A(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Oe(this))},N.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Oe(this))},N.prototype.render=L,H=[],Ht=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Te=function(t,e){return t.__v.__b-e.__v.__b},_e.__r=0,Bt=0;var U,S,Ce,gt,Q=0,Xt=[],ce=[],vt=v.__b,yt=v.__r,wt=v.diffed,bt=v.__c,Et=v.unmount;function B(t,e){v.__h&&v.__h(S,t,Q||e),Q=0;var n=S.__H||(S.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({__V:ce}),n.__[t]}function me(t){return Q=1,He(an,t)}function He(t,e,n){var r=B(U++,2);if(r.t=t,!r.__c&&(r.__=[n?n(e):an(void 0,e),function(u){var d=r.__N?r.__N[0]:r.__[0],y=r.t(d,u);d!==y&&(r.__N=[y,r.__[1]],r.__c.setState({}))}],r.__c=S,!S.u)){var o=function(u,d,y){if(!r.__c.__H)return!0;var g=r.__c.__H.__.filter(function(E){return E.__c});if(g.every(function(E){return!E.__N}))return!i||i.call(this,u,d,y);var s=!1;return g.forEach(function(E){if(E.__N){var b=E.__[0];E.__=E.__N,E.__N=void 0,b!==E.__[0]&&(s=!0)}}),!(!s&&r.__c.props===u)&&(!i||i.call(this,u,d,y))};S.u=!0;var i=S.shouldComponentUpdate,c=S.componentWillUpdate;S.componentWillUpdate=function(u,d,y){if(this.__e){var g=i;i=void 0,o(u,d,y),i=g}c&&c.call(this,u,d,y)},S.shouldComponentUpdate=o}return r.__N||r.__}function Be(t,e){var n=B(U++,3);!v.__s&&We(n.__H,e)&&(n.__=t,n.i=e,S.__H.__h.push(n))}function oe(t,e){var n=B(U++,4);!v.__s&&We(n.__H,e)&&(n.__=t,n.i=e,S.__h.push(n))}function en(t){return Q=5,ge(function(){return{current:t}},[])}function tn(t,e,n){Q=6,oe(function(){return typeof t=="function"?(t(e()),function(){return t(null)}):t?(t.current=e(),function(){return t.current=null}):void 0},n==null?n:n.concat(t))}function ge(t,e){var n=B(U++,7);return We(n.__H,e)?(n.__V=t(),n.i=e,n.__h=t,n.__V):n.__}function nn(t,e){return Q=8,ge(function(){return t},e)}function rn(t){var e=S.context[t.__c],n=B(U++,9);return n.c=t,e?(n.__==null&&(n.__=!0,e.sub(S)),e.props.value):t.__}function on(t,e){v.useDebugValue&&v.useDebugValue(e?e(t):t)}function ho(t){var e=B(U++,10),n=me();return e.__=t,S.componentDidCatch||(S.componentDidCatch=function(r,o){e.__&&e.__(r,o),n[1](r)}),[n[0],function(){n[1](void 0)}]}function sn(){var t=B(U++,11);if(!t.__){for(var e=S.__v;e!==null&&!e.__m&&e.__!==null;)e=e.__;var n=e.__m||(e.__m=[0,0]);t.__="P"+n[0]+"-"+n[1]++}return t.__}function po(){for(var t;t=Xt.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(le),t.__H.__h.forEach(Me),t.__H.__h=[]}catch(e){t.__H.__h=[],v.__e(e,t.__v)}}v.__b=function(t){S=null,vt&&vt(t)},v.__r=function(t){yt&&yt(t),U=0;var e=(S=t.__c).__H;e&&(Ce===S?(e.__h=[],S.__h=[],e.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=ce,n.__N=n.i=void 0})):(e.__h.forEach(le),e.__h.forEach(Me),e.__h=[],U=0)),Ce=S},v.diffed=function(t){wt&&wt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Xt.push(e)!==1&&gt===v.requestAnimationFrame||((gt=v.requestAnimationFrame)||mo)(po)),e.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==ce&&(n.__=n.__V),n.i=void 0,n.__V=ce})),Ce=S=null},v.__c=function(t,e){e.some(function(n){try{n.__h.forEach(le),n.__h=n.__h.filter(function(r){return!r.__||Me(r)})}catch(r){e.some(function(o){o.__h&&(o.__h=[])}),e=[],v.__e(r,n.__v)}}),bt&&bt(t,e)},v.unmount=function(t){Et&&Et(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.forEach(function(r){try{le(r)}catch(o){e=o}}),n.__H=void 0,e&&v.__e(e,n.__v))};var kt=typeof requestAnimationFrame=="function";function mo(t){var e,n=function(){clearTimeout(r),kt&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,100);kt&&(e=requestAnimationFrame(n))}function le(t){var e=S,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),S=e}function Me(t){var e=S;t.__c=t.__(),S=e}function We(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function an(t,e){return typeof e=="function"?e(t):e}const Se="Session currently connected",j="Session currently disconnected",go="Session Rejected",vo="Missing JSON RPC response",yo='JSON-RPC success response must include "result" field',wo='JSON-RPC error response must include "error" field',bo='JSON RPC request must have valid "method" value',Eo='JSON RPC request must have valid "id" value',ko="Missing one of the required parameters: bridge / uri / session",Ct="JSON RPC response format is invalid",Co="URI format is invalid",So="QRCode Modal not provided",St="User close QRCode Modal",xo=["session_request","session_update","exchange_key","connect","disconnect","display_uri","modal_closed","transport_open","transport_close","transport_error"],Io=["wallet_addEthereumChain","wallet_switchEthereumChain","wallet_getPermissions","wallet_requestPermissions","wallet_registerOnboarding","wallet_watchAsset","wallet_scanQRCode"],Fe=["eth_sendTransaction","eth_signTransaction","eth_sign","eth_signTypedData","eth_signTypedData_v1","eth_signTypedData_v2","eth_signTypedData_v3","eth_signTypedData_v4","personal_sign",...Io],Le="WALLETCONNECT_DEEPLINK_CHOICE",Ro={1:"mainnet",3:"ropsten",4:"rinkeby",5:"goerli",42:"kovan"};var cn=ze;ze.strict=ln;ze.loose=un;var To=Object.prototype.toString,Oo={"[object Int8Array]":!0,"[object Int16Array]":!0,"[object Int32Array]":!0,"[object Uint8Array]":!0,"[object Uint8ClampedArray]":!0,"[object Uint16Array]":!0,"[object Uint32Array]":!0,"[object Float32Array]":!0,"[object Float64Array]":!0};function ze(t){return ln(t)||un(t)}function ln(t){return t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array||t instanceof Uint8Array||t instanceof Uint8ClampedArray||t instanceof Uint16Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array}function un(t){return Oo[To.call(t)]}const No=Pe(cn);var Mo=cn.strict,Lo=function(e){if(Mo(e)){var n=Buffer.from(e.buffer);return e.byteLength!==e.buffer.byteLength&&(n=n.slice(e.byteOffset,e.byteOffset+e.byteLength)),n}else return Buffer.from(e)};const Ao=Pe(Lo),Qe="hex",Ve="utf8",qo="binary",Uo="buffer",$o="array",Po="typed-array",Do="array-buffer",ve="0";function V(t){return new Uint8Array(t)}function Je(t,e=!1){const n=t.toString(Qe);return e?ie(n):n}function Ge(t){return t.toString(Ve)}function _n(t){return t.readUIntBE(0,t.length)}function G(t){return Ao(t)}function $(t,e=!1){return Je(G(t),e)}function dn(t){return Ge(G(t))}function fn(t){return _n(G(t))}function Ye(t){return Buffer.from(J(t),Qe)}function P(t){return V(Ye(t))}function jo(t){return Ge(Ye(t))}function Ho(t){return fn(P(t))}function Ke(t){return Buffer.from(t,Ve)}function hn(t){return V(Ke(t))}function Bo(t,e=!1){return Je(Ke(t),e)}function Wo(t){const e=parseInt(t,10);return ai(si(e),"Number can only safely store up to 53 bits"),e}function Fo(t){return Jo(Ze(t))}function zo(t){return Xe(Ze(t))}function Qo(t,e){return Go(Ze(t),e)}function Vo(t){return`${t}`}function Ze(t){const e=(t>>>0).toString(2);return tt(e)}function Jo(t){return G(Xe(t))}function Xe(t){return new Uint8Array(ti(t).map(e=>parseInt(e,2)))}function Go(t,e){return $(Xe(t),e)}function Yo(t){return!(typeof t!="string"||!new RegExp(/^[01]+$/).test(t)||t.length%8!==0)}function pn(t,e){return!(typeof t!="string"||!t.match(/^0x[0-9A-Fa-f]*$/)||e&&t.length!==2+2*e)}function ye(t){return Buffer.isBuffer(t)}function et(t){return No.strict(t)&&!ye(t)}function mn(t){return!et(t)&&!ye(t)&&typeof t.byteLength<"u"}function Ko(t){return ye(t)?Uo:et(t)?Po:mn(t)?Do:Array.isArray(t)?$o:typeof t}function Zo(t){return Yo(t)?qo:pn(t)?Qe:Ve}function Xo(...t){return Buffer.concat(t)}function gn(...t){let e=[];return t.forEach(n=>e=e.concat(Array.from(n))),new Uint8Array([...e])}function ei(t,e=8){const n=t%e;return n?(t-n)/e*e+e:t}function ti(t,e=8){const n=tt(t).match(new RegExp(`.{${e}}`,"gi"));return Array.from(n||[])}function tt(t,e=8,n=ve){return ni(t,ei(t.length,e),n)}function ni(t,e,n=ve){return ci(t,e,!0,n)}function J(t){return t.replace(/^0x/,"")}function ie(t){return t.startsWith("0x")?t:`0x${t}`}function ri(t){return t=J(t),t=tt(t,2),t&&(t=ie(t)),t}function oi(t){const e=t.startsWith("0x");return t=J(t),t=t.startsWith(ve)?t.substring(1):t,e?ie(t):t}function ii(t){return typeof t>"u"}function si(t){return!ii(t)}function ai(t,e){if(!t)throw new Error(e)}function ci(t,e,n,r=ve){const o=e-t.length;let i=t;if(o>0){const c=r.repeat(o);i=n?c+t:t+c}return i}function fe(t){return G(new Uint8Array(t))}function li(t){return dn(new Uint8Array(t))}function vn(t,e){return $(new Uint8Array(t),!e)}function ui(t){return fn(new Uint8Array(t))}function _i(...t){return P(t.map(e=>$(new Uint8Array(e))).join("")).buffer}function yn(t){return V(t).buffer}function di(t){return Ge(t)}function fi(t,e){return Je(t,!e)}function hi(t){return _n(t)}function pi(...t){return Xo(...t)}function mi(t){return hn(t).buffer}function gi(t){return Ke(t)}function vi(t,e){return Bo(t,!e)}function yi(t){return Wo(t)}function wi(t){return Ye(t)}function wn(t){return P(t).buffer}function bi(t){return jo(t)}function Ei(t){return Ho(t)}function ki(t){return Fo(t)}function Ci(t){return zo(t).buffer}function Si(t){return Vo(t)}function bn(t,e){return Qo(Number(t),!e)}const xi=zr,Ii=Qr,Ri=Vr,Ti=Jr,Oi=Gr,En=Fr,Ni=Yr,kn=Br,Mi=Kr,Li=Zr,Ai=Xr,we=Wr;function be(t){return eo(t)}function Ee(){const t=be();return t&&t.os?t.os:void 0}function Cn(){const t=Ee();return t?t.toLowerCase().includes("android"):!1}function Sn(){const t=Ee();return t?t.toLowerCase().includes("ios")||t.toLowerCase().includes("mac")&&navigator.maxTouchPoints>1:!1}function xn(){return Ee()?Cn()||Sn():!1}function In(){const t=be();return t&&t.name?t.name.toLowerCase()==="node":!1}function Rn(){return!In()&&!!En()}const Tn=$r,On=Pr;function nt(t,e){const n=On(e),r=we();r&&r.setItem(t,n)}function rt(t){let e=null,n=null;const r=we();return r&&(n=r.getItem(t)),e=n&&Tn(n),e}function ot(t){const e=we();e&&e.removeItem(t)}function Ae(){return to()}function qi(t){return ri(t)}function Ui(t){return ie(t)}function $i(t){return J(t)}function Pi(t){return oi(ie(t))}const Nn=Dr;function ue(){return((e,n)=>{for(n=e="";e++<36;n+=e*51&52?(e^15?8^Math.random()*(e^20?16:4):4).toString(16):"-");return n})()}function Di(){console.warn("DEPRECATION WARNING: This WalletConnect client library will be deprecated in favor of @walletconnect/client. Please check docs.walletconnect.org to learn more about this migration!")}function Mn(t,e){let n;const r=Ro[t];return r&&(n=`https://${r}.infura.io/v3/${e}`),n}function Ln(t,e){let n;const r=Mn(t,e.infuraId);return e.custom&&e.custom[t]?n=e.custom[t]:r&&(n=r),n}function ji(t,e){const n=encodeURIComponent(t);return e.universalLink?`${e.universalLink}/wc?uri=${n}`:e.deepLink?`${e.deepLink}${e.deepLink.endsWith(":")?"//":"/"}wc?uri=${n}`:""}function Hi(t){const e=t.href.split("?")[0];nt(Le,Object.assign(Object.assign({},t),{href:e}))}function An(t,e){return t.filter(n=>n.name.toLowerCase().includes(e.toLowerCase()))[0]}function Bi(t,e){let n=t;return e&&(n=e.map(r=>An(t,r)).filter(Boolean)),n}function Wi(t,e){return async(...r)=>new Promise((o,i)=>{const c=(u,d)=>{(u===null||typeof u>"u")&&i(u),o(d)};t.apply(e,[...r,c])})}function qn(t){const e=t.message||"Failed or Rejected Request";let n=-32e3;if(t&&!t.code)switch(e){case"Parse error":n=-32700;break;case"Invalid request":n=-32600;break;case"Method not found":n=-32601;break;case"Invalid params":n=-32602;break;case"Internal error":n=-32603;break;default:n=-32e3;break}const r={code:n,message:e};return t.data&&(r.data=t.data),r}const Un="https://registry.walletconnect.com";function Fi(){return Un+"/api/v2/wallets"}function zi(){return Un+"/api/v2/dapps"}function $n(t,e="mobile"){var n;return{name:t.name||"",shortName:t.metadata.shortName||"",color:t.metadata.colors.primary||"",logo:(n=t.image_url.sm)!==null&&n!==void 0?n:"",universalLink:t[e].universal||"",deepLink:t[e].native||""}}function Qi(t,e="mobile"){return Object.values(t).filter(n=>!!n[e].universal||!!n[e].native).map(n=>$n(n,e))}var it={};(function(t){const e=oo,n=io,r=no,o=ro,i=a=>a==null;function c(a){switch(a.arrayFormat){case"index":return l=>(f,_)=>{const h=f.length;return _===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,[y(l,a),"[",h,"]"].join("")]:[...f,[y(l,a),"[",y(h,a),"]=",y(_,a)].join("")]};case"bracket":return l=>(f,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,[y(l,a),"[]"].join("")]:[...f,[y(l,a),"[]=",y(_,a)].join("")];case"comma":case"separator":return l=>(f,_)=>_==null||_.length===0?f:f.length===0?[[y(l,a),"=",y(_,a)].join("")]:[[f,y(_,a)].join(a.arrayFormatSeparator)];default:return l=>(f,_)=>_===void 0||a.skipNull&&_===null||a.skipEmptyString&&_===""?f:_===null?[...f,y(l,a)]:[...f,[y(l,a),"=",y(_,a)].join("")]}}function u(a){let l;switch(a.arrayFormat){case"index":return(f,_,h)=>{if(l=/\[(\d*)\]$/.exec(f),f=f.replace(/\[\d*\]$/,""),!l){h[f]=_;return}h[f]===void 0&&(h[f]={}),h[f][l[1]]=_};case"bracket":return(f,_,h)=>{if(l=/(\[\])$/.exec(f),f=f.replace(/\[\]$/,""),!l){h[f]=_;return}if(h[f]===void 0){h[f]=[_];return}h[f]=[].concat(h[f],_)};case"comma":case"separator":return(f,_,h)=>{const C=typeof _=="string"&&_.includes(a.arrayFormatSeparator),w=typeof _=="string"&&!C&&g(_,a).includes(a.arrayFormatSeparator);_=w?g(_,a):_;const x=C||w?_.split(a.arrayFormatSeparator).map(I=>g(I,a)):_===null?_:g(_,a);h[f]=x};default:return(f,_,h)=>{if(h[f]===void 0){h[f]=_;return}h[f]=[].concat(h[f],_)}}}function d(a){if(typeof a!="string"||a.length!==1)throw new TypeError("arrayFormatSeparator must be single character string")}function y(a,l){return l.encode?l.strict?e(a):encodeURIComponent(a):a}function g(a,l){return l.decode?n(a):a}function s(a){return Array.isArray(a)?a.sort():typeof a=="object"?s(Object.keys(a)).sort((l,f)=>Number(l)-Number(f)).map(l=>a[l]):a}function E(a){const l=a.indexOf("#");return l!==-1&&(a=a.slice(0,l)),a}function b(a){let l="";const f=a.indexOf("#");return f!==-1&&(l=a.slice(f)),l}function m(a){a=E(a);const l=a.indexOf("?");return l===-1?"":a.slice(l+1)}function k(a,l){return l.parseNumbers&&!Number.isNaN(Number(a))&&typeof a=="string"&&a.trim()!==""?a=Number(a):l.parseBooleans&&a!==null&&(a.toLowerCase()==="true"||a.toLowerCase()==="false")&&(a=a.toLowerCase()==="true"),a}function R(a,l){l=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},l),d(l.arrayFormatSeparator);const f=u(l),_=Object.create(null);if(typeof a!="string"||(a=a.trim().replace(/^[?#&]/,""),!a))return _;for(const h of a.split("&")){if(h==="")continue;let[C,w]=r(l.decode?h.replace(/\+/g," "):h,"=");w=w===void 0?null:["comma","separator"].includes(l.arrayFormat)?w:g(w,l),f(g(C,l),w,_)}for(const h of Object.keys(_)){const C=_[h];if(typeof C=="object"&&C!==null)for(const w of Object.keys(C))C[w]=k(C[w],l);else _[h]=k(C,l)}return l.sort===!1?_:(l.sort===!0?Object.keys(_).sort():Object.keys(_).sort(l.sort)).reduce((h,C)=>{const w=_[C];return w&&typeof w=="object"&&!Array.isArray(w)?h[C]=s(w):h[C]=w,h},Object.create(null))}t.extract=m,t.parse=R,t.stringify=(a,l)=>{if(!a)return"";l=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},l),d(l.arrayFormatSeparator);const f=w=>l.skipNull&&i(a[w])||l.skipEmptyString&&a[w]==="",_=c(l),h={};for(const w of Object.keys(a))f(w)||(h[w]=a[w]);const C=Object.keys(h);return l.sort!==!1&&C.sort(l.sort),C.map(w=>{const x=a[w];return x===void 0?"":x===null?y(w,l):Array.isArray(x)?x.reduce(_(w),[]).join("&"):y(w,l)+"="+y(x,l)}).filter(w=>w.length>0).join("&")},t.parseUrl=(a,l)=>{l=Object.assign({decode:!0},l);const[f,_]=r(a,"#");return Object.assign({url:f.split("?")[0]||"",query:R(m(a),l)},l&&l.parseFragmentIdentifier&&_?{fragmentIdentifier:g(_,l)}:{})},t.stringifyUrl=(a,l)=>{l=Object.assign({encode:!0,strict:!0},l);const f=E(a.url).split("?")[0]||"",_=t.extract(a.url),h=t.parse(_,{sort:!1}),C=Object.assign(h,a.query);let w=t.stringify(C,l);w&&(w=`?${w}`);let x=b(a.url);return a.fragmentIdentifier&&(x=`#${y(a.fragmentIdentifier,l)}`),`${f}${w}${x}`},t.pick=(a,l,f)=>{f=Object.assign({parseFragmentIdentifier:!0},f);const{url:_,query:h,fragmentIdentifier:C}=t.parseUrl(a,f);return t.stringifyUrl({url:_,query:o(h,l),fragmentIdentifier:C},f)},t.exclude=(a,l,f)=>{const _=Array.isArray(l)?h=>!l.includes(h):(h,C)=>!l(h,C);return t.pick(a,_,f)}})(it);function Pn(t){const e=t.indexOf("?")!==-1?t.indexOf("?"):void 0;return typeof e<"u"?t.substr(e):""}function Dn(t,e){let n=st(t);return n=Object.assign(Object.assign({},n),e),t=jn(n),t}function st(t){return it.parse(t)}function jn(t){return it.stringify(t)}function Hn(t){return typeof t.bridge<"u"}function Bn(t){const e=t.indexOf(":"),n=t.indexOf("?")!==-1?t.indexOf("?"):void 0,r=t.substring(0,e),o=t.substring(e+1,n);function i(s){const E="@",b=s.split(E);return{handshakeTopic:b[0],version:parseInt(b[1],10)}}const c=i(o),u=typeof n<"u"?t.substr(n):"";function d(s){const E=st(s);return{key:E.key||"",bridge:E.bridge||""}}const y=d(u);return Object.assign(Object.assign({protocol:r},c),y)}function Vi(t){return t===""||typeof t=="string"&&t.trim()===""}function Ji(t){return!(t&&t.length)}function Gi(t){return ye(t)}function Yi(t){return et(t)}function Ki(t){return mn(t)}function Zi(t){return Ko(t)}function Xi(t){return Zo(t)}function es(t,e){return pn(t,e)}function ts(t){return typeof t.params=="object"}function Wn(t){return typeof t.method<"u"}function W(t){return typeof t.result<"u"}function te(t){return typeof t.error<"u"}function qe(t){return typeof t.event<"u"}function Fn(t){return xo.includes(t)||t.startsWith("wc_")}function zn(t){return t.method.startsWith("wc_")?!0:!Fe.includes(t.method)}const ns=Object.freeze(Object.defineProperty({__proto__:null,addHexPrefix:Ui,appendToQueryString:Dn,concatArrayBuffers:_i,concatBuffers:pi,convertArrayBufferToBuffer:fe,convertArrayBufferToHex:vn,convertArrayBufferToNumber:ui,convertArrayBufferToUtf8:li,convertBufferToArrayBuffer:yn,convertBufferToHex:fi,convertBufferToNumber:hi,convertBufferToUtf8:di,convertHexToArrayBuffer:wn,convertHexToBuffer:wi,convertHexToNumber:Ei,convertHexToUtf8:bi,convertNumberToArrayBuffer:Ci,convertNumberToBuffer:ki,convertNumberToHex:bn,convertNumberToUtf8:Si,convertUtf8ToArrayBuffer:mi,convertUtf8ToBuffer:gi,convertUtf8ToHex:vi,convertUtf8ToNumber:yi,detectEnv:be,detectOS:Ee,formatIOSMobile:ji,formatMobileRegistry:Qi,formatMobileRegistryEntry:$n,formatQueryString:jn,formatRpcError:qn,getClientMeta:Ae,getCrypto:Li,getCryptoOrThrow:Mi,getDappRegistryUrl:zi,getDocument:Ti,getDocumentOrThrow:Ri,getEncoding:Xi,getFromWindow:xi,getFromWindowOrThrow:Ii,getInfuraRpcUrl:Mn,getLocal:rt,getLocalStorage:we,getLocalStorageOrThrow:Ai,getLocation:kn,getLocationOrThrow:Ni,getMobileLinkRegistry:Bi,getMobileRegistryEntry:An,getNavigator:En,getNavigatorOrThrow:Oi,getQueryString:Pn,getRpcUrl:Ln,getType:Zi,getWalletRegistryUrl:Fi,isAndroid:Cn,isArrayBuffer:Ki,isBrowser:Rn,isBuffer:Gi,isEmptyArray:Ji,isEmptyString:Vi,isHexString:es,isIOS:Sn,isInternalEvent:qe,isJsonRpcRequest:Wn,isJsonRpcResponseError:te,isJsonRpcResponseSuccess:W,isJsonRpcSubscription:ts,isMobile:xn,isNode:In,isReservedEvent:Fn,isSilentPayload:zn,isTypedArray:Yi,isWalletConnectSession:Hn,logDeprecationWarning:Di,parseQueryString:st,parseWalletConnectUri:Bn,payloadId:Nn,promisify:Wi,removeHexLeadingZeros:Pi,removeHexPrefix:$i,removeLocal:ot,safeJsonParse:Tn,safeJsonStringify:On,sanitizeHex:qi,saveMobileLinkInfo:Hi,setLocal:nt,uuid:ue},Symbol.toStringTag,{value:"Module"}));var xe,xt;function rs(){return xt||(xt=1,xe=function(){throw new Error("ws does not work in the browser. Browser clients must use the native WebSocket object")}),xe}class os{constructor(){this._eventEmitters=[],typeof window<"u"&&typeof window.addEventListener<"u"&&(window.addEventListener("online",()=>this.trigger("online")),window.addEventListener("offline",()=>this.trigger("offline")))}on(e,n){this._eventEmitters.push({event:e,callback:n})}trigger(e){let n=[];e&&(n=this._eventEmitters.filter(r=>r.event===e)),n.forEach(r=>{r.callback()})}}const is=typeof globalThis.WebSocket<"u"?globalThis.WebSocket:rs();class ss{constructor(e){if(this.opts=e,this._queue=[],this._events=[],this._subscriptions=[],this._protocol=e.protocol,this._version=e.version,this._url="",this._netMonitor=null,this._socket=null,this._nextSocket=null,this._subscriptions=e.subscriptions||[],this._netMonitor=e.netMonitor||new os,!e.url||typeof e.url!="string")throw new Error("Missing or invalid WebSocket url");this._url=e.url,this._netMonitor.on("online",()=>this._socketCreate())}set readyState(e){}get readyState(){return this._socket?this._socket.readyState:-1}set connecting(e){}get connecting(){return this.readyState===0}set connected(e){}get connected(){return this.readyState===1}set closing(e){}get closing(){return this.readyState===2}set closed(e){}get closed(){return this.readyState===3}open(){this._socketCreate()}close(){this._socketClose()}send(e,n,r){if(!n||typeof n!="string")throw new Error("Missing or invalid topic field");this._socketSend({topic:n,type:"pub",payload:e,silent:!!r})}subscribe(e){this._socketSend({topic:e,type:"sub",payload:"",silent:!0})}on(e,n){this._events.push({event:e,callback:n})}_socketCreate(){if(this._nextSocket)return;const e=as(this._url,this._protocol,this._version);if(this._nextSocket=new is(e),!this._nextSocket)throw new Error("Failed to create socket");this._nextSocket.onmessage=n=>this._socketReceive(n),this._nextSocket.onopen=()=>this._socketOpen(),this._nextSocket.onerror=n=>this._socketError(n),this._nextSocket.onclose=()=>{setTimeout(()=>{this._nextSocket=null,this._socketCreate()},1e3)}}_socketOpen(){this._socketClose(),this._socket=this._nextSocket,this._nextSocket=null,this._queueSubscriptions(),this._pushQueue()}_socketClose(){this._socket&&(this._socket.onclose=()=>{},this._socket.close())}_socketSend(e){const n=JSON.stringify(e);this._socket&&this._socket.readyState===1?this._socket.send(n):(this._setToQueue(e),this._socketCreate())}async _socketReceive(e){let n;try{n=JSON.parse(e.data)}catch{return}if(this._socketSend({topic:n.topic,type:"ack",payload:"",silent:!0}),this._socket&&this._socket.readyState===1){const r=this._events.filter(o=>o.event==="message");r&&r.length&&r.forEach(o=>o.callback(n))}}_socketError(e){const n=this._events.filter(r=>r.event==="error");n&&n.length&&n.forEach(r=>r.callback(e))}_queueSubscriptions(){this._subscriptions.forEach(n=>this._queue.push({topic:n,type:"sub",payload:"",silent:!0})),this._subscriptions=this.opts.subscriptions||[]}_setToQueue(e){this._queue.push(e)}_pushQueue(){this._queue.forEach(n=>this._socketSend(n)),this._queue=[]}}function as(t,e,n){var r,o;const c=(t.startsWith("https")?t.replace("https","wss"):t.startsWith("http")?t.replace("http","ws"):t).split("?"),u=Rn()?{protocol:e,version:n,env:"browser",host:((r=kn())===null||r===void 0?void 0:r.host)||""}:{protocol:e,version:n,env:((o=be())===null||o===void 0?void 0:o.name)||""},d=Dn(Pn(c[1]||""),u);return c[0]+"?"+d}class cs{constructor(){this._eventEmitters=[]}subscribe(e){this._eventEmitters.push(e)}unsubscribe(e){this._eventEmitters=this._eventEmitters.filter(n=>n.event!==e)}trigger(e){let n=[],r;Wn(e)?r=e.method:W(e)||te(e)?r=`response:${e.id}`:qe(e)?r=e.event:r="",r&&(n=this._eventEmitters.filter(o=>o.event===r)),(!n||!n.length)&&!Fn(r)&&!qe(r)&&(n=this._eventEmitters.filter(o=>o.event==="call_request")),n.forEach(o=>{if(te(e)){const i=new Error(e.error.message);o.callback(i,null)}else o.callback(null,e)})}}class ls{constructor(e="walletconnect"){this.storageId=e}getSession(){let e=null;const n=rt(this.storageId);return n&&Hn(n)&&(e=n),e}setSession(e){return nt(this.storageId,e),e}removeSession(){ot(this.storageId)}}const us="walletconnect.org",_s="abcdefghijklmnopqrstuvwxyz0123456789",Qn=_s.split("").map(t=>`https://${t}.bridge.walletconnect.org`);function ds(t){let e=t.indexOf("//")>-1?t.split("/")[2]:t.split("/")[0];return e=e.split(":")[0],e=e.split("?")[0],e}function fs(t){return ds(t).split(".").slice(-2).join(".")}function hs(){return Math.floor(Math.random()*Qn.length)}function ps(){return Qn[hs()]}function ms(t){return fs(t)===us}function gs(t){return ms(t)?ps():t}class vs{constructor(e){if(this.protocol="wc",this.version=1,this._bridge="",this._key=null,this._clientId="",this._clientMeta=null,this._peerId="",this._peerMeta=null,this._handshakeId=0,this._handshakeTopic="",this._connected=!1,this._accounts=[],this._chainId=0,this._networkId=0,this._rpcUrl="",this._eventManager=new cs,this._clientMeta=Ae()||e.connectorOpts.clientMeta||null,this._cryptoLib=e.cryptoLib,this._sessionStorage=e.sessionStorage||new ls(e.connectorOpts.storageId),this._qrcodeModal=e.connectorOpts.qrcodeModal,this._qrcodeModalOptions=e.connectorOpts.qrcodeModalOptions,this._signingMethods=[...Fe,...e.connectorOpts.signingMethods||[]],!e.connectorOpts.bridge&&!e.connectorOpts.uri&&!e.connectorOpts.session)throw new Error(ko);e.connectorOpts.bridge&&(this.bridge=gs(e.connectorOpts.bridge)),e.connectorOpts.uri&&(this.uri=e.connectorOpts.uri);const n=e.connectorOpts.session||this._getStorageSession();n&&(this.session=n),this.handshakeId&&this._subscribeToSessionResponse(this.handshakeId,"Session request rejected"),this._transport=e.transport||new ss({protocol:this.protocol,version:this.version,url:this.bridge,subscriptions:[this.clientId]}),this._subscribeToInternalEvents(),this._initTransport(),e.connectorOpts.uri&&this._subscribeToSessionRequest(),e.pushServerOpts&&this._registerPushServer(e.pushServerOpts)}set bridge(e){e&&(this._bridge=e)}get bridge(){return this._bridge}set key(e){if(!e)return;const n=wn(e);this._key=n}get key(){return this._key?vn(this._key,!0):""}set clientId(e){e&&(this._clientId=e)}get clientId(){let e=this._clientId;return e||(e=this._clientId=ue()),this._clientId}set peerId(e){e&&(this._peerId=e)}get peerId(){return this._peerId}set clientMeta(e){}get clientMeta(){let e=this._clientMeta;return e||(e=this._clientMeta=Ae()),e}set peerMeta(e){this._peerMeta=e}get peerMeta(){return this._peerMeta}set handshakeTopic(e){e&&(this._handshakeTopic=e)}get handshakeTopic(){return this._handshakeTopic}set handshakeId(e){e&&(this._handshakeId=e)}get handshakeId(){return this._handshakeId}get uri(){return this._formatUri()}set uri(e){if(!e)return;const{handshakeTopic:n,bridge:r,key:o}=this._parseUri(e);this.handshakeTopic=n,this.bridge=r,this.key=o}set chainId(e){this._chainId=e}get chainId(){return this._chainId}set networkId(e){this._networkId=e}get networkId(){return this._networkId}set accounts(e){this._accounts=e}get accounts(){return this._accounts}set rpcUrl(e){this._rpcUrl=e}get rpcUrl(){return this._rpcUrl}set connected(e){}get connected(){return this._connected}set pending(e){}get pending(){return!!this._handshakeTopic}get session(){return{connected:this.connected,accounts:this.accounts,chainId:this.chainId,bridge:this.bridge,key:this.key,clientId:this.clientId,clientMeta:this.clientMeta,peerId:this.peerId,peerMeta:this.peerMeta,handshakeId:this.handshakeId,handshakeTopic:this.handshakeTopic}}set session(e){e&&(this._connected=e.connected,this.accounts=e.accounts,this.chainId=e.chainId,this.bridge=e.bridge,this.key=e.key,this.clientId=e.clientId,this.clientMeta=e.clientMeta,this.peerId=e.peerId,this.peerMeta=e.peerMeta,this.handshakeId=e.handshakeId,this.handshakeTopic=e.handshakeTopic)}on(e,n){const r={event:e,callback:n};this._eventManager.subscribe(r)}off(e){this._eventManager.unsubscribe(e)}async createInstantRequest(e){this._key=await this._generateKey();const n=this._formatRequest({method:"wc_instantRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,request:this._formatRequest(e)}]});this.handshakeId=n.id,this.handshakeTopic=ue(),this._eventManager.trigger({event:"display_uri",params:[this.uri]}),this.on("modal_closed",()=>{throw new Error(St)});const r=()=>{this.killSession()};try{const o=await this._sendCallRequest(n);return o&&r(),o}catch(o){throw r(),o}}async connect(e){if(!this._qrcodeModal)throw new Error(So);return this.connected?{chainId:this.chainId,accounts:this.accounts}:(await this.createSession(e),new Promise(async(n,r)=>{this.on("modal_closed",()=>r(new Error(St))),this.on("connect",(o,i)=>{if(o)return r(o);n(i.params[0])})}))}async createSession(e){if(this._connected)throw new Error(Se);if(this.pending)return;this._key=await this._generateKey();const n=this._formatRequest({method:"wc_sessionRequest",params:[{peerId:this.clientId,peerMeta:this.clientMeta,chainId:e&&e.chainId?e.chainId:null}]});this.handshakeId=n.id,this.handshakeTopic=ue(),this._sendSessionRequest(n,"Session update rejected",{topic:this.handshakeTopic}),this._eventManager.trigger({event:"display_uri",params:[this.uri]})}approveSession(e){if(this._connected)throw new Error(Se);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl,peerId:this.clientId,peerMeta:this.clientMeta},r={id:this.handshakeId,jsonrpc:"2.0",result:n};this._sendResponse(r),this._connected=!0,this._setStorageSession(),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})}rejectSession(e){if(this._connected)throw new Error(Se);const n=e&&e.message?e.message:go,r=this._formatResponse({id:this.handshakeId,error:{message:n}});this._sendResponse(r),this._connected=!1,this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession()}updateSession(e){if(!this._connected)throw new Error(j);this.chainId=e.chainId,this.accounts=e.accounts,this.networkId=e.networkId||0,this.rpcUrl=e.rpcUrl||"";const n={approved:!0,chainId:this.chainId,networkId:this.networkId,accounts:this.accounts,rpcUrl:this.rpcUrl},r=this._formatRequest({method:"wc_sessionUpdate",params:[n]});this._sendSessionRequest(r,"Session update rejected"),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]}),this._manageStorageSession()}async killSession(e){const n=e?e.message:"Session Disconnected",r={approved:!1,chainId:null,networkId:null,accounts:null},o=this._formatRequest({method:"wc_sessionUpdate",params:[r]});await this._sendRequest(o),this._handleSessionDisconnect(n)}async sendTransaction(e){if(!this._connected)throw new Error(j);const n=e,r=this._formatRequest({method:"eth_sendTransaction",params:[n]});return await this._sendCallRequest(r)}async signTransaction(e){if(!this._connected)throw new Error(j);const n=e,r=this._formatRequest({method:"eth_signTransaction",params:[n]});return await this._sendCallRequest(r)}async signMessage(e){if(!this._connected)throw new Error(j);const n=this._formatRequest({method:"eth_sign",params:e});return await this._sendCallRequest(n)}async signPersonalMessage(e){if(!this._connected)throw new Error(j);const n=this._formatRequest({method:"personal_sign",params:e});return await this._sendCallRequest(n)}async signTypedData(e){if(!this._connected)throw new Error(j);const n=this._formatRequest({method:"eth_signTypedData",params:e});return await this._sendCallRequest(n)}async updateChain(e){if(!this._connected)throw new Error("Session currently disconnected");const n=this._formatRequest({method:"wallet_updateChain",params:[e]});return await this._sendCallRequest(n)}unsafeSend(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),new Promise((r,o)=>{this._subscribeToResponse(e.id,(i,c)=>{if(i){o(i);return}if(!c)throw new Error(vo);r(c)})})}async sendCustomRequest(e,n){if(!this._connected)throw new Error(j);switch(e.method){case"eth_accounts":return this.accounts;case"eth_chainId":return bn(this.chainId);case"eth_sendTransaction":case"eth_signTransaction":e.params;break;case"personal_sign":e.params;break}const r=this._formatRequest(e);return await this._sendCallRequest(r,n)}approveRequest(e){if(W(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(yo)}rejectRequest(e){if(te(e)){const n=this._formatResponse(e);this._sendResponse(n)}else throw new Error(wo)}transportClose(){this._transport.close()}async _sendRequest(e,n){const r=this._formatRequest(e),o=await this._encrypt(r),i=typeof n?.topic<"u"?n.topic:this.peerId,c=JSON.stringify(o),u=typeof n?.forcePushNotification<"u"?!n.forcePushNotification:zn(r);this._transport.send(c,i,u)}async _sendResponse(e){const n=await this._encrypt(e),r=this.peerId,o=JSON.stringify(n),i=!0;this._transport.send(o,r,i)}async _sendSessionRequest(e,n,r){this._sendRequest(e,r),this._subscribeToSessionResponse(e.id,n)}_sendCallRequest(e,n){return this._sendRequest(e,n),this._eventManager.trigger({event:"call_request_sent",params:[{request:e,options:n}]}),this._subscribeToCallResponse(e.id)}_formatRequest(e){if(typeof e.method>"u")throw new Error(bo);return{id:typeof e.id>"u"?Nn():e.id,jsonrpc:"2.0",method:e.method,params:typeof e.params>"u"?[]:e.params}}_formatResponse(e){if(typeof e.id>"u")throw new Error(Eo);const n={id:e.id,jsonrpc:"2.0"};if(te(e)){const r=qn(e.error);return Object.assign(Object.assign(Object.assign({},n),e),{error:r})}else if(W(e))return Object.assign(Object.assign({},n),e);throw new Error(Ct)}_handleSessionDisconnect(e){const n=e||"Session Disconnected";this._connected||(this._qrcodeModal&&this._qrcodeModal.close(),ot(Le)),this._connected&&(this._connected=!1),this._handshakeId&&(this._handshakeId=0),this._handshakeTopic&&(this._handshakeTopic=""),this._peerId&&(this._peerId=""),this._eventManager.trigger({event:"disconnect",params:[{message:n}]}),this._removeStorageSession(),this.transportClose()}_handleSessionResponse(e,n){n?n.approved?(this._connected?(n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),this._eventManager.trigger({event:"session_update",params:[{chainId:this.chainId,accounts:this.accounts}]})):(this._connected=!0,n.chainId&&(this.chainId=n.chainId),n.accounts&&(this.accounts=n.accounts),n.peerId&&!this.peerId&&(this.peerId=n.peerId),n.peerMeta&&!this.peerMeta&&(this.peerMeta=n.peerMeta),this._eventManager.trigger({event:"connect",params:[{peerId:this.peerId,peerMeta:this.peerMeta,chainId:this.chainId,accounts:this.accounts}]})),this._manageStorageSession()):this._handleSessionDisconnect(e):this._handleSessionDisconnect(e)}async _handleIncomingMessages(e){if(![this.clientId,this.handshakeTopic].includes(e.topic))return;let r;try{r=JSON.parse(e.payload)}catch{return}const o=await this._decrypt(r);o&&this._eventManager.trigger(o)}_subscribeToSessionRequest(){this._transport.subscribe(this.handshakeTopic)}_subscribeToResponse(e,n){this.on(`response:${e}`,n)}_subscribeToSessionResponse(e,n){this._subscribeToResponse(e,(r,o)=>{if(r){this._handleSessionResponse(r.message);return}W(o)?this._handleSessionResponse(n,o.result):o.error&&o.error.message?this._handleSessionResponse(o.error.message):this._handleSessionResponse(n)})}_subscribeToCallResponse(e){return new Promise((n,r)=>{this._subscribeToResponse(e,(o,i)=>{if(o){r(o);return}W(i)?n(i.result):i.error&&i.error.message?r(i.error):r(new Error(Ct))})})}_subscribeToInternalEvents(){this.on("display_uri",()=>{this._qrcodeModal&&this._qrcodeModal.open(this.uri,()=>{this._eventManager.trigger({event:"modal_closed",params:[]})},this._qrcodeModalOptions)}),this.on("connect",()=>{this._qrcodeModal&&this._qrcodeModal.close()}),this.on("call_request_sent",(e,n)=>{const{request:r}=n.params[0];if(xn()&&this._signingMethods.includes(r.method)){const o=rt(Le);o&&(window.location.href=o.href)}}),this.on("wc_sessionRequest",(e,n)=>{e&&this._eventManager.trigger({event:"error",params:[{code:"SESSION_REQUEST_ERROR",message:e.toString()}]}),this.handshakeId=n.id,this.peerId=n.params[0].peerId,this.peerMeta=n.params[0].peerMeta;const r=Object.assign(Object.assign({},n),{method:"session_request"});this._eventManager.trigger(r)}),this.on("wc_sessionUpdate",(e,n)=>{e&&this._handleSessionResponse(e.message),this._handleSessionResponse("Session disconnected",n.params[0])})}_initTransport(){this._transport.on("message",e=>this._handleIncomingMessages(e)),this._transport.on("open",()=>this._eventManager.trigger({event:"transport_open",params:[]})),this._transport.on("close",()=>this._eventManager.trigger({event:"transport_close",params:[]})),this._transport.on("error",()=>this._eventManager.trigger({event:"transport_error",params:["Websocket connection failed"]})),this._transport.open()}_formatUri(){const e=this.protocol,n=this.handshakeTopic,r=this.version,o=encodeURIComponent(this.bridge),i=this.key;return`${e}:${n}@${r}?bridge=${o}&key=${i}`}_parseUri(e){const n=Bn(e);if(n.protocol===this.protocol){if(!n.handshakeTopic)throw Error("Invalid or missing handshakeTopic parameter value");const r=n.handshakeTopic;if(!n.bridge)throw Error("Invalid or missing bridge url parameter value");const o=decodeURIComponent(n.bridge);if(!n.key)throw Error("Invalid or missing key parameter value");const i=n.key;return{handshakeTopic:r,bridge:o,key:i}}else throw new Error(Co)}async _generateKey(){return this._cryptoLib?await this._cryptoLib.generateKey():null}async _encrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.encrypt(e,n):null}async _decrypt(e){const n=this._key;return this._cryptoLib&&n?await this._cryptoLib.decrypt(e,n):null}_getStorageSession(){let e=null;return this._sessionStorage&&(e=this._sessionStorage.getSession()),e}_setStorageSession(){this._sessionStorage&&this._sessionStorage.setSession(this.session)}_removeStorageSession(){this._sessionStorage&&this._sessionStorage.removeSession()}_manageStorageSession(){this._connected?this._setStorageSession():this._removeStorageSession()}_registerPushServer(e){if(!e.url||typeof e.url!="string")throw Error("Invalid or missing pushServerOpts.url parameter value");if(!e.type||typeof e.type!="string")throw Error("Invalid or missing pushServerOpts.type parameter value");if(!e.token||typeof e.token!="string")throw Error("Invalid or missing pushServerOpts.token parameter value");const n={bridge:this.bridge,topic:this.clientId,type:e.type,token:e.token,peerName:"",language:e.language||""};this.on("connect",async(r,o)=>{if(r)throw r;if(e.peerMeta){const i=o.params[0].peerMeta.name;n.peerName=i}try{if(!(await(await fetch(`${e.url}/new`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(n)})).json()).success)throw Error("Failed to register in Push Server")}catch{throw Error("Failed to register in Push Server")}})}}function ys(t){return ne.getBrowerCrypto().getRandomValues(new Uint8Array(t))}const Vn=256,Jn=Vn,ws=Vn,D="AES-CBC",bs=`SHA-${Jn}`,Ue="HMAC",Es="encrypt",ks="decrypt",Cs="sign",Ss="verify";function xs(t){return t===D?{length:Jn,name:D}:{hash:{name:bs},name:Ue}}function Is(t){return t===D?[Es,ks]:[Cs,Ss]}async function at(t,e=D){return ne.getSubtleCrypto().importKey("raw",t,xs(e),!0,Is(e))}async function Rs(t,e,n){const r=ne.getSubtleCrypto(),o=await at(e,D),i=await r.encrypt({iv:t,name:D},o,n);return new Uint8Array(i)}async function Ts(t,e,n){const r=ne.getSubtleCrypto(),o=await at(e,D),i=await r.decrypt({iv:t,name:D},o,n);return new Uint8Array(i)}async function Os(t,e){const n=ne.getSubtleCrypto(),r=await at(t,Ue),o=await n.sign({length:ws,name:Ue},r,e);return new Uint8Array(o)}function Ns(t,e,n){return Rs(t,e,n)}function Ms(t,e,n){return Ts(t,e,n)}async function Gn(t,e){return await Os(t,e)}async function Yn(t){const e=(t||256)/8,n=ys(e);return yn(G(n))}async function Kn(t,e){const n=P(t.data),r=P(t.iv),o=P(t.hmac),i=$(o,!1),c=gn(n,r),u=await Gn(e,c),d=$(u,!1);return J(i)===J(d)}async function Ls(t,e,n){const r=V(fe(e)),o=n||await Yn(128),i=V(fe(o)),c=$(i,!1),u=JSON.stringify(t),d=hn(u),y=await Ns(i,r,d),g=$(y,!1),s=gn(y,i),E=await Gn(r,s),b=$(E,!1);return{data:g,hmac:b,iv:c}}async function As(t,e){const n=V(fe(e));if(!n)throw new Error("Missing key: required for decryption");if(!await Kn(t,n))return null;const o=P(t.data),i=P(t.iv),c=await Ms(i,n,o),u=dn(c);let d;try{d=JSON.parse(u)}catch{return null}return d}const qs=Object.freeze(Object.defineProperty({__proto__:null,decrypt:As,encrypt:Ls,generateKey:Yn,verifyHmac:Kn},Symbol.toStringTag,{value:"Module"}));class Us extends vs{constructor(e,n){super({cryptoLib:qs,connectorOpts:e,pushServerOpts:n})}}const $s=Dt(ns);var Ps=function(){var t=document.getSelection();if(!t.rangeCount)return function(){};for(var e=document.activeElement,n=[],r=0;r<t.rangeCount;r++)n.push(t.getRangeAt(r));switch(e.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":e.blur();break;default:e=null;break}return t.removeAllRanges(),function(){t.type==="Caret"&&t.removeAllRanges(),t.rangeCount||n.forEach(function(o){t.addRange(o)}),e&&e.focus()}},Ds=Ps,It={"text/plain":"Text","text/html":"Url",default:"Text"},js="Copy to clipboard: #{key}, Enter";function Hs(t){var e=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return t.replace(/#{\s*key\s*}/g,e)}function Bs(t,e){var n,r,o,i,c,u,d=!1;e||(e={}),n=e.debug||!1;try{o=Ds(),i=document.createRange(),c=document.getSelection(),u=document.createElement("span"),u.textContent=t,u.ariaHidden="true",u.style.all="unset",u.style.position="fixed",u.style.top=0,u.style.clip="rect(0, 0, 0, 0)",u.style.whiteSpace="pre",u.style.webkitUserSelect="text",u.style.MozUserSelect="text",u.style.msUserSelect="text",u.style.userSelect="text",u.addEventListener("copy",function(g){if(g.stopPropagation(),e.format)if(g.preventDefault(),typeof g.clipboardData>"u"){n&&console.warn("unable to use e.clipboardData"),n&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var s=It[e.format]||It.default;window.clipboardData.setData(s,t)}else g.clipboardData.clearData(),g.clipboardData.setData(e.format,t);e.onCopy&&(g.preventDefault(),e.onCopy(g.clipboardData))}),document.body.appendChild(u),i.selectNodeContents(u),c.addRange(i);var y=document.execCommand("copy");if(!y)throw new Error("copy command was unsuccessful");d=!0}catch(g){n&&console.error("unable to copy using execCommand: ",g),n&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(e.format||"text",t),e.onCopy&&e.onCopy(window.clipboardData),d=!0}catch(s){n&&console.error("unable to copy using clipboardData: ",s),n&&console.error("falling back to prompt"),r=Hs("message"in e?e.message:js),window.prompt(r,t)}}finally{c&&(typeof c.removeRange=="function"?c.removeRange(i):c.removeAllRanges()),u&&document.body.removeChild(u),o()}return d}var Ws=Bs;function Zn(t,e){for(var n in e)t[n]=e[n];return t}function $e(t,e){for(var n in t)if(n!=="__source"&&!(n in e))return!0;for(var r in e)if(r!=="__source"&&t[r]!==e[r])return!0;return!1}function Ie(t,e){return t===e&&(t!==0||1/t==1/e)||t!=t&&e!=e}function he(t){this.props=t}function Xn(t,e){function n(o){var i=this.props.ref,c=i==o.ref;return!c&&i&&(i.call?i(null):i.current=null),e?!e(this.props,o)||!c:$e(this.props,o)}function r(o){return this.shouldComponentUpdate=n,M(t,o)}return r.displayName="Memo("+(t.displayName||t.name)+")",r.prototype.isReactComponent=!0,r.__f=!0,r}(he.prototype=new N).isPureReactComponent=!0,he.prototype.shouldComponentUpdate=function(t,e){return $e(this.props,t)||$e(this.state,e)};var Rt=v.__b;v.__b=function(t){t.type&&t.type.__f&&t.ref&&(t.props.ref=t.ref,t.ref=null),Rt&&Rt(t)};var Fs=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function er(t){function e(n){var r=Zn({},n);return delete r.ref,t(r,n.ref||null)}return e.$$typeof=Fs,e.render=e,e.prototype.isReactComponent=e.__f=!0,e.displayName="ForwardRef("+(t.displayName||t.name)+")",e}var Tt=function(t,e){return t==null?null:q(q(t).map(e))},tr={map:Tt,forEach:Tt,count:function(t){return t?q(t).length:0},only:function(t){var e=q(t);if(e.length!==1)throw"Children.only";return e[0]},toArray:q},zs=v.__e;v.__e=function(t,e,n,r){if(t.then){for(var o,i=e;i=i.__;)if((o=i.__c)&&o.__c)return e.__e==null&&(e.__e=n.__e,e.__k=n.__k),o.__c(t,e)}zs(t,e,n,r)};var Ot=v.unmount;function nr(t,e,n){return t&&(t.__c&&t.__c.__H&&(t.__c.__H.__.forEach(function(r){typeof r.__c=="function"&&r.__c()}),t.__c.__H=null),(t=Zn({},t)).__c!=null&&(t.__c.__P===n&&(t.__c.__P=e),t.__c=null),t.__k=t.__k&&t.__k.map(function(r){return nr(r,e,n)})),t}function rr(t,e,n){return t&&n&&(t.__v=null,t.__k=t.__k&&t.__k.map(function(r){return rr(r,e,n)}),t.__c&&t.__c.__P===e&&(t.__e&&n.insertBefore(t.__e,t.__d),t.__c.__e=!0,t.__c.__P=n)),t}function Z(){this.__u=0,this.t=null,this.__b=null}function or(t){var e=t.__.__c;return e&&e.__a&&e.__a(t)}function ir(t){var e,n,r;function o(i){if(e||(e=t()).then(function(c){n=c.default||c},function(c){r=c}),r)throw r;if(!n)throw e;return M(n,i)}return o.displayName="Lazy",o.__f=!0,o}function F(){this.u=null,this.o=null}v.unmount=function(t){var e=t.__c;e&&e.__R&&e.__R(),e&&t.__h===!0&&(t.type=null),Ot&&Ot(t)},(Z.prototype=new N).__c=function(t,e){var n=e.__c,r=this;r.t==null&&(r.t=[]),r.t.push(n);var o=or(r.__v),i=!1,c=function(){i||(i=!0,n.__R=null,o?o(u):u())};n.__R=c;var u=function(){if(!--r.__u){if(r.state.__a){var y=r.state.__a;r.__v.__k[0]=rr(y,y.__c.__P,y.__c.__O)}var g;for(r.setState({__a:r.__b=null});g=r.t.pop();)g.forceUpdate()}},d=e.__h===!0;r.__u++||d||r.setState({__a:r.__b=r.__v.__k[0]}),t.then(c,c)},Z.prototype.componentWillUnmount=function(){this.t=[]},Z.prototype.render=function(t,e){if(this.__b){if(this.__v.__k){var n=document.createElement("div"),r=this.__v.__k[0].__c;this.__v.__k[0]=nr(this.__b,n,r.__O=r.__P)}this.__b=null}var o=e.__a&&M(L,null,t.fallback);return o&&(o.__h=null),[M(L,null,e.__a?null:t.children),o]};var Nt=function(t,e,n){if(++n[1]===n[0]&&t.o.delete(e),t.props.revealOrder&&(t.props.revealOrder[0]!=="t"||!t.o.size))for(n=t.u;n;){for(;n.length>3;)n.pop()();if(n[1]<n[0])break;t.u=n=n[2]}};function Qs(t){return this.getChildContext=function(){return t.context},t.children}function Vs(t){var e=this,n=t.i;e.componentWillUnmount=function(){ee(null,e.l),e.l=null,e.i=null},e.i&&e.i!==n&&e.componentWillUnmount(),e.l||(e.i=n,e.l={nodeType:1,parentNode:n,childNodes:[],appendChild:function(r){this.childNodes.push(r),e.i.appendChild(r)},insertBefore:function(r,o){this.childNodes.push(r),e.i.appendChild(r)},removeChild:function(r){this.childNodes.splice(this.childNodes.indexOf(r)>>>1,1),e.i.removeChild(r)}}),ee(M(Qs,{context:e.context},t.__v),e.l)}function sr(t,e){var n=M(Vs,{__v:t,i:e});return n.containerInfo=e,n}(F.prototype=new N).__a=function(t){var e=this,n=or(e.__v),r=e.o.get(t);return r[0]++,function(o){var i=function(){e.props.revealOrder?(r.push(o),Nt(e,t,r)):o()};n?n(i):i()}},F.prototype.render=function(t){this.u=null,this.o=new Map;var e=q(t.children);t.revealOrder&&t.revealOrder[0]==="b"&&e.reverse();for(var n=e.length;n--;)this.o.set(e[n],this.u=[1,0,this.u]);return t.children},F.prototype.componentDidUpdate=F.prototype.componentDidMount=function(){var t=this;this.o.forEach(function(e,n){Nt(t,n,e)})};var ar=typeof Symbol<"u"&&Symbol.for&&Symbol.for("react.element")||60103,Js=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,Gs=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Ys=/[A-Z0-9]/g,Ks=typeof document<"u",Zs=function(t){return(typeof Symbol<"u"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(t)};function cr(t,e,n){return e.__k==null&&(e.textContent=""),ee(t,e),typeof n=="function"&&n(),t?t.__c:null}function lr(t,e,n){return Kt(t,e),typeof n=="function"&&n(),t?t.__c:null}N.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(t){Object.defineProperty(N.prototype,t,{configurable:!0,get:function(){return this["UNSAFE_"+t]},set:function(e){Object.defineProperty(this,t,{configurable:!0,writable:!0,value:e})}})});var Mt=v.event;function Xs(){}function ea(){return this.cancelBubble}function ta(){return this.defaultPrevented}v.event=function(t){return Mt&&(t=Mt(t)),t.persist=Xs,t.isPropagationStopped=ea,t.isDefaultPrevented=ta,t.nativeEvent=t};var ct,na={enumerable:!1,configurable:!0,get:function(){return this.class}},Lt=v.vnode;v.vnode=function(t){typeof t.type=="string"&&function(e){var n=e.props,r=e.type,o={};for(var i in n){var c=n[i];if(!(i==="value"&&"defaultValue"in n&&c==null||Ks&&i==="children"&&r==="noscript"||i==="class"||i==="className")){var u=i.toLowerCase();i==="defaultValue"&&"value"in n&&n.value==null?i="value":i==="download"&&c===!0?c="":u==="ondoubleclick"?i="ondblclick":u!=="onchange"||r!=="input"&&r!=="textarea"||Zs(n.type)?u==="onfocus"?i="onfocusin":u==="onblur"?i="onfocusout":Gs.test(i)?i=u:r.indexOf("-")===-1&&Js.test(i)?i=i.replace(Ys,"-$&").toLowerCase():c===null&&(c=void 0):u=i="oninput",u==="oninput"&&o[i=u]&&(i="oninputCapture"),o[i]=c}}r=="select"&&o.multiple&&Array.isArray(o.value)&&(o.value=q(n.children).forEach(function(d){d.props.selected=o.value.indexOf(d.props.value)!=-1})),r=="select"&&o.defaultValue!=null&&(o.value=q(n.children).forEach(function(d){d.props.selected=o.multiple?o.defaultValue.indexOf(d.props.value)!=-1:o.defaultValue==d.props.value})),n.class&&!n.className?(o.class=n.class,Object.defineProperty(o,"className",na)):(n.className&&!n.class||n.class&&n.className)&&(o.class=o.className=n.className),e.props=o}(t),t.$$typeof=ar,Lt&&Lt(t)};var At=v.__r;v.__r=function(t){At&&At(t),ct=t.__c};var qt=v.diffed;v.diffed=function(t){qt&&qt(t);var e=t.props,n=t.__e;n!=null&&t.type==="textarea"&&"value"in e&&e.value!==n.value&&(n.value=e.value==null?"":e.value),ct=null};var ur={ReactCurrentDispatcher:{current:{readContext:function(t){return ct.__n[t.__c].props.value}}}},ra="17.0.2";function _r(t){return M.bind(null,t)}function se(t){return!!t&&t.$$typeof===ar}function dr(t){return se(t)&&t.type===L}function fr(t){return se(t)?fo.apply(null,arguments):t}function hr(t){return!!t.__k&&(ee(null,t),!0)}function pr(t){return t&&(t.base||t.nodeType===1&&t)||null}var mr=function(t,e){return t(e)},gr=function(t,e){return t(e)},vr=L;function lt(t){t()}function yr(t){return t}function wr(){return[!1,lt]}var br=oe,Er=se;function kr(t,e){var n=e(),r=me({h:{__:n,v:e}}),o=r[0].h,i=r[1];return oe(function(){o.__=n,o.v=e,Ie(o.__,e())||i({h:o})},[t,n,e]),Be(function(){return Ie(o.__,o.v())||i({h:o}),t(function(){Ie(o.__,o.v())||i({h:o})})},[t]),n}var oa={useState:me,useId:sn,useReducer:He,useEffect:Be,useLayoutEffect:oe,useInsertionEffect:br,useTransition:wr,useDeferredValue:yr,useSyncExternalStore:kr,startTransition:lt,useRef:en,useImperativeHandle:tn,useMemo:ge,useCallback:nn,useContext:rn,useDebugValue:on,version:"17.0.2",Children:tr,render:cr,hydrate:lr,unmountComponentAtNode:hr,createPortal:sr,createElement:M,createContext:Zt,createFactory:_r,cloneElement:fr,createRef:zt,Fragment:L,isValidElement:se,isElement:Er,isFragment:dr,findDOMNode:pr,Component:N,PureComponent:he,memo:Xn,forwardRef:er,flushSync:gr,unstable_batchedUpdates:mr,StrictMode:vr,Suspense:Z,SuspenseList:F,lazy:ir,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:ur};const ia=Object.freeze(Object.defineProperty({__proto__:null,Children:tr,Component:N,Fragment:L,PureComponent:he,StrictMode:vr,Suspense:Z,SuspenseList:F,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:ur,cloneElement:fr,createContext:Zt,createElement:M,createFactory:_r,createPortal:sr,createRef:zt,default:oa,findDOMNode:pr,flushSync:gr,forwardRef:er,hydrate:lr,isElement:Er,isFragment:dr,isValidElement:se,lazy:ir,memo:Xn,render:cr,startTransition:lt,unmountComponentAtNode:hr,unstable_batchedUpdates:mr,useCallback:nn,useContext:rn,useDebugValue:on,useDeferredValue:yr,useEffect:Be,useErrorBoundary:ho,useId:sn,useImperativeHandle:tn,useInsertionEffect:br,useLayoutEffect:oe,useMemo:ge,useReducer:He,useRef:en,useState:me,useSyncExternalStore:kr,useTransition:wr,version:ra},Symbol.toStringTag,{value:"Module"})),sa=Dt(ia);function Cr(t){return t&&typeof t=="object"&&"default"in t?t.default:t}var T=$s,Sr=Cr(so),aa=Cr(Ws),p=sa;function ca(t){Sr.toString(t,{type:"terminal"}).then(console.log)}var la=`:root {
  --animation-duration: 300ms;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animated {
  animation-duration: var(--animation-duration);
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

#walletconnect-wrapper {
  -webkit-user-select: none;
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 99999999999999;
}

.walletconnect-modal__headerLogo {
  height: 21px;
}

.walletconnect-modal__header p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  align-items: flex-start;
  display: flex;
  flex: 1;
  margin-left: 5px;
}

.walletconnect-modal__close__wrapper {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10000;
  background: white;
  border-radius: 26px;
  padding: 6px;
  box-sizing: border-box;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.walletconnect-modal__close__icon {
  position: relative;
  top: 7px;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
}

.walletconnect-modal__close__line1 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
}

.walletconnect-modal__close__line2 {
  position: absolute;
  width: 100%;
  border: 1px solid rgb(48, 52, 59);
  transform: rotate(90deg);
}

.walletconnect-qrcode__base {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  background: rgba(37, 41, 46, 0.95);
  height: 100%;
  left: 0;
  pointer-events: auto;
  position: fixed;
  top: 0;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  width: 100%;
  will-change: opacity;
  padding: 40px;
  box-sizing: border-box;
}

.walletconnect-qrcode__text {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 10px 0 20px 0;
  text-align: center;
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .walletconnect-qrcode__text {
    font-size: 4vw;
  }
}

@media only screen and (max-width: 320px) {
  .walletconnect-qrcode__text {
    font-size: 14px;
  }
}

.walletconnect-qrcode__image {
  width: calc(100% - 30px);
  box-sizing: border-box;
  cursor: none;
  margin: 0 auto;
}

.walletconnect-qrcode__notification {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.1s ease-in-out;
  background: white;
  color: black;
  margin-bottom: -60px;
  opacity: 0;
}

.walletconnect-qrcode__notification.notification__show {
  opacity: 1;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__header {
    height: 130px;
  }
  .walletconnect-modal__base {
    overflow: auto;
  }
}

@media only screen and (min-device-width: 415px) and (max-width: 768px) {
  #content {
    max-width: 768px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 375px) and (max-width: 415px) {
  #content {
    max-width: 414px;
    box-sizing: border-box;
  }
}

@media only screen and (min-width: 320px) and (max-width: 375px) {
  #content {
    max-width: 375px;
    box-sizing: border-box;
  }
}

@media only screen and (max-width: 320px) {
  #content {
    max-width: 320px;
    box-sizing: border-box;
  }
}

.walletconnect-modal__base {
  -webkit-font-smoothing: antialiased;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 50px 5px rgba(0, 0, 0, 0.4);
  font-family: ui-rounded, "SF Pro Rounded", "SF Pro Text", medium-content-sans-serif-font,
    -apple-system, BlinkMacSystemFont, ui-sans-serif, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Open Sans", "Helvetica Neue", sans-serif;
  margin-top: 41px;
  padding: 24px 24px 22px;
  pointer-events: auto;
  position: relative;
  text-align: center;
  transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform;
  overflow: visible;
  transform: translateY(-50%);
  top: 50%;
  max-width: 500px;
  margin: auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__base {
    padding: 24px 12px;
  }
}

.walletconnect-modal__base .hidden {
  transform: translateY(150%);
  transition: 0.125s cubic-bezier(0.4, 0, 1, 1);
}

.walletconnect-modal__header {
  align-items: center;
  display: flex;
  height: 26px;
  left: 0;
  justify-content: space-between;
  position: absolute;
  top: -42px;
  width: 100%;
}

.walletconnect-modal__base .wc-logo {
  align-items: center;
  display: flex;
  height: 26px;
  margin-top: 15px;
  padding-bottom: 15px;
  pointer-events: auto;
}

.walletconnect-modal__base .wc-logo div {
  background-color: #3399ff;
  height: 21px;
  margin-right: 5px;
  mask-image: url("images/wc-logo.svg") center no-repeat;
  width: 32px;
}

.walletconnect-modal__base .wc-logo p {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.walletconnect-modal__base h2 {
  color: rgba(60, 66, 82, 0.6);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1875em;
  margin: 0 0 19px 0;
  text-align: center;
  width: 100%;
}

.walletconnect-modal__base__row {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  align-items: center;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  height: 56px;
  justify-content: space-between;
  padding: 0 15px;
  position: relative;
  margin: 0px 0px 8px;
  text-align: left;
  transition: 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  text-decoration: none;
}

.walletconnect-modal__base__row:hover {
  background: rgba(60, 66, 82, 0.06);
}

.walletconnect-modal__base__row:active {
  background: rgba(60, 66, 82, 0.06);
  transform: scale(0.975);
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.walletconnect-modal__base__row__h3 {
  color: #25292e;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  padding-bottom: 3px;
}

.walletconnect-modal__base__row__right {
  align-items: center;
  display: flex;
  justify-content: center;
}

.walletconnect-modal__base__row__right__app-icon {
  border-radius: 8px;
  height: 34px;
  margin: 0 11px 2px 0;
  width: 34px;
  background-size: 100%;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-modal__base__row__right__caret {
  height: 18px;
  opacity: 0.3;
  transition: 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 8px;
  will-change: opacity;
}

.walletconnect-modal__base__row:hover .caret,
.walletconnect-modal__base__row:active .caret {
  opacity: 0.6;
}

.walletconnect-modal__mobile__toggle {
  width: 80%;
  display: flex;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 18px;
  background: #d4d5d9;
}

.walletconnect-modal__single_wallet {
  display: flex;
  justify-content: center;
  margin-top: 7px;
  margin-bottom: 18px;
}

.walletconnect-modal__single_wallet a {
  cursor: pointer;
  color: rgb(64, 153, 255);
  font-size: 21px;
  font-weight: 800;
  text-decoration: none !important;
  margin: 0 auto;
}

.walletconnect-modal__mobile__toggle_selector {
  width: calc(50% - 8px);
  background: white;
  position: absolute;
  border-radius: 5px;
  height: calc(100% - 8px);
  top: 4px;
  transition: all 0.2s ease-in-out;
  transform: translate3d(4px, 0, 0);
}

.walletconnect-modal__mobile__toggle.right__selected .walletconnect-modal__mobile__toggle_selector {
  transform: translate3d(calc(100% + 12px), 0, 0);
}

.walletconnect-modal__mobile__toggle a {
  font-size: 12px;
  width: 50%;
  text-align: center;
  padding: 8px;
  margin: 0;
  font-weight: 600;
  z-index: 1;
}

.walletconnect-modal__footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media only screen and (max-width: 768px) {
  .walletconnect-modal__footer {
    margin-top: 5vw;
  }
}

.walletconnect-modal__footer a {
  cursor: pointer;
  color: #898d97;
  font-size: 15px;
  margin: 0 auto;
}

@media only screen and (max-width: 320px) {
  .walletconnect-modal__footer a {
    font-size: 14px;
  }
}

.walletconnect-connect__buttons__wrapper {
  max-height: 44vh;
}

.walletconnect-connect__buttons__wrapper__android {
  margin: 50% 0;
}

.walletconnect-connect__buttons__wrapper__wrap {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 10px 0;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__buttons__wrapper__wrap {
    margin-top: 40px;
  }
}

.walletconnect-connect__button {
  background-color: rgb(64, 153, 255);
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: rgb(255, 255, 255);
  font-weight: 500;
}

.walletconnect-connect__button__icon_anchor {
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 8px;
  width: 42px;
  justify-self: center;
  flex-direction: column;
  text-decoration: none !important;
}

@media only screen and (max-width: 320px) {
  .walletconnect-connect__button__icon_anchor {
    margin: 4px;
  }
}

.walletconnect-connect__button__icon {
  border-radius: 10px;
  height: 42px;
  margin: 0;
  width: 42px;
  background-size: cover !important;
  box-shadow: 0 4px 12px 0 rgba(37, 41, 46, 0.25);
}

.walletconnect-connect__button__text {
  color: #424952;
  font-size: 2.7vw;
  text-decoration: none !important;
  padding: 0;
  margin-top: 1.8vw;
  font-weight: 600;
}

@media only screen and (min-width: 768px) {
  .walletconnect-connect__button__text {
    font-size: 16px;
    margin-top: 12px;
  }
}

.walletconnect-search__input {
  border: none;
  background: #d4d5d9;
  border-style: none;
  padding: 8px 16px;
  outline: none;
  font-style: normal;
  font-stretch: normal;
  font-size: 16px;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  border-radius: 8px;
  width: calc(100% - 16px);
  margin: 0;
  margin-bottom: 8px;
}
`;typeof Symbol<"u"&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")));typeof Symbol<"u"&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));function ua(t,e){try{var n=t()}catch(r){return e(r)}return n&&n.then?n.then(void 0,e):n}var _a="data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8'?%3E %3Csvg width='300px' height='185px' viewBox='0 0 300 185' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E %3C!-- Generator: Sketch 49.3 (51167) - http://www.bohemiancoding.com/sketch --%3E %3Ctitle%3EWalletConnect%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cdefs%3E%3C/defs%3E %3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E %3Cg id='walletconnect-logo-alt' fill='%233B99FC' fill-rule='nonzero'%3E %3Cpath d='M61.4385429,36.2562612 C110.349767,-11.6319051 189.65053,-11.6319051 238.561752,36.2562612 L244.448297,42.0196786 C246.893858,44.4140867 246.893858,48.2961898 244.448297,50.690599 L224.311602,70.406102 C223.088821,71.6033071 221.106302,71.6033071 219.883521,70.406102 L211.782937,62.4749541 C177.661245,29.0669724 122.339051,29.0669724 88.2173582,62.4749541 L79.542302,70.9685592 C78.3195204,72.1657633 76.337001,72.1657633 75.1142214,70.9685592 L54.9775265,51.2530561 C52.5319653,48.8586469 52.5319653,44.9765439 54.9775265,42.5821357 L61.4385429,36.2562612 Z M280.206339,77.0300061 L298.128036,94.5769031 C300.573585,96.9713 300.573599,100.85338 298.128067,103.247793 L217.317896,182.368927 C214.872352,184.763353 210.907314,184.76338 208.461736,182.368989 C208.461726,182.368979 208.461714,182.368967 208.461704,182.368957 L151.107561,126.214385 C150.496171,125.615783 149.504911,125.615783 148.893521,126.214385 C148.893517,126.214389 148.893514,126.214393 148.89351,126.214396 L91.5405888,182.368927 C89.095052,184.763359 85.1300133,184.763399 82.6844276,182.369014 C82.6844133,182.369 82.684398,182.368986 82.6843827,182.36897 L1.87196327,103.246785 C-0.573596939,100.852377 -0.573596939,96.9702735 1.87196327,94.5758653 L19.7936929,77.028998 C22.2392531,74.6345898 26.2042918,74.6345898 28.6498531,77.028998 L86.0048306,133.184355 C86.6162214,133.782957 87.6074796,133.782957 88.2188704,133.184355 C88.2188796,133.184346 88.2188878,133.184338 88.2188969,133.184331 L145.571,77.028998 C148.016505,74.6345347 151.981544,74.6344449 154.427161,77.028798 C154.427195,77.0288316 154.427229,77.0288653 154.427262,77.028899 L211.782164,133.184331 C212.393554,133.782932 213.384814,133.782932 213.996204,133.184331 L271.350179,77.0300061 C273.79574,74.6355969 277.760778,74.6355969 280.206339,77.0300061 Z' id='WalletConnect'%3E%3C/path%3E %3C/g%3E %3C/g%3E %3C/svg%3E",da="WalletConnect",fa=300,ha="rgb(64, 153, 255)",xr="walletconnect-wrapper",Ut="walletconnect-style-sheet",Ir="walletconnect-qrcode-modal",pa="walletconnect-qrcode-close",Rr="walletconnect-qrcode-text",ma="walletconnect-connect-button";function ga(t){return p.createElement("div",{className:"walletconnect-modal__header"},p.createElement("img",{src:_a,className:"walletconnect-modal__headerLogo"}),p.createElement("p",null,da),p.createElement("div",{className:"walletconnect-modal__close__wrapper",onClick:t.onClose},p.createElement("div",{id:pa,className:"walletconnect-modal__close__icon"},p.createElement("div",{className:"walletconnect-modal__close__line1"}),p.createElement("div",{className:"walletconnect-modal__close__line2"}))))}function va(t){return p.createElement("a",{className:"walletconnect-connect__button",href:t.href,id:ma+"-"+t.name,onClick:t.onClick,rel:"noopener noreferrer",style:{backgroundColor:t.color},target:"_blank"},t.name)}var ya="data:image/svg+xml,%3Csvg width='8' height='18' viewBox='0 0 8 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.586301 0.213898C0.150354 0.552968 0.0718197 1.18124 0.41089 1.61719L5.2892 7.88931C5.57007 8.25042 5.57007 8.75608 5.2892 9.11719L0.410889 15.3893C0.071819 15.8253 0.150353 16.4535 0.586301 16.7926C1.02225 17.1317 1.65052 17.0531 1.98959 16.6172L6.86791 10.3451C7.7105 9.26174 7.7105 7.74476 6.86791 6.66143L1.98959 0.38931C1.65052 -0.0466374 1.02225 -0.125172 0.586301 0.213898Z' fill='%233C4252'/%3E %3C/svg%3E";function wa(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick;return p.createElement("a",{className:"walletconnect-modal__base__row",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},p.createElement("h3",{className:"walletconnect-modal__base__row__h3"},r),p.createElement("div",{className:"walletconnect-modal__base__row__right"},p.createElement("div",{className:"walletconnect-modal__base__row__right__app-icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),p.createElement("img",{src:ya,className:"walletconnect-modal__base__row__right__caret"})))}function ba(t){var e=t.color,n=t.href,r=t.name,o=t.logo,i=t.onClick,c=window.innerWidth<768?(r.length>8?2.5:2.7)+"vw":"inherit";return p.createElement("a",{className:"walletconnect-connect__button__icon_anchor",href:n,onClick:i,rel:"noopener noreferrer",target:"_blank"},p.createElement("div",{className:"walletconnect-connect__button__icon",style:{background:"url('"+o+"') "+e,backgroundSize:"100%"}}),p.createElement("div",{style:{fontSize:c},className:"walletconnect-connect__button__text"},r))}var Ea=5,Re=12;function ka(t){var e=T.isAndroid(),n=p.useState(""),r=n[0],o=n[1],i=p.useState(""),c=i[0],u=i[1],d=p.useState(1),y=d[0],g=d[1],s=c?t.links.filter(function(_){return _.name.toLowerCase().includes(c.toLowerCase())}):t.links,E=t.errorMessage,b=c||s.length>Ea,m=Math.ceil(s.length/Re),k=[(y-1)*Re+1,y*Re],R=s.length?s.filter(function(_,h){return h+1>=k[0]&&h+1<=k[1]}):[],a=!e&&m>1,l=void 0;function f(_){o(_.target.value),clearTimeout(l),_.target.value?l=setTimeout(function(){u(_.target.value),g(1)},1e3):(o(""),u(""),g(1))}return p.createElement("div",null,p.createElement("p",{id:Rr,className:"walletconnect-qrcode__text"},e?t.text.connect_mobile_wallet:t.text.choose_preferred_wallet),!e&&p.createElement("input",{className:"walletconnect-search__input",placeholder:"Search",value:r,onChange:f}),p.createElement("div",{className:"walletconnect-connect__buttons__wrapper"+(e?"__android":b&&s.length?"__wrap":"")},e?p.createElement(va,{name:t.text.connect,color:ha,href:t.uri,onClick:p.useCallback(function(){T.saveMobileLinkInfo({name:"Unknown",href:t.uri})},[])}):R.length?R.map(function(_){var h=_.color,C=_.name,w=_.shortName,x=_.logo,I=T.formatIOSMobile(t.uri,_),O=p.useCallback(function(){T.saveMobileLinkInfo({name:C,href:I})},[R]);return b?p.createElement(ba,{color:h,href:I,name:w||C,logo:x,onClick:O}):p.createElement(wa,{color:h,href:I,name:C,logo:x,onClick:O})}):p.createElement(p.Fragment,null,p.createElement("p",null,E.length?t.errorMessage:t.links.length&&!s.length?t.text.no_wallets_found:t.text.loading))),a&&p.createElement("div",{className:"walletconnect-modal__footer"},Array(m).fill(0).map(function(_,h){var C=h+1,w=y===C;return p.createElement("a",{style:{margin:"auto 10px",fontWeight:w?"bold":"normal"},onClick:function(){return g(C)}},C)})))}function Ca(t){var e=!!t.message.trim();return p.createElement("div",{className:"walletconnect-qrcode__notification"+(e?" notification__show":"")},t.message)}var Sa=function(t){try{var e="";return Promise.resolve(Sr.toString(t,{margin:0,type:"svg"})).then(function(n){return typeof n=="string"&&(e=n.replace("<svg",'<svg class="walletconnect-qrcode__image"')),e})}catch(n){return Promise.reject(n)}};function xa(t){var e=p.useState(""),n=e[0],r=e[1],o=p.useState(""),i=o[0],c=o[1];p.useEffect(function(){try{return Promise.resolve(Sa(t.uri)).then(function(d){c(d)})}catch(d){Promise.reject(d)}},[]);var u=function(){var d=aa(t.uri);d?(r(t.text.copied_to_clipboard),setInterval(function(){return r("")},1200)):(r("Error"),setInterval(function(){return r("")},1200))};return p.createElement("div",null,p.createElement("p",{id:Rr,className:"walletconnect-qrcode__text"},t.text.scan_qrcode_with_wallet),p.createElement("div",{dangerouslySetInnerHTML:{__html:i}}),p.createElement("div",{className:"walletconnect-modal__footer"},p.createElement("a",{onClick:u},t.text.copy_to_clipboard)),p.createElement(Ca,{message:n}))}function Ia(t){var e=T.isAndroid(),n=T.isMobile(),r=n?t.qrcodeModalOptions&&t.qrcodeModalOptions.mobileLinks?t.qrcodeModalOptions.mobileLinks:void 0:t.qrcodeModalOptions&&t.qrcodeModalOptions.desktopLinks?t.qrcodeModalOptions.desktopLinks:void 0,o=p.useState(!1),i=o[0],c=o[1],u=p.useState(!1),d=u[0],y=u[1],g=p.useState(!n),s=g[0],E=g[1],b={mobile:n,text:t.text,uri:t.uri,qrcodeModalOptions:t.qrcodeModalOptions},m=p.useState(""),k=m[0],R=m[1],a=p.useState(!1),l=a[0],f=a[1],_=p.useState([]),h=_[0],C=_[1],w=p.useState(""),x=w[0],I=w[1],O=function(){d||i||r&&!r.length||h.length>0||p.useEffect(function(){var Mr=function(){try{if(e)return Promise.resolve();c(!0);var ke=ua(function(){var Y=t.qrcodeModalOptions&&t.qrcodeModalOptions.registryUrl?t.qrcodeModalOptions.registryUrl:T.getWalletRegistryUrl();return Promise.resolve(fetch(Y)).then(function(Lr){return Promise.resolve(Lr.json()).then(function(Ar){var qr=Ar.listings,Ur=n?"mobile":"desktop",ae=T.getMobileLinkRegistry(T.formatMobileRegistry(qr,Ur),r);c(!1),y(!0),I(ae.length?"":t.text.no_supported_wallets),C(ae);var ut=ae.length===1;ut&&(R(T.formatIOSMobile(t.uri,ae[0])),E(!0)),f(ut)})})},function(Y){c(!1),y(!0),I(t.text.something_went_wrong),console.error(Y)});return Promise.resolve(ke&&ke.then?ke.then(function(){}):void 0)}catch(Y){return Promise.reject(Y)}};Mr()})};O();var Nr=n?s:!s;return p.createElement("div",{id:Ir,className:"walletconnect-qrcode__base animated fadeIn"},p.createElement("div",{className:"walletconnect-modal__base"},p.createElement(ga,{onClose:t.onClose}),l&&s?p.createElement("div",{className:"walletconnect-modal__single_wallet"},p.createElement("a",{onClick:function(){return T.saveMobileLinkInfo({name:h[0].name,href:k})},href:k,rel:"noopener noreferrer",target:"_blank"},t.text.connect_with+" "+(l?h[0].name:"")+" ›")):e||i||!i&&h.length?p.createElement("div",{className:"walletconnect-modal__mobile__toggle"+(Nr?" right__selected":"")},p.createElement("div",{className:"walletconnect-modal__mobile__toggle_selector"}),n?p.createElement(p.Fragment,null,p.createElement("a",{onClick:function(){return E(!1),O()}},t.text.mobile),p.createElement("a",{onClick:function(){return E(!0)}},t.text.qrcode)):p.createElement(p.Fragment,null,p.createElement("a",{onClick:function(){return E(!0)}},t.text.qrcode),p.createElement("a",{onClick:function(){return E(!1),O()}},t.text.desktop))):null,p.createElement("div",null,s||!e&&!i&&!h.length?p.createElement(xa,Object.assign({},b)):p.createElement(ka,Object.assign({},b,{links:h,errorMessage:x})))))}var Ra={choose_preferred_wallet:"Wähle bevorzugte Wallet",connect_mobile_wallet:"Verbinde mit Mobile Wallet",scan_qrcode_with_wallet:"Scanne den QR-code mit einer WalletConnect kompatiblen Wallet",connect:"Verbinden",qrcode:"QR-Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"In die Zwischenablage kopieren",copied_to_clipboard:"In die Zwischenablage kopiert!",connect_with:"Verbinden mit Hilfe von",loading:"Laden...",something_went_wrong:"Etwas ist schief gelaufen",no_supported_wallets:"Es gibt noch keine unterstützten Wallet",no_wallets_found:"keine Wallet gefunden"},Ta={choose_preferred_wallet:"Choose your preferred wallet",connect_mobile_wallet:"Connect to Mobile Wallet",scan_qrcode_with_wallet:"Scan QR code with a WalletConnect-compatible wallet",connect:"Connect",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copy to clipboard",copied_to_clipboard:"Copied to clipboard!",connect_with:"Connect with",loading:"Loading...",something_went_wrong:"Something went wrong",no_supported_wallets:"There are no supported wallets yet",no_wallets_found:"No wallets found"},Oa={choose_preferred_wallet:"Elige tu billetera preferida",connect_mobile_wallet:"Conectar a billetera móvil",scan_qrcode_with_wallet:"Escanea el código QR con una billetera compatible con WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvil",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Conectar mediante",loading:"Cargando...",something_went_wrong:"Algo salió mal",no_supported_wallets:"Todavía no hay billeteras compatibles",no_wallets_found:"No se encontraron billeteras"},Na={choose_preferred_wallet:"Choisissez votre portefeuille préféré",connect_mobile_wallet:"Se connecter au portefeuille mobile",scan_qrcode_with_wallet:"Scannez le QR code avec un portefeuille compatible WalletConnect",connect:"Se connecter",qrcode:"QR Code",mobile:"Mobile",desktop:"Desktop",copy_to_clipboard:"Copier",copied_to_clipboard:"Copié!",connect_with:"Connectez-vous à l'aide de",loading:"Chargement...",something_went_wrong:"Quelque chose a mal tourné",no_supported_wallets:"Il n'y a pas encore de portefeuilles pris en charge",no_wallets_found:"Aucun portefeuille trouvé"},Ma={choose_preferred_wallet:"원하는 지갑을 선택하세요",connect_mobile_wallet:"모바일 지갑과 연결",scan_qrcode_with_wallet:"WalletConnect 지원 지갑에서 QR코드를 스캔하세요",connect:"연결",qrcode:"QR 코드",mobile:"모바일",desktop:"데스크탑",copy_to_clipboard:"클립보드에 복사",copied_to_clipboard:"클립보드에 복사되었습니다!",connect_with:"와 연결하다",loading:"로드 중...",something_went_wrong:"문제가 발생했습니다.",no_supported_wallets:"아직 지원되는 지갑이 없습니다",no_wallets_found:"지갑을 찾을 수 없습니다"},La={choose_preferred_wallet:"Escolha sua carteira preferida",connect_mobile_wallet:"Conectar-se à carteira móvel",scan_qrcode_with_wallet:"Ler o código QR com uma carteira compatível com WalletConnect",connect:"Conectar",qrcode:"Código QR",mobile:"Móvel",desktop:"Desktop",copy_to_clipboard:"Copiar",copied_to_clipboard:"Copiado!",connect_with:"Ligar por meio de",loading:"Carregamento...",something_went_wrong:"Algo correu mal",no_supported_wallets:"Ainda não há carteiras suportadas",no_wallets_found:"Nenhuma carteira encontrada"},Aa={choose_preferred_wallet:"选择你的钱包",connect_mobile_wallet:"连接至移动端钱包",scan_qrcode_with_wallet:"使用兼容 WalletConnect 的钱包扫描二维码",connect:"连接",qrcode:"二维码",mobile:"移动",desktop:"桌面",copy_to_clipboard:"复制到剪贴板",copied_to_clipboard:"复制到剪贴板成功！",connect_with:"通过以下方式连接",loading:"正在加载...",something_went_wrong:"出了问题",no_supported_wallets:"目前还没有支持的钱包",no_wallets_found:"没有找到钱包"},qa={choose_preferred_wallet:"کیف پول مورد نظر خود را انتخاب کنید",connect_mobile_wallet:"به کیف پول موبایل وصل شوید",scan_qrcode_with_wallet:"کد QR را با یک کیف پول سازگار با WalletConnect اسکن کنید",connect:"اتصال",qrcode:"کد QR",mobile:"سیار",desktop:"دسکتاپ",copy_to_clipboard:"کپی به کلیپ بورد",copied_to_clipboard:"در کلیپ بورد کپی شد!",connect_with:"ارتباط با",loading:"...بارگذاری",something_went_wrong:"مشکلی پیش آمد",no_supported_wallets:"هنوز هیچ کیف پول پشتیبانی شده ای وجود ندارد",no_wallets_found:"هیچ کیف پولی پیدا نشد"},$t={de:Ra,en:Ta,es:Oa,fr:Na,ko:Ma,pt:La,zh:Aa,fa:qa};function Ua(){var t=T.getDocumentOrThrow(),e=t.getElementById(Ut);e&&t.head.removeChild(e);var n=t.createElement("style");n.setAttribute("id",Ut),n.innerText=la,t.head.appendChild(n)}function $a(){var t=T.getDocumentOrThrow(),e=t.createElement("div");return e.setAttribute("id",xr),t.body.appendChild(e),e}function Tr(){var t=T.getDocumentOrThrow(),e=t.getElementById(Ir);e&&(e.className=e.className.replace("fadeIn","fadeOut"),setTimeout(function(){var n=t.getElementById(xr);n&&t.body.removeChild(n)},fa))}function Pa(t){return function(){Tr(),t&&t()}}function Da(){var t=T.getNavigatorOrThrow().language.split("-")[0]||"en";return $t[t]||$t.en}function ja(t,e,n){Ua();var r=$a();p.render(p.createElement(Ia,{text:Da(),uri:t,onClose:Pa(e),qrcodeModalOptions:n}),r)}function Ha(){Tr()}var Or=function(){return typeof process<"u"&&typeof process.versions<"u"&&typeof process.versions.node<"u"};function Ba(t,e,n){console.log(t),Or()?ca(t):ja(t,e,n)}function Wa(){Or()||Ha()}var Fa={open:Ba,close:Wa},za=Fa;const Qa=Pe(za);class Va extends jr{constructor(e){super(),this.events=new Pt,this.accounts=[],this.chainId=1,this.pending=!1,this.bridge="https://bridge.walletconnect.org",this.qrcode=!0,this.qrcodeModalOptions=void 0,this.opts=e,this.chainId=e?.chainId||this.chainId,this.wc=this.register(e)}get connected(){return typeof this.wc<"u"&&this.wc.connected}get connecting(){return this.pending}get connector(){return this.wc=this.register(this.opts),this.wc}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}off(e,n){this.events.off(e,n)}removeListener(e,n){this.events.removeListener(e,n)}async open(e){if(this.connected){this.onOpen();return}return new Promise((n,r)=>{this.on("error",o=>{r(o)}),this.on("open",()=>{n()}),this.create(e)})}async close(){typeof this.wc>"u"||(this.wc.connected&&this.wc.killSession(),this.onClose())}async send(e){this.wc=this.register(this.opts),this.connected||await this.open(),this.sendPayload(e).then(n=>this.events.emit("payload",n)).catch(n=>this.events.emit("payload",_t(e.id,n.message)))}register(e){if(this.wc)return this.wc;this.opts=e||this.opts,this.bridge=e?.connector?e.connector.bridge:e?.bridge||"https://bridge.walletconnect.org",this.qrcode=typeof e?.qrcode>"u"||e.qrcode!==!1,this.chainId=typeof e?.chainId<"u"?e.chainId:this.chainId,this.qrcodeModalOptions=e?.qrcodeModalOptions;const n={bridge:this.bridge,qrcodeModal:this.qrcode?Qa:void 0,qrcodeModalOptions:this.qrcodeModalOptions,storageId:e?.storageId,signingMethods:e?.signingMethods,clientMeta:e?.clientMeta};if(this.wc=typeof e?.connector<"u"?e.connector:new Us(n),typeof this.wc>"u")throw new Error("Failed to register WalletConnect connector");return this.wc.accounts.length&&(this.accounts=this.wc.accounts),this.wc.chainId&&(this.chainId=this.wc.chainId),this.registerConnectorEvents(),this.wc}onOpen(e){this.pending=!1,e&&(this.wc=e),this.events.emit("open")}onClose(){this.pending=!1,this.wc&&(this.wc=void 0),this.events.emit("close")}onError(e,n="Failed or Rejected Request",r=-32e3){const o={id:e.id,jsonrpc:e.jsonrpc,error:{code:r,message:n}};return this.events.emit("payload",o),o}create(e){this.wc=this.register(this.opts),this.chainId=e||this.chainId,!(this.connected||this.pending)&&(this.pending=!0,this.registerConnectorEvents(),this.wc.createSession({chainId:this.chainId}).then(()=>this.events.emit("created")).catch(n=>this.events.emit("error",n)))}registerConnectorEvents(){this.wc=this.register(this.opts),this.wc.on("connect",e=>{var n,r;if(e){this.events.emit("error",e);return}this.accounts=((n=this.wc)===null||n===void 0?void 0:n.accounts)||[],this.chainId=((r=this.wc)===null||r===void 0?void 0:r.chainId)||this.chainId,this.onOpen()}),this.wc.on("disconnect",e=>{if(e){this.events.emit("error",e);return}this.onClose()}),this.wc.on("modal_closed",()=>{this.events.emit("error",new Error("User closed modal"))}),this.wc.on("session_update",(e,n)=>{const{accounts:r,chainId:o}=n.params[0];(!this.accounts||r&&this.accounts!==r)&&(this.accounts=r,this.events.emit("accountsChanged",r)),(!this.chainId||o&&this.chainId!==o)&&(this.chainId=o,this.events.emit("chainChanged",o))})}async sendPayload(e){this.wc=this.register(this.opts);try{const n=await this.wc.unsafeSend(e);return this.sanitizeResponse(n)}catch(n){return this.onError(e,n.message)}}sanitizeResponse(e){return typeof e.error<"u"&&typeof e.error.code>"u"?_t(e.id,e.error.message,e.error.data):e}}class ec{constructor(e){this.events=new Pt,this.rpc={infuraId:e?.infuraId,custom:e?.rpc},this.signer=new dt(new Va(e));const n=this.signer.connection.chainId||e?.chainId||1;this.http=this.setHttpProvider(n),this.registerEventListeners()}get connected(){return this.signer.connection.connected}get connector(){return this.signer.connection.connector}get accounts(){return this.signer.connection.accounts}get chainId(){return this.signer.connection.chainId}get rpcUrl(){var e;return((e=this.http)===null||e===void 0?void 0:e.connection).url||""}async request(e){switch(e.method){case"eth_requestAccounts":return await this.connect(),this.signer.connection.accounts;case"eth_accounts":return this.signer.connection.accounts;case"eth_chainId":return this.signer.connection.chainId}if(Fe.includes(e.method))return this.signer.request(e);if(typeof this.http>"u")throw new Error(`Cannot request JSON-RPC method (${e.method}) without provided rpc url`);return this.http.request(e)}sendAsync(e,n){this.request(e).then(r=>n(null,r)).catch(r=>n(r,void 0))}async enable(){return await this.request({method:"eth_requestAccounts"})}async connect(){this.signer.connection.connected||await this.signer.connect()}async disconnect(){this.signer.connection.connected&&await this.signer.disconnect()}on(e,n){this.events.on(e,n)}once(e,n){this.events.once(e,n)}removeListener(e,n){this.events.removeListener(e,n)}off(e,n){this.events.off(e,n)}get isWalletConnect(){return!0}registerEventListeners(){this.signer.connection.on("accountsChanged",e=>{this.events.emit("accountsChanged",e)}),this.signer.connection.on("chainChanged",e=>{this.http=this.setHttpProvider(e),this.events.emit("chainChanged",e)}),this.signer.on("disconnect",()=>{this.events.emit("disconnect")})}setHttpProvider(e){const n=Ln(e,this.rpc);return typeof n>"u"?void 0:new dt(new Hr(n))}}export{ec as default};
//# sourceMappingURL=index-2cf3f30a.js.map
