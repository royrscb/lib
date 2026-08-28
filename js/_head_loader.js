const HTML_FILE = document.documentElement.attributes.filename?.value 
	|| location.pathname.split('/').reverse()[0].split('.')[0] 
	|| 'index'

const _event_all_done_ = new Event('_all_done_'),
	  _all_done_ = new Promise(resolve => document.addEventListener('_all_done_', () => resolve()))

document.documentElement.hidden = true

// if filename parameters are not set (undefined) load automatically the js and css with same name of html file calling function.
// If they are null, doesn't load it.
// If they are set, load the given resource
async function load_head(js_filename, css_filename){

	if(location.protocol != 'https:' && location.host != 'localhost')
        return location.protocol = 'https:'

    css_filename = typeof css_filename === 'string' ? css_filename
        : (css_filename === undefined ? HTML_FILE+'.css' : null)
    js_filename = typeof js_filename === 'string' ? js_filename
        : (js_filename === undefined ? HTML_FILE+'.js' : null)

	function load_link(href, version){ // CSS
		return new Promise((resolve, reject) => {
			let link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = version ? `${href}?v=${version}` : href

			link.onload = resolve
			link.onerror = reject

			document.head.appendChild(link)
		})
	}
	function load_script(src, version){ // JS
		return new Promise((resolve, reject) => {
			let script = document.createElement('script')
			script.src = version ? `${src}?v=${version}` : src

			script.onload = resolve
			script.onerror = reject

			document.head.appendChild(script)
		})
	}

	const rootPath = ''

	if(typeof $ == 'undefined') await load_script(rootPath+'js/lib/jquery.min.js')
    window.VERSION = navigator.onLine
        ? await fetch(rootPath+'version', {cache: 'no-store'}).then(res => res.text())
        : false

	// load styles ----------------------------------------------------
	let link_promises = [
        load_link('https://cdn.jsdelivr.net/gh/royrscb/lib@latest/css/la.css', VERSION),
		load_link(rootPath+'css/all.css', VERSION)
	]
	if(css_filename) {
        link_promises.push(load_link(rootPath+'css/'+css_filename, VERSION))
    }
	Promise.all(link_promises).then(() => {
        document.documentElement.hidden = false
    })

	// load scripts ----------------------------------------------------
    await load_script('https://cdn.jsdelivr.net/gh/royrscb/lib@latest/js/extensions.js', VERSION)
    await load_script(rootPath+'js/lib/la.js', VERSION)

    load_script(rootPath+'js/all.js', VERSION)
    if(js_filename) {
        load_script(rootPath+'js/'+js_filename, VERSION)
    }
}
