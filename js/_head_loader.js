const HTML_FILE = document.documentElement.attributes.filename?.value 
	|| location.pathname.split('/').reverse()[0].split('.')[0] 
	|| 'index'

const _event_all_done = new Event('_all_done'),
	  _all_done = new Promise(resolve => document.addEventListener('_all_done', () => resolve(true)))

document.documentElement.hidden = true


// if filename parameters are not set (undefined) load automatically the js and css with same name of html file calling function If they are null, doesn't load it. If they are set load the given resource
async function load_head(js_filename, css_filename){

	// HTTPS if not
	if(location.protocol != 'https:' && location.host != 'localhost') return location.protocol = 'https:'

	// Vars and functions ---
    css_filename = typeof css_filename === 'string' ? css_filename : (css_filename === undefined ? HTML_FILE+'.css' : null)
    js_filename = typeof js_filename === 'string' ? js_filename : (js_filename === undefined ? HTML_FILE+'.js' : null)

	function load_link(href, version){ // CSS

		return new Promise(resolve => {

			let link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = href+(version ? '?v='+version : '')

			link.onload = resolve

			document.head.appendChild(link)
		})
	}
	function load_script(src, version){ // JS

		return new Promise(resolve => {

			let script = document.createElement('script')
			script.src = src+(version ? '?v='+version : '')

			script.onload = resolve

			document.head.appendChild(script)
		})
	}

	const rootPath = ''

	// JQuery (if does not exist) ---
	if(typeof $ == 'undefined') await load_script(rootPath+'js/lib/jquery.min.js')

	// Version ---
    window.VERSION = await Promise.race([
		fetch(rootPath+'version', {cache: "no-store"}).then(res => res.text()).catch(() => 0),
		new Promise(resolve => setTimeout(() => resolve(0), 3000))
	])

	// load styles (CSS) ---
	let link_promises = [

		load_link(rootPath+'css/lib/la.css', VERSION),
		load_link(rootPath+'css/all.css', VERSION)
	]
	if(css_filename) link_promises.push(load_link(rootPath+'css/'+css_filename, VERSION))

	Promise.all(link_promises).then(() => { document.documentElement.hidden = false })

	// load scripts (JS) ---
	load_script(rootPath+'js/lib/la.js', VERSION).then(() => {

		load_script(rootPath+'js/all.js', VERSION)
		if(js_filename) load_script(rootPath+'js/'+js_filename, VERSION)
	})
}
