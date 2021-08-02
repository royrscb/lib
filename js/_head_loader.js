const HTML_FILE = location.pathname.split('/').reverse()[0].split('.')[0] || 'index'

const _event_all_done_ = new Event('_all_done_'),
	  _all_done_ = new Promise(resolve => document.addEventListener('_all_done_', () => resolve(true)))

document.documentElement.hidden = true


// if filename parameters are not set (undefined) load automatically the js and css with same name of html file calling function If they are null, doesn't load it. If they are set load the given resource
async function load_head(js_filename, css_filename){

	if(location.protocol != 'https:' && location.host != 'localhost') return location.protocol = 'https:'

    css_filename = typeof css_filename === 'string' ? css_filename : (css_filename === undefined ? HTML_FILE+'.css' : null)
    js_filename = typeof js_filename === 'string' ? js_filename : (js_filename === undefined ? HTML_FILE+'.js' : null)

	function load_link(href, version){

		return new Promise((resolve, reject) => {

			let link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = href+(version ? '?v='+version : '')

			link.onload = resolve
			link.onerror = reject

			document.head.appendChild(link)
		})
	}
	function load_script(src, version){

		return new Promise((resolve, reject) => {

			let script = document.createElement('script')
			script.src = src+(version ? '?v='+version : '')

			script.onload = resolve
			script.onerror = reject

			document.head.appendChild(script)
		})
	}

	if(typeof $ == 'undefined') await load_script('../js/lib/jquery.min.js')
    window.VERSION = navigator.onLine ? await fetch('../version', {cache: "no-store"}).then(res => res.text()) : false

	// load manifest --------------------------------------------------
	let link = document.createElement('link')
	link.rel = 'manifest'
	link.href = '../manifest.json'+(VERSION ? '?v='+VERSION : '')
	document.head.appendChild(link)

	// load styles ----------------------------------------------------
	let link_promises = [

		load_link('../css/lib/la.css', VERSION),
		load_link('../css/all.css', VERSION),
		load_link('../css/allMobile.css', VERSION),
		load_link('../css/allDesktop.css', VERSION)
	]
	if(css_filename) link_promises.push(load_link('../css/'+css_filename, VERSION))
	Promise.all(link_promises).then(() => $(document.documentElement).fadeIn())

	// load scripts ----------------------------------------------------
	load_script('../js/lib/la.js', VERSION).then(() => {

		load_script('../js/all.js', VERSION)
		if(js_filename) load_script('../js/'+js_filename, VERSION)
	})
}
