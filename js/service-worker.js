// Const ---
const VERSION = getVersion(self.serviceWorker.scriptURL),
	CACHE_NAME = 'cache_v'+VERSION

if(!VERSION) throw Error('Invalid VERSION ['+VERSION+']')

// Array ---
let resourcesToCache = [

	'.',

	// HTML ---------------------------------
	'index.html',
	'404.html',

	// JSON ---------------------------------
	'manifest.json',
	'parameters.json',
	'text.json',

	// CSS ----------------------------------
	'css/lib/la.css',

	//JS ------------------------------------
	'js/_head_loader.js',

	// lib
	'js/lib/jquery.min.js',
	'js/lib/la.js',

	// Ico
	'img/ico/pwaicon.png',
	'img/ico/favicon.png',

]
// Add version to all resources (we never cache anything without version)
.map(resourceName => {
	
	return resourceName == '.' ? '.'
		: resourceName+'?v='+VERSION
})

let urlToNotInterceptFetch = [
	'/php/',
	'/version'
]

// Listeners --------------------------------------------------------------------------------------
self.addEventListener('install', event => {

	if(!VERSION) throw Error('Can not install Service Worker with invalid version ['+VERSION+']')

	console.log('[Service worker v='+VERSION+'] install')

	if(self.registration.active && getVersion(self.registration.active.scriptURL) != VERSION) self.skipWaiting()

	// Add resourcs to cache
	event.waitUntil(caches.open(CACHE_NAME).then(cache => {

		return cache.addAll(resourcesToCache)
	}))
})
self.addEventListener('activate', event => {

	console.log('[Service worker v='+VERSION+'] activate')

	// Delete caches which are not this version
	event.waitUntil(caches.keys().then(cacheNames => {

		let deleteOldCachesPromises = []
		cacheNames.forEach(cacheName => {

			if(cacheName != CACHE_NAME) {

				deleteOldCachesPromises.push(caches.delete(cacheName))
			}
		})

		return Promise.all(deleteOldCachesPromises)
	}))
})

// Intercept requests
self.addEventListener('fetch', event => {

	const requestVersion = getVersion(event.request.url)
	const interceptFetch = !urlToNotInterceptFetch.find(url => event.request.url.includes(url))
			&& (!requestVersion || requestVersion == VERSION)

	if(interceptFetch) {

		event.respondWith(
			caches.match(event.request, {ignoreSearch: true}).then(cachedResponse => {
	
				if(!cachedResponse && (!requestVersion || requestVersion == VERSION)) console.warn('[Service worker v='+VERSION+'] "'+event.request.url+'" not found on cache')
				
				return cachedResponse || fetch(event.request)
			})
		)
	}
})

// Notifications ----------------------------------------------------------------------------------
self.addEventListener('push', event =>  {

	let data
	try{
		data = event.data.json()
	}
	catch{
		data = {
			body: event.data.text()
		}
	}

	if(data.badge) navigator.setAppBadge(data.badge)

	if(!data.preventNotification) {

		let notification = {
			
			title: 'Cointrol'
			// icon: '/img/logos/box_round.png'
		}
		notification = Object.assign(notification, data)
		
		event.waitUntil(self.registration.showNotification(notification.title, notification))
	}
})

self.addEventListener('notificationclick', event => {

  	let notification = event.notification

	let receiver = notification.data && notification.data.receiver

	if(navigator.clearAppBadge) navigator.clearAppBadge()

	if(event.action === 'close') notification.close()
	else{

		if(notification.data && notification.data.onClickLink) clients.openWindow(notification.data.onClickLink)
		else clients.openWindow('https://cointrol.com/')
	}
})

// ################################################################################################
function getVersion(scriptURL){

	return scriptURL?.split('?')[1]?.split('=')[1]
}














