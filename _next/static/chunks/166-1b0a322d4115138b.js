"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[166],{7401:(e,t,r)=>{r.d(t,{A:()=>a});var o=r(2115);let n=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),l=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return t.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim()};var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let s=(0,o.forwardRef)((e,t)=>{let{color:r="currentColor",size:n=24,strokeWidth:s=2,absoluteStrokeWidth:a,className:d="",children:c,iconNode:u,...p}=e;return(0,o.createElement)("svg",{ref:t,...i,width:n,height:n,stroke:r,strokeWidth:a?24*Number(s)/Number(n):s,className:l("lucide",d),...p},[...u.map(e=>{let[t,r]=e;return(0,o.createElement)(t,r)}),...Array.isArray(c)?c:[c]])}),a=(e,t)=>{let r=(0,o.forwardRef)((r,i)=>{let{className:a,...d}=r;return(0,o.createElement)(s,{ref:i,iconNode:t,className:l("lucide-".concat(n(e)),a),...d})});return r.displayName="".concat(e),r}},3610:(e,t,r)=>{r.d(t,{m:()=>o});function o(e,t,{checkForDefaultPrevented:r=!0}={}){return function(o){if(e?.(o),!1===r||!o.defaultPrevented)return t?.(o)}}},9741:(e,t,r)=>{r.d(t,{N:()=>a});var o=r(2115),n=r(8166),l=r(8068),i=r(2317),s=r(5155);function a(e){let t=e+"CollectionProvider",[r,a]=(0,n.A)(t),[d,c]=r(t,{collectionRef:{current:null},itemMap:new Map}),u=e=>{let{scope:t,children:r}=e,n=o.useRef(null),l=o.useRef(new Map).current;return(0,s.jsx)(d,{scope:t,itemMap:l,collectionRef:n,children:r})};u.displayName=t;let p=e+"CollectionSlot",m=o.forwardRef((e,t)=>{let{scope:r,children:o}=e,n=c(p,r),a=(0,l.s)(t,n.collectionRef);return(0,s.jsx)(i.DX,{ref:a,children:o})});m.displayName=p;let f=e+"CollectionItemSlot",b="data-radix-collection-item",g=o.forwardRef((e,t)=>{let{scope:r,children:n,...a}=e,d=o.useRef(null),u=(0,l.s)(t,d),p=c(f,r);return o.useEffect(()=>(p.itemMap.set(d,{ref:d,...a}),()=>void p.itemMap.delete(d))),(0,s.jsx)(i.DX,{[b]:"",ref:u,children:n})});return g.displayName=f,[{Provider:u,Slot:m,ItemSlot:g},function(t){let r=c(e+"CollectionConsumer",t);return o.useCallback(()=>{let e=r.collectionRef.current;if(!e)return[];let t=Array.from(e.querySelectorAll("[".concat(b,"]")));return Array.from(r.itemMap.values()).sort((e,r)=>t.indexOf(e.ref.current)-t.indexOf(r.ref.current))},[r.collectionRef,r.itemMap])},a]}},8068:(e,t,r)=>{r.d(t,{s:()=>i,t:()=>l});var o=r(2115);function n(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}function l(...e){return t=>{let r=!1,o=e.map(e=>{let o=n(e,t);return r||"function"!=typeof o||(r=!0),o});if(r)return()=>{for(let t=0;t<o.length;t++){let r=o[t];"function"==typeof r?r():n(e[t],null)}}}}function i(...e){return o.useCallback(l(...e),e)}},8166:(e,t,r)=>{r.d(t,{A:()=>l});var o=r(2115),n=r(5155);function l(e,t=[]){let r=[],i=()=>{let t=r.map(e=>o.createContext(e));return function(r){let n=r?.[e]||t;return o.useMemo(()=>({[`__scope${e}`]:{...r,[e]:n}}),[r,n])}};return i.scopeName=e,[function(t,l){let i=o.createContext(l),s=r.length;r=[...r,l];let a=t=>{let{scope:r,children:l,...a}=t,d=r?.[e]?.[s]||i,c=o.useMemo(()=>a,Object.values(a));return(0,n.jsx)(d.Provider,{value:c,children:l})};return a.displayName=t+"Provider",[a,function(r,n){let a=n?.[e]?.[s]||i,d=o.useContext(a);if(d)return d;if(void 0!==l)return l;throw Error(`\`${r}\` must be used within \`${t}\``)}]},function(...e){let t=e[0];if(1===e.length)return t;let r=()=>{let r=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let n=r.reduce((t,{useScope:r,scopeName:o})=>{let n=r(e)[`__scope${o}`];return{...t,...n}},{});return o.useMemo(()=>({[`__scope${t.scopeName}`]:n}),[n])}};return r.scopeName=t.scopeName,r}(i,...t)]}},9674:(e,t,r)=>{r.d(t,{lg:()=>h,qW:()=>p,bL:()=>g});var o,n=r(2115),l=r(3610),i=r(3360),s=r(8068),a=r(1524),d=r(5155),c="dismissableLayer.update",u=n.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),p=n.forwardRef((e,t)=>{var r,p;let{disableOutsidePointerEvents:m=!1,onEscapeKeyDown:g,onPointerDownOutside:h,onFocusOutside:v,onInteractOutside:y,onDismiss:w,...x}=e,k=n.useContext(u),[E,C]=n.useState(null),N=null!==(p=null==E?void 0:E.ownerDocument)&&void 0!==p?p:null===(r=globalThis)||void 0===r?void 0:r.document,[,S]=n.useState({}),O=(0,s.s)(t,e=>C(e)),z=Array.from(k.layers),[P]=[...k.layersWithOutsidePointerEventsDisabled].slice(-1),j=z.indexOf(P),T=E?z.indexOf(E):-1,R=k.layersWithOutsidePointerEventsDisabled.size>0,L=T>=j,M=function(e){var t;let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,o=(0,a.c)(e),l=n.useRef(!1),i=n.useRef(()=>{});return n.useEffect(()=>{let e=e=>{if(e.target&&!l.current){let t=function(){b("dismissableLayer.pointerDownOutside",o,n,{discrete:!0})},n={originalEvent:e};"touch"===e.pointerType?(r.removeEventListener("click",i.current),i.current=t,r.addEventListener("click",i.current,{once:!0})):t()}else r.removeEventListener("click",i.current);l.current=!1},t=window.setTimeout(()=>{r.addEventListener("pointerdown",e)},0);return()=>{window.clearTimeout(t),r.removeEventListener("pointerdown",e),r.removeEventListener("click",i.current)}},[r,o]),{onPointerDownCapture:()=>l.current=!0}}(e=>{let t=e.target,r=[...k.branches].some(e=>e.contains(t));!L||r||(null==h||h(e),null==y||y(e),e.defaultPrevented||null==w||w())},N),A=function(e){var t;let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null===(t=globalThis)||void 0===t?void 0:t.document,o=(0,a.c)(e),l=n.useRef(!1);return n.useEffect(()=>{let e=e=>{e.target&&!l.current&&b("dismissableLayer.focusOutside",o,{originalEvent:e},{discrete:!1})};return r.addEventListener("focusin",e),()=>r.removeEventListener("focusin",e)},[r,o]),{onFocusCapture:()=>l.current=!0,onBlurCapture:()=>l.current=!1}}(e=>{let t=e.target;[...k.branches].some(e=>e.contains(t))||(null==v||v(e),null==y||y(e),e.defaultPrevented||null==w||w())},N);return!function(e,t=globalThis?.document){let r=(0,a.c)(e);n.useEffect(()=>{let e=e=>{"Escape"===e.key&&r(e)};return t.addEventListener("keydown",e,{capture:!0}),()=>t.removeEventListener("keydown",e,{capture:!0})},[r,t])}(e=>{T!==k.layers.size-1||(null==g||g(e),!e.defaultPrevented&&w&&(e.preventDefault(),w()))},N),n.useEffect(()=>{if(E)return m&&(0===k.layersWithOutsidePointerEventsDisabled.size&&(o=N.body.style.pointerEvents,N.body.style.pointerEvents="none"),k.layersWithOutsidePointerEventsDisabled.add(E)),k.layers.add(E),f(),()=>{m&&1===k.layersWithOutsidePointerEventsDisabled.size&&(N.body.style.pointerEvents=o)}},[E,N,m,k]),n.useEffect(()=>()=>{E&&(k.layers.delete(E),k.layersWithOutsidePointerEventsDisabled.delete(E),f())},[E,k]),n.useEffect(()=>{let e=()=>S({});return document.addEventListener(c,e),()=>document.removeEventListener(c,e)},[]),(0,d.jsx)(i.sG.div,{...x,ref:O,style:{pointerEvents:R?L?"auto":"none":void 0,...e.style},onFocusCapture:(0,l.m)(e.onFocusCapture,A.onFocusCapture),onBlurCapture:(0,l.m)(e.onBlurCapture,A.onBlurCapture),onPointerDownCapture:(0,l.m)(e.onPointerDownCapture,M.onPointerDownCapture)})});p.displayName="DismissableLayer";var m=n.forwardRef((e,t)=>{let r=n.useContext(u),o=n.useRef(null),l=(0,s.s)(t,o);return n.useEffect(()=>{let e=o.current;if(e)return r.branches.add(e),()=>{r.branches.delete(e)}},[r.branches]),(0,d.jsx)(i.sG.div,{...e,ref:l})});function f(){let e=new CustomEvent(c);document.dispatchEvent(e)}function b(e,t,r,o){let{discrete:n}=o,l=r.originalEvent.target,s=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:r});t&&l.addEventListener(e,t,{once:!0}),n?(0,i.hO)(l,s):l.dispatchEvent(s)}m.displayName="DismissableLayerBranch";var g=p,h=m},7323:(e,t,r)=>{r.d(t,{Z:()=>a});var o=r(2115),n=r(7650),l=r(3360),i=r(6611),s=r(5155),a=o.forwardRef((e,t)=>{var r,a;let{container:d,...c}=e,[u,p]=o.useState(!1);(0,i.N)(()=>p(!0),[]);let m=d||u&&(null===(a=globalThis)||void 0===a?void 0:null===(r=a.document)||void 0===r?void 0:r.body);return m?n.createPortal((0,s.jsx)(l.sG.div,{...c,ref:t}),m):null});a.displayName="Portal"},7028:(e,t,r)=>{r.d(t,{C:()=>i});var o=r(2115),n=r(8068),l=r(6611),i=e=>{let{present:t,children:r}=e,i=function(e){var t,r;let[n,i]=o.useState(),a=o.useRef({}),d=o.useRef(e),c=o.useRef("none"),[u,p]=(t=e?"mounted":"unmounted",r={mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}},o.useReducer((e,t)=>{let o=r[e][t];return null!=o?o:e},t));return o.useEffect(()=>{let e=s(a.current);c.current="mounted"===u?e:"none"},[u]),(0,l.N)(()=>{let t=a.current,r=d.current;if(r!==e){let o=c.current,n=s(t);e?p("MOUNT"):"none"===n||(null==t?void 0:t.display)==="none"?p("UNMOUNT"):r&&o!==n?p("ANIMATION_OUT"):p("UNMOUNT"),d.current=e}},[e,p]),(0,l.N)(()=>{if(n){var e;let t;let r=null!==(e=n.ownerDocument.defaultView)&&void 0!==e?e:window,o=e=>{let o=s(a.current).includes(e.animationName);if(e.target===n&&o&&(p("ANIMATION_END"),!d.current)){let e=n.style.animationFillMode;n.style.animationFillMode="forwards",t=r.setTimeout(()=>{"forwards"===n.style.animationFillMode&&(n.style.animationFillMode=e)})}},l=e=>{e.target===n&&(c.current=s(a.current))};return n.addEventListener("animationstart",l),n.addEventListener("animationcancel",o),n.addEventListener("animationend",o),()=>{r.clearTimeout(t),n.removeEventListener("animationstart",l),n.removeEventListener("animationcancel",o),n.removeEventListener("animationend",o)}}p("ANIMATION_END")},[n,p]),{isPresent:["mounted","unmountSuspended"].includes(u),ref:o.useCallback(e=>{e&&(a.current=getComputedStyle(e)),i(e)},[])}}(t),a="function"==typeof r?r({present:i.isPresent}):o.Children.only(r),d=(0,n.s)(i.ref,function(e){var t,r;let o=null===(t=Object.getOwnPropertyDescriptor(e.props,"ref"))||void 0===t?void 0:t.get,n=o&&"isReactWarning"in o&&o.isReactWarning;return n?e.ref:(n=(o=null===(r=Object.getOwnPropertyDescriptor(e,"ref"))||void 0===r?void 0:r.get)&&"isReactWarning"in o&&o.isReactWarning)?e.props.ref:e.props.ref||e.ref}(a));return"function"==typeof r||i.isPresent?o.cloneElement(a,{ref:d}):null};function s(e){return(null==e?void 0:e.animationName)||"none"}i.displayName="Presence"},3360:(e,t,r)=>{r.d(t,{hO:()=>a,sG:()=>s});var o=r(2115),n=r(7650),l=r(2317),i=r(5155),s=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,t)=>{let r=o.forwardRef((e,r)=>{let{asChild:o,...n}=e,s=o?l.DX:t;return"undefined"!=typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,i.jsx)(s,{...n,ref:r})});return r.displayName=`Primitive.${t}`,{...e,[t]:r}},{});function a(e,t){e&&n.flushSync(()=>e.dispatchEvent(t))}},2317:(e,t,r)=>{r.d(t,{DX:()=>i});var o=r(2115),n=r(8068),l=r(5155),i=o.forwardRef((e,t)=>{let{children:r,...n}=e,i=o.Children.toArray(r),a=i.find(d);if(a){let e=a.props.children,r=i.map(t=>t!==a?t:o.Children.count(e)>1?o.Children.only(null):o.isValidElement(e)?e.props.children:null);return(0,l.jsx)(s,{...n,ref:t,children:o.isValidElement(e)?o.cloneElement(e,void 0,r):null})}return(0,l.jsx)(s,{...n,ref:t,children:r})});i.displayName="Slot";var s=o.forwardRef((e,t)=>{let{children:r,...l}=e;if(o.isValidElement(r)){let e=function(e){let t=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(r=(t=Object.getOwnPropertyDescriptor(e,"ref")?.get)&&"isReactWarning"in t&&t.isReactWarning)?e.props.ref:e.props.ref||e.ref}(r);return o.cloneElement(r,{...function(e,t){let r={...t};for(let o in t){let n=e[o],l=t[o];/^on[A-Z]/.test(o)?n&&l?r[o]=(...e)=>{l(...e),n(...e)}:n&&(r[o]=n):"style"===o?r[o]={...n,...l}:"className"===o&&(r[o]=[n,l].filter(Boolean).join(" "))}return{...e,...r}}(l,r.props),ref:t?(0,n.t)(t,e):e})}return o.Children.count(r)>1?o.Children.only(null):null});s.displayName="SlotClone";var a=({children:e})=>(0,l.jsx)(l.Fragment,{children:e});function d(e){return o.isValidElement(e)&&e.type===a}},1524:(e,t,r)=>{r.d(t,{c:()=>n});var o=r(2115);function n(e){let t=o.useRef(e);return o.useEffect(()=>{t.current=e}),o.useMemo(()=>(...e)=>t.current?.(...e),[])}},1488:(e,t,r)=>{r.d(t,{i:()=>l});var o=r(2115),n=r(1524);function l({prop:e,defaultProp:t,onChange:r=()=>{}}){let[l,i]=function({defaultProp:e,onChange:t}){let r=o.useState(e),[l]=r,i=o.useRef(l),s=(0,n.c)(t);return o.useEffect(()=>{i.current!==l&&(s(l),i.current=l)},[l,i,s]),r}({defaultProp:t,onChange:r}),s=void 0!==e,a=s?e:l,d=(0,n.c)(r);return[a,o.useCallback(t=>{if(s){let r="function"==typeof t?t(e):t;r!==e&&d(r)}else i(t)},[s,e,i,d])]}},6611:(e,t,r)=>{r.d(t,{N:()=>n});var o=r(2115),n=globalThis?.document?o.useLayoutEffect:()=>{}},1027:(e,t,r)=>{r.d(t,{F:()=>i});var o=r(3463);let n=e=>"boolean"==typeof e?`${e}`:0===e?"0":e,l=o.$,i=(e,t)=>r=>{var o;if((null==t?void 0:t.variants)==null)return l(e,null==r?void 0:r.class,null==r?void 0:r.className);let{variants:i,defaultVariants:s}=t,a=Object.keys(i).map(e=>{let t=null==r?void 0:r[e],o=null==s?void 0:s[e];if(null===t)return null;let l=n(t)||n(o);return i[e][l]}),d=r&&Object.entries(r).reduce((e,t)=>{let[r,o]=t;return void 0===o||(e[r]=o),e},{});return l(e,a,null==t?void 0:null===(o=t.compoundVariants)||void 0===o?void 0:o.reduce((e,t)=>{let{class:r,className:o,...n}=t;return Object.entries(n).every(e=>{let[t,r]=e;return Array.isArray(r)?r.includes({...s,...d}[t]):({...s,...d})[t]===r})?[...e,r,o]:e},[]),null==r?void 0:r.class,null==r?void 0:r.className)}},3463:(e,t,r)=>{r.d(t,{$:()=>o});function o(){for(var e,t,r=0,o="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=function e(t){var r,o,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t){if(Array.isArray(t)){var l=t.length;for(r=0;r<l;r++)t[r]&&(o=e(t[r]))&&(n&&(n+=" "),n+=o)}else for(o in t)t[o]&&(n&&(n+=" "),n+=o)}return n}(e))&&(o&&(o+=" "),o+=t);return o}},7113:(e,t,r)=>{r.d(t,{D:()=>c,ThemeProvider:()=>u});var o=r(2115),n=(e,t,r,o,n,l,i,s)=>{let a=document.documentElement,d=["light","dark"];function c(t){(Array.isArray(e)?e:[e]).forEach(e=>{let r="class"===e,o=r&&l?n.map(e=>l[e]||e):n;r?(a.classList.remove(...o),a.classList.add(t)):a.setAttribute(e,t)}),s&&d.includes(t)&&(a.style.colorScheme=t)}if(o)c(o);else try{let e=localStorage.getItem(t)||r,o=i&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;c(o)}catch(e){}},l=["light","dark"],i="(prefers-color-scheme: dark)",s="undefined"==typeof window,a=o.createContext(void 0),d={setTheme:e=>{},themes:[]},c=()=>{var e;return null!=(e=o.useContext(a))?e:d},u=e=>o.useContext(a)?o.createElement(o.Fragment,null,e.children):o.createElement(m,{...e}),p=["light","dark"],m=e=>{let{forcedTheme:t,disableTransitionOnChange:r=!1,enableSystem:n=!0,enableColorScheme:s=!0,storageKey:d="theme",themes:c=p,defaultTheme:u=n?"system":"light",attribute:m="data-theme",value:v,children:y,nonce:w,scriptProps:x}=e,[k,E]=o.useState(()=>b(d,u)),[C,N]=o.useState(()=>b(d)),S=v?Object.values(v):c,O=o.useCallback(e=>{let t=e;if(!t)return;"system"===e&&n&&(t=h());let o=v?v[t]:t,i=r?g(w):null,a=document.documentElement,d=e=>{"class"===e?(a.classList.remove(...S),o&&a.classList.add(o)):e.startsWith("data-")&&(o?a.setAttribute(e,o):a.removeAttribute(e))};if(Array.isArray(m)?m.forEach(d):d(m),s){let e=l.includes(u)?u:null,r=l.includes(t)?t:e;a.style.colorScheme=r}null==i||i()},[w]),z=o.useCallback(e=>{let t="function"==typeof e?e(k):e;E(t);try{localStorage.setItem(d,t)}catch(e){}},[k]),P=o.useCallback(e=>{N(h(e)),"system"===k&&n&&!t&&O("system")},[k,t]);o.useEffect(()=>{let e=window.matchMedia(i);return e.addListener(P),P(e),()=>e.removeListener(P)},[P]),o.useEffect(()=>{let e=e=>{e.key===d&&(e.newValue?E(e.newValue):z(u))};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[z]),o.useEffect(()=>{O(null!=t?t:k)},[t,k]);let j=o.useMemo(()=>({theme:k,setTheme:z,forcedTheme:t,resolvedTheme:"system"===k?C:k,themes:n?[...c,"system"]:c,systemTheme:n?C:void 0}),[k,z,t,C,n,c]);return o.createElement(a.Provider,{value:j},o.createElement(f,{forcedTheme:t,storageKey:d,attribute:m,enableSystem:n,enableColorScheme:s,defaultTheme:u,value:v,themes:c,nonce:w,scriptProps:x}),y)},f=o.memo(e=>{let{forcedTheme:t,storageKey:r,attribute:l,enableSystem:i,enableColorScheme:s,defaultTheme:a,value:d,themes:c,nonce:u,scriptProps:p}=e,m=JSON.stringify([l,r,a,t,c,d,i,s]).slice(1,-1);return o.createElement("script",{...p,suppressHydrationWarning:!0,nonce:"undefined"==typeof window?u:"",dangerouslySetInnerHTML:{__html:"(".concat(n.toString(),")(").concat(m,")")}})}),b=(e,t)=>{let r;if(!s){try{r=localStorage.getItem(e)||void 0}catch(e){}return r||t}},g=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},h=e=>(e||(e=window.matchMedia(i)),e.matches?"dark":"light")},9795:(e,t,r)=>{r.d(t,{QP:()=>Z});let o=e=>{let t=s(e),{conflictingClassGroups:r,conflictingClassGroupModifiers:o}=e;return{getClassGroupId:e=>{let r=e.split("-");return""===r[0]&&1!==r.length&&r.shift(),n(r,t)||i(e)},getConflictingClassGroupIds:(e,t)=>{let n=r[e]||[];return t&&o[e]?[...n,...o[e]]:n}}},n=(e,t)=>{if(0===e.length)return t.classGroupId;let r=e[0],o=t.nextPart.get(r),l=o?n(e.slice(1),o):void 0;if(l)return l;if(0===t.validators.length)return;let i=e.join("-");return t.validators.find(({validator:e})=>e(i))?.classGroupId},l=/^\[(.+)\]$/,i=e=>{if(l.test(e)){let t=l.exec(e)[1],r=t?.substring(0,t.indexOf(":"));if(r)return"arbitrary.."+r}},s=e=>{let{theme:t,prefix:r}=e,o={nextPart:new Map,validators:[]};return u(Object.entries(e.classGroups),r).forEach(([e,r])=>{a(r,o,e,t)}),o},a=(e,t,r,o)=>{e.forEach(e=>{if("string"==typeof e){(""===e?t:d(t,e)).classGroupId=r;return}if("function"==typeof e){if(c(e)){a(e(o),t,r,o);return}t.validators.push({validator:e,classGroupId:r});return}Object.entries(e).forEach(([e,n])=>{a(n,d(t,e),r,o)})})},d=(e,t)=>{let r=e;return t.split("-").forEach(e=>{r.nextPart.has(e)||r.nextPart.set(e,{nextPart:new Map,validators:[]}),r=r.nextPart.get(e)}),r},c=e=>e.isThemeGetter,u=(e,t)=>t?e.map(([e,r])=>[e,r.map(e=>"string"==typeof e?t+e:"object"==typeof e?Object.fromEntries(Object.entries(e).map(([e,r])=>[t+e,r])):e)]):e,p=e=>{if(e<1)return{get:()=>void 0,set:()=>{}};let t=0,r=new Map,o=new Map,n=(n,l)=>{r.set(n,l),++t>e&&(t=0,o=r,r=new Map)};return{get(e){let t=r.get(e);return void 0!==t?t:void 0!==(t=o.get(e))?(n(e,t),t):void 0},set(e,t){r.has(e)?r.set(e,t):n(e,t)}}},m=e=>{let{separator:t,experimentalParseClassName:r}=e,o=1===t.length,n=t[0],l=t.length,i=e=>{let r;let i=[],s=0,a=0;for(let d=0;d<e.length;d++){let c=e[d];if(0===s){if(c===n&&(o||e.slice(d,d+l)===t)){i.push(e.slice(a,d)),a=d+l;continue}if("/"===c){r=d;continue}}"["===c?s++:"]"===c&&s--}let d=0===i.length?e:e.substring(a),c=d.startsWith("!"),u=c?d.substring(1):d;return{modifiers:i,hasImportantModifier:c,baseClassName:u,maybePostfixModifierPosition:r&&r>a?r-a:void 0}};return r?e=>r({className:e,parseClassName:i}):i},f=e=>{if(e.length<=1)return e;let t=[],r=[];return e.forEach(e=>{"["===e[0]?(t.push(...r.sort(),e),r=[]):r.push(e)}),t.push(...r.sort()),t},b=e=>({cache:p(e.cacheSize),parseClassName:m(e),...o(e)}),g=/\s+/,h=(e,t)=>{let{parseClassName:r,getClassGroupId:o,getConflictingClassGroupIds:n}=t,l=[],i=e.trim().split(g),s="";for(let e=i.length-1;e>=0;e-=1){let t=i[e],{modifiers:a,hasImportantModifier:d,baseClassName:c,maybePostfixModifierPosition:u}=r(t),p=!!u,m=o(p?c.substring(0,u):c);if(!m){if(!p||!(m=o(c))){s=t+(s.length>0?" "+s:s);continue}p=!1}let b=f(a).join(":"),g=d?b+"!":b,h=g+m;if(l.includes(h))continue;l.push(h);let v=n(m,p);for(let e=0;e<v.length;++e){let t=v[e];l.push(g+t)}s=t+(s.length>0?" "+s:s)}return s};function v(){let e,t,r=0,o="";for(;r<arguments.length;)(e=arguments[r++])&&(t=y(e))&&(o&&(o+=" "),o+=t);return o}let y=e=>{let t;if("string"==typeof e)return e;let r="";for(let o=0;o<e.length;o++)e[o]&&(t=y(e[o]))&&(r&&(r+=" "),r+=t);return r},w=e=>{let t=t=>t[e]||[];return t.isThemeGetter=!0,t},x=/^\[(?:([a-z-]+):)?(.+)\]$/i,k=/^\d+\/\d+$/,E=new Set(["px","full","screen"]),C=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,N=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,S=/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,O=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,z=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,P=e=>T(e)||E.has(e)||k.test(e),j=e=>V(e,"length",B),T=e=>!!e&&!Number.isNaN(Number(e)),R=e=>V(e,"number",T),L=e=>!!e&&Number.isInteger(Number(e)),M=e=>e.endsWith("%")&&T(e.slice(0,-1)),A=e=>x.test(e),D=e=>C.test(e),W=new Set(["length","size","percentage"]),I=e=>V(e,W,q),_=e=>V(e,"position",q),$=new Set(["image","url"]),G=e=>V(e,$,K),F=e=>V(e,"",X),U=()=>!0,V=(e,t,r)=>{let o=x.exec(e);return!!o&&(o[1]?"string"==typeof t?o[1]===t:t.has(o[1]):r(o[2]))},B=e=>N.test(e)&&!S.test(e),q=()=>!1,X=e=>O.test(e),K=e=>z.test(e);Symbol.toStringTag;let Z=function(e,...t){let r,o,n;let l=function(s){return o=(r=b(t.reduce((e,t)=>t(e),e()))).cache.get,n=r.cache.set,l=i,i(s)};function i(e){let t=o(e);if(t)return t;let l=h(e,r);return n(e,l),l}return function(){return l(v.apply(null,arguments))}}(()=>{let e=w("colors"),t=w("spacing"),r=w("blur"),o=w("brightness"),n=w("borderColor"),l=w("borderRadius"),i=w("borderSpacing"),s=w("borderWidth"),a=w("contrast"),d=w("grayscale"),c=w("hueRotate"),u=w("invert"),p=w("gap"),m=w("gradientColorStops"),f=w("gradientColorStopPositions"),b=w("inset"),g=w("margin"),h=w("opacity"),v=w("padding"),y=w("saturate"),x=w("scale"),k=w("sepia"),E=w("skew"),C=w("space"),N=w("translate"),S=()=>["auto","contain","none"],O=()=>["auto","hidden","clip","visible","scroll"],z=()=>["auto",A,t],W=()=>[A,t],$=()=>["",P,j],V=()=>["auto",T,A],B=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],q=()=>["solid","dashed","dotted","double","none"],X=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],K=()=>["start","end","center","between","around","evenly","stretch"],Z=()=>["","0",A],H=()=>["auto","avoid","all","avoid-page","page","left","right","column"],J=()=>[T,A];return{cacheSize:500,separator:":",theme:{colors:[U],spacing:[P,j],blur:["none","",D,A],brightness:J(),borderColor:[e],borderRadius:["none","","full",D,A],borderSpacing:W(),borderWidth:$(),contrast:J(),grayscale:Z(),hueRotate:J(),invert:Z(),gap:W(),gradientColorStops:[e],gradientColorStopPositions:[M,j],inset:z(),margin:z(),opacity:J(),padding:W(),saturate:J(),scale:J(),sepia:Z(),skew:J(),space:W(),translate:W()},classGroups:{aspect:[{aspect:["auto","square","video",A]}],container:["container"],columns:[{columns:[D]}],"break-after":[{"break-after":H()}],"break-before":[{"break-before":H()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...B(),A]}],overflow:[{overflow:O()}],"overflow-x":[{"overflow-x":O()}],"overflow-y":[{"overflow-y":O()}],overscroll:[{overscroll:S()}],"overscroll-x":[{"overscroll-x":S()}],"overscroll-y":[{"overscroll-y":S()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[b]}],"inset-x":[{"inset-x":[b]}],"inset-y":[{"inset-y":[b]}],start:[{start:[b]}],end:[{end:[b]}],top:[{top:[b]}],right:[{right:[b]}],bottom:[{bottom:[b]}],left:[{left:[b]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",L,A]}],basis:[{basis:z()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",A]}],grow:[{grow:Z()}],shrink:[{shrink:Z()}],order:[{order:["first","last","none",L,A]}],"grid-cols":[{"grid-cols":[U]}],"col-start-end":[{col:["auto",{span:["full",L,A]},A]}],"col-start":[{"col-start":V()}],"col-end":[{"col-end":V()}],"grid-rows":[{"grid-rows":[U]}],"row-start-end":[{row:["auto",{span:[L,A]},A]}],"row-start":[{"row-start":V()}],"row-end":[{"row-end":V()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",A]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",A]}],gap:[{gap:[p]}],"gap-x":[{"gap-x":[p]}],"gap-y":[{"gap-y":[p]}],"justify-content":[{justify:["normal",...K()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...K(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...K(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[v]}],px:[{px:[v]}],py:[{py:[v]}],ps:[{ps:[v]}],pe:[{pe:[v]}],pt:[{pt:[v]}],pr:[{pr:[v]}],pb:[{pb:[v]}],pl:[{pl:[v]}],m:[{m:[g]}],mx:[{mx:[g]}],my:[{my:[g]}],ms:[{ms:[g]}],me:[{me:[g]}],mt:[{mt:[g]}],mr:[{mr:[g]}],mb:[{mb:[g]}],ml:[{ml:[g]}],"space-x":[{"space-x":[C]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[C]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",A,t]}],"min-w":[{"min-w":[A,t,"min","max","fit"]}],"max-w":[{"max-w":[A,t,"none","full","min","max","fit","prose",{screen:[D]},D]}],h:[{h:[A,t,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[A,t,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[A,t,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[A,t,"auto","min","max","fit"]}],"font-size":[{text:["base",D,j]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",R]}],"font-family":[{font:[U]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",A]}],"line-clamp":[{"line-clamp":["none",T,R]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",P,A]}],"list-image":[{"list-image":["none",A]}],"list-style-type":[{list:["none","disc","decimal",A]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[h]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[h]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...q(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",P,j]}],"underline-offset":[{"underline-offset":["auto",P,A]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:W()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",A]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",A]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[h]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...B(),_]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",I]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},G]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[f]}],"gradient-via-pos":[{via:[f]}],"gradient-to-pos":[{to:[f]}],"gradient-from":[{from:[m]}],"gradient-via":[{via:[m]}],"gradient-to":[{to:[m]}],rounded:[{rounded:[l]}],"rounded-s":[{"rounded-s":[l]}],"rounded-e":[{"rounded-e":[l]}],"rounded-t":[{"rounded-t":[l]}],"rounded-r":[{"rounded-r":[l]}],"rounded-b":[{"rounded-b":[l]}],"rounded-l":[{"rounded-l":[l]}],"rounded-ss":[{"rounded-ss":[l]}],"rounded-se":[{"rounded-se":[l]}],"rounded-ee":[{"rounded-ee":[l]}],"rounded-es":[{"rounded-es":[l]}],"rounded-tl":[{"rounded-tl":[l]}],"rounded-tr":[{"rounded-tr":[l]}],"rounded-br":[{"rounded-br":[l]}],"rounded-bl":[{"rounded-bl":[l]}],"border-w":[{border:[s]}],"border-w-x":[{"border-x":[s]}],"border-w-y":[{"border-y":[s]}],"border-w-s":[{"border-s":[s]}],"border-w-e":[{"border-e":[s]}],"border-w-t":[{"border-t":[s]}],"border-w-r":[{"border-r":[s]}],"border-w-b":[{"border-b":[s]}],"border-w-l":[{"border-l":[s]}],"border-opacity":[{"border-opacity":[h]}],"border-style":[{border:[...q(),"hidden"]}],"divide-x":[{"divide-x":[s]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[s]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[h]}],"divide-style":[{divide:q()}],"border-color":[{border:[n]}],"border-color-x":[{"border-x":[n]}],"border-color-y":[{"border-y":[n]}],"border-color-s":[{"border-s":[n]}],"border-color-e":[{"border-e":[n]}],"border-color-t":[{"border-t":[n]}],"border-color-r":[{"border-r":[n]}],"border-color-b":[{"border-b":[n]}],"border-color-l":[{"border-l":[n]}],"divide-color":[{divide:[n]}],"outline-style":[{outline:["",...q()]}],"outline-offset":[{"outline-offset":[P,A]}],"outline-w":[{outline:[P,j]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:$()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[h]}],"ring-offset-w":[{"ring-offset":[P,j]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",D,F]}],"shadow-color":[{shadow:[U]}],opacity:[{opacity:[h]}],"mix-blend":[{"mix-blend":[...X(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":X()}],filter:[{filter:["","none"]}],blur:[{blur:[r]}],brightness:[{brightness:[o]}],contrast:[{contrast:[a]}],"drop-shadow":[{"drop-shadow":["","none",D,A]}],grayscale:[{grayscale:[d]}],"hue-rotate":[{"hue-rotate":[c]}],invert:[{invert:[u]}],saturate:[{saturate:[y]}],sepia:[{sepia:[k]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[r]}],"backdrop-brightness":[{"backdrop-brightness":[o]}],"backdrop-contrast":[{"backdrop-contrast":[a]}],"backdrop-grayscale":[{"backdrop-grayscale":[d]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[c]}],"backdrop-invert":[{"backdrop-invert":[u]}],"backdrop-opacity":[{"backdrop-opacity":[h]}],"backdrop-saturate":[{"backdrop-saturate":[y]}],"backdrop-sepia":[{"backdrop-sepia":[k]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[i]}],"border-spacing-x":[{"border-spacing-x":[i]}],"border-spacing-y":[{"border-spacing-y":[i]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",A]}],duration:[{duration:J()}],ease:[{ease:["linear","in","out","in-out",A]}],delay:[{delay:J()}],animate:[{animate:["none","spin","ping","pulse","bounce",A]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[x]}],"scale-x":[{"scale-x":[x]}],"scale-y":[{"scale-y":[x]}],rotate:[{rotate:[L,A]}],"translate-x":[{"translate-x":[N]}],"translate-y":[{"translate-y":[N]}],"skew-x":[{"skew-x":[E]}],"skew-y":[{"skew-y":[E]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",A]}],accent:[{accent:["auto",e]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",A]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":W()}],"scroll-mx":[{"scroll-mx":W()}],"scroll-my":[{"scroll-my":W()}],"scroll-ms":[{"scroll-ms":W()}],"scroll-me":[{"scroll-me":W()}],"scroll-mt":[{"scroll-mt":W()}],"scroll-mr":[{"scroll-mr":W()}],"scroll-mb":[{"scroll-mb":W()}],"scroll-ml":[{"scroll-ml":W()}],"scroll-p":[{"scroll-p":W()}],"scroll-px":[{"scroll-px":W()}],"scroll-py":[{"scroll-py":W()}],"scroll-ps":[{"scroll-ps":W()}],"scroll-pe":[{"scroll-pe":W()}],"scroll-pt":[{"scroll-pt":W()}],"scroll-pr":[{"scroll-pr":W()}],"scroll-pb":[{"scroll-pb":W()}],"scroll-pl":[{"scroll-pl":W()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",A]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[P,j,R]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}})}}]);