2:I[9107,[],"ClientPageRoot"]
3:I[5603,["358","static/chunks/bc9e92e6-24c28b2d5b1238b1.js","139","static/chunks/69806262-a6ba0c4c74048759.js","726","static/chunks/726-54c611218da3723a.js","244","static/chunks/244-9efbf25e89b6742c.js","958","static/chunks/958-82710bb10c9ff665.js","521","static/chunks/521-8335275c36c129f3.js","834","static/chunks/app/news/page-1a24ba412b429066.js"],"default",1]
4:I[4707,[],""]
5:I[6423,[],""]
7:I[8003,["929","static/chunks/929-394f247e7a37b7ba.js","185","static/chunks/app/layout-60f39668d53d5238.js"],""]
8:I[9377,["929","static/chunks/929-394f247e7a37b7ba.js","185","static/chunks/app/layout-60f39668d53d5238.js"],"BrandProvider"]
9:I[249,["929","static/chunks/929-394f247e7a37b7ba.js","185","static/chunks/app/layout-60f39668d53d5238.js"],"default"]
a:I[4954,["929","static/chunks/929-394f247e7a37b7ba.js","185","static/chunks/app/layout-60f39668d53d5238.js"],"default"]
6:Ta4e,
              (function() {
                try {
                  // Wait for DOM to be ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', applyTheme);
                  } else {
                    applyTheme();
                  }
                  
                  function applyTheme() {
                    try {
                      const savedTheme = localStorage.getItem('pocket-portfolio-theme');
                      const theme = savedTheme && ['system', 'light', 'dark', 'contrast'].includes(savedTheme) 
                        ? savedTheme 
                        : 'system';
                      
                      if (theme === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        const themeValue = prefersDark ? 'dark' : 'light';
                        if (document.documentElement) {
                          document.documentElement.setAttribute('data-theme', themeValue);
                        }
                        if (document.body) {
                          document.body.setAttribute('data-theme', themeValue);
                        }
                      } else {
                        if (document.documentElement) {
                          document.documentElement.setAttribute('data-theme', theme);
                        }
                        if (document.body) {
                          document.body.setAttribute('data-theme', theme);
                        }
                      }
                    } catch (e) {
                      // Fallback to dark theme if localStorage fails
                      if (document.documentElement) {
                        document.documentElement.setAttribute('data-theme', 'dark');
                      }
                      if (document.body) {
                        document.body.setAttribute('data-theme', 'dark');
                      }
                    }
                  }
                } catch (e) {
                  // Final fallback - try to set theme directly
                  try {
                    if (document.documentElement) {
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    if (document.body) {
                      document.body.setAttribute('data-theme', 'dark');
                    }
                  } catch (e2) {
                    // Silent fail if DOM is not ready
                  }
                }
              })();
            0:["Py4IcORah57aNKpya1z7-",[[["",{"children":["news",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["news",{"children":["__PAGE__",{},[["$L1",["$","$L2",null,{"props":{"params":{},"searchParams":{}},"Component":"$3"}],null],null],null]},[null,["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children","news","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/c277ee5c7f0590d9.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","link",null,{"rel":"icon","href":"/brand/pp-monogram.svg"}],["$","link",null,{"rel":"apple-touch-icon","href":"/brand/pp-monogram.svg"}],["$","link",null,{"rel":"manifest","href":"/manifest.webmanifest"}],["$","link",null,{"rel":"sitemap","type":"application/xml","href":"/sitemap.xml"}],["$","link",null,{"rel":"preconnect","href":"https://www.gstatic.com","crossOrigin":"anonymous"}],["$","link",null,{"rel":"preconnect","href":"https://www.googleapis.com","crossOrigin":"anonymous"}],["$","link",null,{"rel":"preconnect","href":"https://www.googletagmanager.com","crossOrigin":"anonymous"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta",null,{"name":"apple-mobile-web-app-title","content":"Pocket Portfolio"}],["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"format-detection","content":"telephone=no"}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$6"}}]]}],["$","body",null,{"className":"__className_f367f3 mobile-container","suppressHydrationWarning":true,"children":[[["$","$L7",null,{"src":"https://www.googletagmanager.com/gtag/js?id=G-9FQ2NBHY7H","strategy":"afterInteractive"}],["$","$L7",null,{"id":"google-analytics","strategy":"afterInteractive","children":"\n                window.dataLayer = window.dataLayer || [];\n                function gtag(){dataLayer.push(arguments);}\n                gtag('js', new Date());\n                gtag('config', 'G-9FQ2NBHY7H', {\n                  page_path: window.location.pathname,\n                  send_page_view: true,\n                  cookie_flags: 'SameSite=Lax;Secure',\n                });\n              "}]],["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"WebApplication\",\n  \"name\": \"Pocket Portfolio\",\n  \"description\": \"Track your investments with real-time portfolio analytics. Import trades from 10+ brokers, analyze performance, and make informed decisions.\",\n  \"url\": \"https://pocket-portfolio.app\",\n  \"logo\": {\n    \"@type\": \"ImageObject\",\n    \"url\": \"https://pocket-portfolio.app/brand/pp-wordmark.svg\"\n  },\n  \"sameAs\": [\n    \"https://github.com/pocket-portfolio\",\n    \"https://twitter.com/pocketportfolio\",\n    \"https://discord.gg/Ch9PpjRzwe\",\n    \"https://dev.to/pocketportfolioapp\",\n    \"https://coderlegion.com/5738/welcome-to-coderlegion-22s\"\n  ],\n  \"potentialAction\": {\n    \"@type\": \"SearchAction\",\n    \"target\": \"https://pocket-portfolio.app/search?q={search_term_string}\",\n    \"query-input\": \"required name=search_term_string\"\n  }\n}"}}],["$","$L8",null,{"children":[["$","$L9",null,{}],["$","div",null,{"className":"safe-area-all","children":[["$","$L4",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[]}],["$","$La",null,{}]]}]]}]]}]]}]],null],null],["$Lb",null]]]]
b:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes"}],["$","meta","1",{"name":"theme-color","media":"(prefers-color-scheme: light)","content":"#ffffff"}],["$","meta","2",{"name":"theme-color","media":"(prefers-color-scheme: dark)","content":"#0b0d10"}],["$","meta","3",{"name":"color-scheme","content":"light dark"}],["$","meta","4",{"charSet":"utf-8"}],["$","title","5",{"children":"Pocket Portfolio — Evidence-First Investing"}],["$","meta","6",{"name":"description","content":"Track positions with clean, reliable data pipelines. Built in public, evidence first."}],["$","meta","7",{"name":"author","content":"Pocket Portfolio Team"}],["$","meta","8",{"name":"keywords","content":"portfolio tracker,investment tracking,stock portfolio,financial data,open source finance,evidence-based investing,CSV import,portfolio management,price pipeline health,developer portfolio tracker,building in public,transparent investing,resilient price pipeline,never 0.00 price,mock trade lab,portfolio analytics,dev.to portfolio,developer community finance"}],["$","meta","9",{"name":"creator","content":"Pocket Portfolio"}],["$","meta","10",{"name":"publisher","content":"Pocket Portfolio"}],["$","meta","11",{"name":"robots","content":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}],["$","link","12",{"rel":"canonical","href":"https://www.pocketportfolio.app/"}],["$","meta","13",{"property":"og:title","content":"Pocket Portfolio — Evidence-First Investing"}],["$","meta","14",{"property":"og:description","content":"Track positions with clean, reliable data pipelines. Built in public, evidence first."}],["$","meta","15",{"property":"og:url","content":"https://www.pocketportfolio.app/"}],["$","meta","16",{"property":"og:site_name","content":"Pocket Portfolio"}],["$","meta","17",{"property":"og:locale","content":"en_US"}],["$","meta","18",{"property":"og:image","content":"http://localhost:3000/api/og?title=Pocket%20Portfolio"}],["$","meta","19",{"property":"og:image:width","content":"1200"}],["$","meta","20",{"property":"og:image:height","content":"630"}],["$","meta","21",{"property":"og:image:alt","content":"Pocket Portfolio — Evidence-First Investing"}],["$","meta","22",{"property":"og:type","content":"website"}],["$","meta","23",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","24",{"name":"twitter:site","content":"@PocketPortApp"}],["$","meta","25",{"name":"twitter:creator","content":"@PocketPortApp"}],["$","meta","26",{"name":"twitter:title","content":"Pocket Portfolio — Evidence-First Investing"}],["$","meta","27",{"name":"twitter:description","content":"Track positions with clean, reliable data pipelines. Built in public, evidence first."}],["$","meta","28",{"name":"twitter:image","content":"http://localhost:3000/api/og?title=Pocket%20Portfolio"}]]
1:null
