/* La.js v = 3 | Roy Ros Cobo | github.com/royrscb */

const La = {

    get: {

        /* Prefered user language in format of 2 length lower case
            if not allowedLangs, returns navigator.language
            else prioritize allowed langs and search over navigator languages
            (never returns null)
        */
        lang(allowedLangs = null) {

            if(allowedLangs){

                let normalizedAllowedLangs = allowedLangs.map(lang => lang.slice(0, 2).toLowerCase())

                let foundLang = navigator.languages.find(lang => 
                    normalizedAllowedLangs.includes(lang.slice(0, 2).toLowerCase())
                )

                return foundLang ? foundLang.slice(0, 2).toLowerCase()
                    : normalizedAllowedLangs[0]
            }
            else return navigator.language.slice(0, 2).toLowerCase()
        },

        device() {

			const width = window.innerWidth

			let current_device = width <= 600 ? DEVICE.mobile
				: width < 768 ? DEVICE.tablet
				: DEVICE.desktop

			return current_device
        },

        file(src, version) {

			if(version) src += '?v='+version

			return fetch(src).then(response => { return response.text() })
        },

        json(src, version) {

            if(version) src += '?v='+version

			return fetch(src).then(response => { return response.json() })
        },

        root(relative = true) {

            var root = '/'

            if (relative) {

                root = './'
                var levels = window.location.href.split('/').slice(4).length
                for (var i = 0; i < levels; i++)
                    if (i == 0) root = '.' + root
                else root = '../' + root
            }

            if (window.location.host == 'localhost')
                if (relative) {

                    if (levels == 1) root = root.slice(1)
                    else root = root.slice(3)

                } else root = window.location.href.split('/')[3]

            return root
        },

        urlQueries(url = window.location.search) {

            if(url){

                var params = {};

                url.split('?')[1].split('&').forEach(param => {

                    keyValue = param.split('=')
                    params[keyValue[0]] = keyValue[1]
                })

                return params
            }
            else return {}
        },

        htmlFile(url = window.location.pathname){

            return url
                .split('?')[0]
                .split('/')
                .reverse()[0]
                .split('.')[0] 
                || 'index'
        },

		// find key in json object searching recursively by depth, looking for object that match eval, what is a bool returning function with current object as parameter
		objectFromJson(json, key, condition){

			if(json.hasOwnProperty(key) && (!condition || condition(json[key]))) return json[key]
			else for(k in json){

				if(json[k] && typeof json[k] == 'object'){

					const maybeObj = La.get.objectFromJson(json[k], key, condition)

					if(maybeObj) return maybeObj
				}
			}

			return null
		},

		timeOnPage(miliseconds = false){

			if(miliseconds) return Math.round(performance.now())
			else return Math.round(performance.now()/1000)
		},

        rgbColor(color, opacity = null){

            // Crea un elemento div oculto para aplicar el color y obtener el color en formato RGB
            var div = document.createElement('div')
            div.style.color = color
            div.style.display = 'none'
            document.body.appendChild(div)
        
            var colorRGB = window.getComputedStyle(div).color

            if(opacity) colorRGB = colorRGB.slice(0, -1) + ', '+ opacity + ')'
        
            // Elimina el elemento div
            document.body.removeChild(div)
        
            return colorRGB
        },

        async imageSizes(src){

            return new Promise(resolve => {

                const img = new Image()
                img.onload = function() {

                    let sizes = {width: this.width, height: this.height}
                    
                   resolve(sizes)
                }
                
                img.src = src
            })
        },

        megabytesFromLength(string) {

            const bits = string.length * 6

            return bits / 8_000_000
        },

        // Min included, max excluded
        random(min = 0, max = 100, amount = 1, repeated = false) {

            if(amount == 1) return Math.floor(Math.random() * (max - min)) + min
            else{

                var arr = []

                if(repeated) for(let i=0; i<amount; i++) arr.push(La.util.random(min, max))
                else{

                    for(let i=0; i<Math.min(amount, max - min +1); i++){

                        var num = La.util.random(min, max)
                        while(arr.includes(num)) num = La.util.random(min, max)
                        arr.push(num)
                    }
                }

                return arr
            }
        },

        guid() {
	
            return ([1e7]+-1e3+-4e3+-8e3+-1e11)
                .replace(/[018]/g, c => {
        
                    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)
                        .toString(16)
                })
        }
    },

	set: {

		urlQueries(params){

			if(!params) window.history.replaceState(null, null, location.pathname)
			else if(typeof params == 'string') window.history.replaceState(null, null, location.href.split('?')[0]+'?'+params)
			else if(typeof params == 'object') La.set.urlQueries(Object.keys(params).map(k => k+'='+(typeof params[k] == 'string' ? params[k].split(' ').join('_') : params[k])).join('&'))
		},

        // options and events may have two fields (drag and drop) with associated options and events; options to override are drag: {handle, containment, snap, zIndex, axis, speed} drop: {tolerance}; Exceptions to official docs: options.drag.snap boolean, options.drop.emptyBorder boolean, events.change is called when two elements are changed.
        interchangeable(draggable, droppable, options, events){

            if(!jQuery.ui) return La.pop.text('JQuery UI is not loaded', 'error')

            const defaultSettings = {

                drag: {

                    drag: function(){},

                    handle: false,
                    containment: false,
                    snap: false,
                    zIndex: 999,
                    axis: false,
                    speed: 'fast'
                },
                drop: {

                    activate: function(){},
                    deactivate: function(){},
                    drop: function(){},
                    emptyBorder: true,

                    tolerance: 'intersect'
                }
            }
            let settings = $.extend(true, defaultSettings, options, events)

            let original_dragged_offset
            let new_dragged_droppable = null,
                new_dragged_position


            // drag -----------------------------------------------
            settings.drag.start = function(e, ui){

                original_dragged_offset = $(this).offset()

                if(settings.drop.emptyBorder) $(this).parents(droppable).css({border: '1.5px dashed black', borderRadius: 3})

                if(events && events.drag && events.drag.start) events.drag.start($(this))
            }
            settings.drag.stop = function(e, ui){

                if(new_dragged_droppable){

                    $(this).animate(new_dragged_position, settings.drag.speed, function(){

                        let dragged_parent = $(this).parents(droppable)

                        $(this).css({top: 0, left: 0})
                        new_dragged_droppable.find(draggable).css({top: 0, left: 0})

                        dragged_parent.append(new_dragged_droppable.find(draggable))
                        new_dragged_droppable.append(this)

                        if(events && events.change) events.change($(this), dragged_parent.find(draggable))
                    })
                }
                else $(this).animate({top: 0, left: 0}, settings.drag.speed)

                if(settings.drop.emptyBorder) $(droppable).css('border', 0)

                if(events && events.drag && events.drag.stop) events.drag.stop($(this))
            }

            // drop ------------------------------------------
            settings.drop.over = function(e, ui){

                if(!ui.draggable.get(0).isSameNode($(this).find(draggable).get(0))){

                    new_dragged_droppable = $(this)
                    new_dragged_position = {

                        top: $(this).find(draggable).offset().top - original_dragged_offset.top,
                        left: $(this).find(draggable).offset().left - original_dragged_offset.left
                    }

                    // bring draggable from this droppable to dragged droppable
                    $(this).find(draggable).animate({

                        top: original_dragged_offset.top - $(this).offset().top,
                        left: original_dragged_offset.left - $(this).offset().left

                    }, settings.drag.speed)

                    if(settings.drag.snap) $(ui.draggable).animate(new_dragged_position)

                    if(settings.drop.emptyBorder) {

                        $(this).css({border: '1.5px dashed black', borderRadius: 3})
                        ui.draggable.parents(droppable).css('border', 0)
                    }
                }

                if(events && events.drop && events.drop.over) events.drop.over($(this), ui.draggable)
            }
            settings.drop.out = function(e, ui){

                if(!ui.draggable.get(0).isSameNode($(this).find(draggable).get(0))){

                    new_dragged_droppable = null
                    new_dragged_position = null

                    $(this).find(draggable).animate({ top: 0, left: 0 }, settings.drag.speed)

                    if(settings.drop.emptyBorder) {

                        $(ui.draggable).parents(droppable).css({border: '1.5px dashed black', borderRadius: 3})
                        $(this).css('border', 0)
                    }
                }

                if(events && events.drop && events.drop.out) events.drop.out($(this), ui.draggable)
            }


            $(draggable).draggable(settings.drag)
            $(droppable).droppable(settings.drop)
        },

		carousel(carousel = '#root .carousel', slideElement = 'img', transitonTime = 1500){

			carousel = $(carousel)

			carousel.find(slideElement+':first').clone().addClass('fake-first-carousel-el').insertAfter(carousel.find(slideElement+':last'))
			carousel.find(slideElement+':first').addClass('active')

			function slideCarousel(){

				const active_el = carousel.find(slideElement+'.active')

				carousel.animate({scrollLeft: '+='+active_el.width()}, transitonTime, () => {

					active_el.removeClass('active')

					if(active_el.next().hasClass('fake-first-carousel-el')){

						carousel.scrollLeft(0)
						carousel.find(slideElement+':first').addClass('active')
					}
					else active_el.next(slideElement).addClass('active')

					setTimeout(slideCarousel, transitonTime)
				})
			}

			setTimeout(slideCarousel, transitonTime)
		},

		intervalAndExecute(func, delay) {

			func()

			return setInterval(func, delay)
		},

        async backgroundImage(element, image_src, sizes, resize = true){

            sizes = $.extend({

                minWidth: 150,
                minHeight: 100, 

                width: 150,
                height: 100,

                maxWidth: '100%',
                maxHeight: 400

            }, sizes)

            element.css('background-image', image_src ? 'url('+image_src+')' : 'none')

            if(resize && image_src){

                const imageSizes = await La.get.imageSizes(image_src)
                const imageAspectRatio = imageSizes.width / imageSizes.height
                
                // Maxima entre la minima i la que li va be tenir pel seu aspect ratio
                sizes = {
                    width: Math.max(sizes.width, sizes.height * imageAspectRatio),
                    height: Math.max(sizes.height, sizes.width / imageAspectRatio)
                }

                // Minima entre la maxima que vull que tingui i la que li va be tenir pel seu aspect ratio
                sizes = {
                    width: Math.min(element.parent().innerWidth(), sizes.height * imageAspectRatio),
                    height: Math.min(parseInt(element.css('maxHeight')), sizes.width / imageAspectRatio)
                }
            }

            element.css(sizes).css({

                display: 'inline-block',

                backgroundSize: resize ? 'cover' : 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

                transition: '400ms'
            })

            return element
        },

        widthOfTheBigger(selector){

            let elements = $(selector)

            const maxWidth = Array.from(elements.map((_, el) => $(el).width())).max()

            elements.width(maxWidth)

            return elements
        },
        widthOfTheSmaller(selector){

            let elements = $(selector)

            const minWidth = Array.from(elements.map((_, el) => $(el).width())).min()

            elements.width(minWidth)

            return elements
        },

        heightOfTheBigger(selector){

            let elements = $(selector)

            const maxHeight = Array.from(elements.map((_, el) => $(el).height())).max()

            elements.height(maxHeight)

            return elements
        },
        heightOfTheSmaller(selector){

            let elements = $(selector)

            const minHeight = Array.from(elements.map((_, el) => $(el).height())).min()

            elements.height(minHeight)

            return elements
        }
    },

	is: {

        number(x){

            return x.toString().split('').every(char => {

                const isDigit = '0'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= '9'.charCodeAt(),
                    isDot = char == '.'

                return isDigit || isDot
            })
        },
		integer(x){

			return La.is.number() && !x.toString().includes('.')
		},
        date(date) {

            return (date instanceof Date)
                && !isNaN(date)
        },

		device(device){

			if(!device) throw Error('Device parameters required')

			const current_device = La.get.device()

			if(Array.isArray(device)) return device.includes(current_device)
			else return device == current_device
		},
        mobileDevice: () => La.is.device(DEVICE.mobile),
        tabletDevice: () => La.is.device(DEVICE.tablet),
        desktopDevice: () => La.is.device(DEVICE.desktop),

		portraitScreen(){

			return window.innerWidth <= window.innerHeight
		},
		landscapeScreen(){

			return window.innerHeight < window.innerWidth
		},

        async incognitoMode(){

            var fs = window.RequestFileSystem || window.webkitRequestFileSystem

            if(!fs) return null
            else{

                return new Promise(resolve => {

                    fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true))
                })
            }
        }
	},


    sort: {

        alphabetically(a, b, caseSensitive = false){

            if(typeof a == 'number') a = a.toString()
            if(typeof b == 'number') b = b.toString()

            if(typeof a != 'string') a = ''
            if(typeof b != 'string') b = ''

            if(!caseSensitive){

                a = a.toLowerCase()
                b = b.toLowerCase()
            }

            if(a && !b) return -1
            else if(!a && b) return 1
            else if(a > b) return 1
            else if(a < b) return -1
            else return 0
        },
        byTime(time_a, time_b, oldToNew = true){

            if(oldToNew) return La.time.parse(time_a) - La.time.parse(time_b)
            else return La.time.parse(time_b) - La.time.parse(time_a)
        }
    } ,


    load: {

        meta(name, content){

			var meta = document.createElement('meta')
			meta.name = name
			meta.content = content

			return document.head.appendChild(meta)
        },
        style(href, version){

			return new Promise((resolve, reject) => {

				let link = document.createElement('link')
				link.rel = 'stylesheet'
				link.href = href+(version ? '?v='+version : '')

				link.onload = () => resolve(link)
				link.onerror = reject

				document.head.appendChild(link)
			})
		},
        script(src, version){

			return new Promise((resolve, reject) => {

				let script = document.createElement('script')
				script.src = src+(version ? '?v='+version : '')

				script.onload = () => resolve(script)
				script.onerror = reject

				document.head.appendChild(script)
			})
		},

        preloadImage(src){

            var img = new Image()
            img.src = src
        }
    },

    make: {

        redCross(size = 'normal'){

            return $('<div>').addClass('red-cross '+size).append(
                $('<div>').addClass('red-cross-line-a'),
                $('<div>').addClass('red-cross-line-b')
            )
        },

        fieldEditor(title, text, onSave = (newValue, fieldEditor)=>{}, type = 'text'){

            let fieldEditor = $('<div>').addClass('field-editor').css({

                marginBottom: 5
            })

            // Title
            $('<p>').addClass('editor-field-title').html(title+':').appendTo(fieldEditor).css({

                fontWeight: 'bold',
                margin: '0 5px 1px 0'
            })
        
            // Input
            let input_div = $('<div>').addClass('editor-field-input-container').appendTo(fieldEditor).css({

                display: 'flex',
                alignItems: 'stretch',

                width: '100%',
            })
            let input = $('<input>').addClass('editor-field-input').appendTo(input_div)
            .prop({type: type, disabled: true})
            .val(text)
            .css({
                width: '100%',

                color: 'inherit',
                backgroundColor: 'transparent',

                padding: '2px 7px',
                border: 'solid 1px grey',
                borderRadius: 5,
                marginRight: 5,

                boxSizing: 'border-box'
            })
        
            // Icons: pencil and save
            let editButtonBackgroundColor = 'black'
            let buttonEdit = $('<div>').addClass('editor-field-button-edit').appendTo(input_div).css({

                    position: 'relative',

                    width: 30,

                    cursor: 'pointer'
            })
            .append(

                $('<div>').css({
    
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-50%) rotate(50deg)',
    
                    display: 'flex',
                    flexDirection: 'column',
    
                    height: '100%',
                    width: 5
                })
                .append(
                    $('<div>').css({
                        width: '100%',
                        height: 4,
    
                        backgroundColor: editButtonBackgroundColor,
                        marginBottom: 1,
                        borderTopLeftRadius: 1,
                        borderTopRightRadius: 1
                    }),
                    $('<div>').css({
                        width: '100%',
                        height: 'calc(100% - 10px)',
    
                        backgroundColor: editButtonBackgroundColor,
                        marginBottom: 1
                    }),
                    $('<div>').css({
                        width: '100%',
    
                        borderLeft: '2px solid transparent',
                        borderRight: '2px solid transparent',
                        borderTop: '4px solid '+editButtonBackgroundColor,
    
                        boxSizing: 'border-box'
                    })
                )
            )

            let buttonSave = $('<div>').addClass('editor-field-button-save').appendTo(input_div).css({

                display: 'none',
                position: 'relative',

                width: 30,

                cursor: 'pointer'
            })
            .append(
                $('<div>').css({
    
                    position: 'absolute',
                    top: '50%',
                    right: '25%',
    
                    height: 'calc(100% - 5px)',
                    width: 4,
    
                    transform: 'translateY(-50%) translateX(-50%) rotate(45deg)',
                    backgroundColor: 'limegreen',
    
                    borderRadius: 5
                }).append(
                    $('<div>').css({
    
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transformOrigin: 'bottom left',
                        transform: 'translateX(calc(-100% + 1px))',
    
    
                        width: '250%',
                        height: 0,
                        paddingTop: '100%',
                        backgroundColor: 'inherit',
    
                        borderRadius: 5
                    })
                )
            )

        
            // Click event listeners
            buttonEdit.click(function(){
        
                fieldEditor.addClass('editing')
        
                input.prop('disabled', false)
                    .focus()
                    .css({
                        backgroundColor: 'white'
                    })
        
                buttonEdit.hide()
                buttonSave.show()
            })
            buttonSave.click(function(){
        
                fieldEditor.removeClass('editing')
        
                input.prop('disabled', true)
                .css({
                    backgroundColor: 'transparent'
                })
        
                buttonSave.hide()
                buttonEdit.show()
        
                La.util.hideMobileKeyboard()
        
                onSave(input.val(), fieldEditor)
            })

            input.keypress(e => { if(e.keyCode == 13){ buttonSave.click(); return false } })
        
            return fieldEditor
        },
        fieldEditorInline(title, text, onSave = (newValue, fieldEditor)=>{}, type = 'text'){

            let fieldEditor = La.make.fieldEditor(title, text, onSave, type)
            
            fieldEditor.css({

                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            })
            fieldEditor.find('.editor-field-input-container').css('width', ['number', 'color'].includes(type) ? '50%' : '100%')
        
            return fieldEditor
        },

        numericInput(){

            return $('<input>')
                .prop({type: 'number', pattern: '\d*', step: 'any'})
                .attr({inputmode: 'decimal'})
        },

        imageLoaderToText(backgroundImage_src = null, onImageLoaded = imageAsText => {}, onRedCrossClick = null){

            // Elements ---

            // Div
            let div = $('<div>').addClass('image-loader-to-text').css({

                position: 'relative',
                display: 'inline-block',

                minWidth: 150,
                minHeight: 100, 

                width: 150,
                height: 100,

                maxWidth: '100%',
                maxHeight: 400,

                border: '1px black solid',
                borderRadius: 3,

                boxSizing: 'border-box',

                textAlign: 'center',

				backgroundColor: 'white',

                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',

                transition: '400ms'
            })

            if(backgroundImage_src) La.set.backgroundImage(div, backgroundImage_src)

            // Button
            let buttonText = {
                add: {en: 'Add image', es: 'Añadir imagen', ca: 'Afegir imatge'},
                change: {en: 'Change image', es: 'Cambiar imagen', ca: 'Canviar imatge'}
            }
            let button = $('<button>').addClass('load-image center-abs-xy fs-12').prop({type: 'button'})
                .text(buttonText[backgroundImage_src ? 'change' : 'add'][typeof LANG != 'undefined' ? LANG : 'en'])
                .appendTo(div).css({

                    color: 'black',
                    backgroundColor: 'white',
                    border: 'solid 1px black',
                    borderRadius: 5

                }).hover(e => $(e.target).css({backgroundColor: 'black', color: 'white'}), e => $(e.target).css({backgroundColor: 'white', color: 'black'}))

            // Red cross
            let redCross
            if(onRedCrossClick){

                redCross = La.make.redCross().addClass('small').appendTo(div).css({
                    
                    position: 'absolute',
                    top: 0,
                    right: 0
                })

                redCross[backgroundImage_src ? 'show' : 'hide']()
            }

            // Input
            let input = $('<input>').prop({type: 'file', accept: 'image/*'}).hide().appendTo(div)

            // Logic ---
            // Input
            input.change(e => {

                const image_file = e.target.files[0]
                const reader = new FileReader()
        
                reader.addEventListener('load', () => {

                    const imageAsText = reader.result

                    // Background, button and red cross
                    La.set.backgroundImage(div, imageAsText)
                    button.text(buttonText.change[typeof LANG != 'undefined' ? LANG : 'en'])
                    if(onRedCrossClick) redCross.fadeIn('fast')

                    onImageLoaded(imageAsText)
                })

                reader.readAsDataURL(image_file)
            })

            // Button
            button.click(() => input.click())

            // Red cross
            if(onRedCrossClick) redCross.click(() => {

                La.set.backgroundImage(div, null)
                button.text(buttonText.add[typeof LANG != 'undefined' ? LANG : 'en'])
                redCross.fadeOut('fast')

                onRedCrossClick()
            })

            return div
        },

		/// set an image droppable
        /// phpSrc: PHP path where to upload the image. If null provided you can see a test preview
        /// options:
        ///     - data: To pass to PHP
        ///         + REQUIRED: "destination_folder"
        ///         + OPTIONAL: "name_prefix" to add a prefix to the image name
        ///     - backgroundImage = null: Background to the image uploader
        ///     - multiple = true
        /// callbacks:
        ///     - imageUploaded(string/array newImage/s (if multiple), div, cross)
        ///     - crossClick(cross, div)
        imageUploader(phpSrc, options, callbacks){

            if (phpSrc && !options?.data?.destination_folder)
                return La.pop.error('options.data.destination_folder is required', 5000)

            options = $.extend({
                data: {},
                backgroundImage: null,
                multiple: true
            }, options)
            options.data['multiple_images'] = options.multiple

            callbacks = $.extend({
                imageUploaded: ()=>{},
                crossClick: ()=>{}
            }, callbacks)


            let div = $('<div>').addClass('image-uploader').css({

                position: 'relative',
                display: 'inline-block',

                minWidth: 150,
                minHeight: 100,

                border: '1px black solid',
                borderRadius: 3,

                boxSizing: 'border-box',

                textAlign: 'center',

				backgroundColor: 'white',

                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            })
            if(options.backgroundImage) div.css('background-image', 'url('+options.backgroundImage+')')

            let input = $('<input>').prop('type', 'file').prop('accept', 'image/*').prop('multiple', options.multiple).hide().appendTo(div)

            let cross = $('<div>').addClass('ico red-cross').appendTo(div).css({

                display: 'none',
                position: 'absolute',
                top: 0,
                right: 0,

                width: 20,

                padding: 5,

                zIndex: 1
            })
            if(options.backgroundImage) cross.show()
            cross.click(() => callbacks.crossClick(cross, div))

            let button = $('<button>').prop('type', 'button').text('Subir '+(options.multiple ? 'imágenes' : 'imagen')).addClass('center-abs-xy').appendTo(div).css({

				color: 'black',
				backgroundColor: 'white',

				width: 150,
				maxWidth: '90%',
				boxSizing: 'border-box',

				fontSize: 16,
				fontWeight: 600,

				margin: 0,
				border: 'solid 1px black',
				padding: 5
			})
            .hover(e => $(e.target).css({backgroundColor: 'black', color: 'white'}), e => $(e.target).css({backgroundColor: 'white', color: 'black'}))

            let loading_text = $('<div>').text(' %').addClass('center-abs-xy p-10').appendTo(div).css({

				color: 'black',
				backgroundColor: 'rgba(255, 255, 255, 0.3)',

                boxSizing: 'border-box',
                width: '100%',

                fontSize: 18,
				fontWeight: 600

            }).hide()
            let percentage_number = $('<span>').text(0).prependTo(loading_text)

            // on files added --------------------------
            function showProgress(e) {

                let progress = La.is.integer(e) ? e : Math.round((e.loaded * 100) / e.total)
                
                // No vull que es quedi a 100% carregant sense haber acabat
                if(progress == 100) progress = 99

				percentage_number.text(progress)
            }
            function uploadFiles(files){
				cross.hide()
				button.hide()
                loading_text.show()

                let formData = new FormData()

                for(let i = 0; i<files.length; i++) formData.append('files[]', files[i])
                formData.append('dataJSON', JSON.stringify(options.data))

                $.ajax({

                    type: 'POST',
                    url: phpSrc,
                    xhr: function () {

                        var xhr = $.ajaxSettings.xhr()

                        if(xhr.upload) xhr.upload.addEventListener('progress', showProgress, false)

                        return xhr
                    },
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: formData

                })
				.done(function(res){

                    if(!La.parse.maybeError(res)){

						if(options.backgroundImage) cross.show()
                        button.show()
                        loading_text.hide()

						const new_images = La.parse.maybeJSON(res)

                        callbacks.imageUploaded(options.multiple ? new_images : new_images[0], div, cross)
                    }

                }).fail(La.parse.fail)
            }

            // set events ----------------------
            if(phpSrc) button.click(() => input.click())
			else button.click(() => {

				if(parseInt(percentage_number.text()) < 100){

					cross.hide()
					button.hide()
					loading_text.show()
					div.css('background-image', 'none')

					showProgress(parseInt(percentage_number.text())+10)

					setTimeout(() => button.click(), 500)
				}
				else{

					showProgress(0)

					cross.show()
					loading_text.hide()
					button.show()
					div.css('background-image', 'initial')
				}
			})

            input.change(e => uploadFiles(e.target.files))


            return div
        },

		// set running marquee, speed in px/s, startLeftPercentage is where the first label will start on width percentage from left, separation is separation between each label
		marquee(text, speed = 100, startLeftPercentage = 50, separation = 50){

			let marquee_holder = $('<div>').addClass('marquee-holder').css({

				position: 'relative',
				width: '100%',
				overflowX: 'hidden'
			})

			let fakeText = $('<p>').addClass('fake-marquee-text m-0').html(text).appendTo(marquee_holder).css({


				display: 'inline-block',
				visibility: 'hidden',
				whiteSpace: 'nowrap'
			})

			function createMarquee(begin, textWidth){

				const distance = textWidth + begin

				let marquee = $('<p>').addClass('marquee-text').html(text).appendTo(marquee_holder).css({

					position: 'absolute',
					display: 'inline-block',
					top: 0,
					left: begin,
					margin: 0,
					whiteSpace: 'nowrap'
				})
				marquee.animate({left: -textWidth}, (distance/speed)*1000, 'linear', () => marquee.remove())

				return marquee
			}

			function onHolderAddedToDOM(){

				const textWidth = fakeText.outerWidth(true),
					  holderWidth = marquee_holder.outerWidth(true),
					  firstStartDistance = holderWidth*(startLeftPercentage/100)

				createMarquee(firstStartDistance, textWidth)

				const timeToStartRegularMarquees = (textWidth + separation - (holderWidth - firstStartDistance))/speed
				setTimeout(() => {

					createMarquee(holderWidth, textWidth)

					const respawnTime = (textWidth + separation)/speed
					setInterval(() => createMarquee(holderWidth, textWidth), respawnTime*1000)

				}, timeToStartRegularMarquees*1000)
			}

			var observer = new MutationObserver(mutations => {

				if (document.contains(marquee_holder.get(0))) {

					onHolderAddedToDOM()

					observer.disconnect()
				}
			})
			observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});


			return marquee_holder
		},

        burgerMenu(onOpen = ()=>{}, onClose = ()=>{}){

            let burger = $('<div>').addClass('burger-menu burger-shape closed').append(
                $('<div>').addClass('line top'),
                $('<div>').addClass('line middle'),
                $('<div>').addClass('line bottom')
            )

            burger.click(e => {

                e.stopPropagation()

                if(burger.hasClass('burger-shape')){

                    burger.removeClass('burger-shape closed')
                        .addClass('cross-shape opened')

                    onOpen(burger)
                }
                else{

                    burger.removeClass('cross-shape opened')
                        .addClass('burger-shape closed')
                    
                    onClose(burger)
                }
            })
            document.onclick = e => {

                if(!e.isTrusted) return

                if(burger.hasClass('cross-shape')) burger.click()
            }

            return burger
        }
    },

    pop: {

		// position can be TOP or BOTTOM
        text(txt, type = 'info', duration = 2000, position = 'BOTTOM') {

			if(position != 'TOP' && position != 'BOTTOM') position = 'BOTTOM'

            var div = $('<div>').addClass('pop-msg ' + type).appendTo($('body')).css({

                position: 'fixed',
				display: 'inline-table',

                [position.toLowerCase()]: 0,
				maxWidth: '90vw',
                left: '50%',
                transform: 'translateX(-50%)',
                
                padding: '10px 15px',
                border: 0,
                borderRadius: '5px',
                margin: 0,
                
                opacity: 0,
                zIndex: 9
            })
            var text_p = $('<p>').html(txt).addClass('pop-msg-text').appendTo(div).css({

                margin: 0,
                textAlign: 'center'
            })

			div.css({

				color: type == 'success' ? 'white' : 'black',
				backgroundColor: 
                    type == 'success' ? 'limegreen' 
                    : type == 'warning' ? 'yellow' 
                    : type == 'error' ? 'red' 
                    : 'white'
			})

            div.animate({

                [position.toLowerCase()]: position == 'BOTTOM' ? '10vh' : '7vh',
                opacity: 1

            }, () => setTimeout(() => {

                div.animate({opacity: 0}, 'fast', () => div.remove())

            }, duration))

			return div
        },
        succees: (txt, duration = 2000, position = 'BOTTOM') => La.pop.text(txt, 'succees', duration, position),
        warning: (txt, duration = 3000, position = 'BOTTOM') => La.pop.text(txt, 'warning', duration, position),
        error: (txt, duration = 4000, position = 'BOTTOM') => La.pop.text(txt, 'error', duration, position),

        popUp(title, content, button_text, okButton_callback, closeback){

            let popUpHolder = $('<div>').addClass('pop-up-holder pop-up').appendTo('body').fadeIn()
        
            let popUp = $('<div>').addClass('pop-up-container pop-up').appendTo(popUpHolder)
        
            if(closeback !== null && closeback !== false){

                La.make.redCross().appendTo(popUp).click(async function(e){
        
                    if(!closeback) popUpHolder.fadeOut(() => popUpHolder.remove())
                    else{
            
                        const res = await closeback(e)
                        if(!(res === null || res === false)) popUpHolder.fadeOut(() => popUpHolder.remove())
                    }
                })
            }
        
            let title_p = $('<p>').addClass('title').html(title).appendTo(popUp)
            $('<div>').addClass('content').html(content).appendTo(popUp)
        
            if(button_text){
        
                let button = $('<div>').prop('type', 'button').addClass('ok-button-container').appendTo(popUp)
                $('<button>').addClass('ok-button').text(button_text).appendTo(button).click(async function(e){
        
                    if(!okButton_callback) popUpHolder.fadeOut(() => popUpHolder.remove())
                    else{
        
                        const res = await okButton_callback(e)
                        if(!(res === null || res === false)) popUpHolder.fadeOut(() => popUpHolder.remove())
                    }
                })
            }
        
            popUp['setTitle'] = (newTitle) => title_p.html(newTitle)
            popUpHolder['close'] = () => popUpHolder.fadeOut(() => popUpHolder.remove())
        
            return popUpHolder
        },

        loading(title = 'Loading', closeback = null){

            let div = $('<div>').append(
                $('<div>').addClass('loading-spinner big-3 rotate').css({
                    display: 'inline-block',
                    width: 27,
                    height: 27,
                    backgroundColor: 'black',
                    borderRadius: 5
                })
            )
        
            let popUp = La.set.popUp(title, div, null, null, closeback).addClass('loading')

            // New progress bar method
            popUp['newProgressBar'] = (name, color = 'teal') => {

                div.find('.loading-spinner').remove()

                // Create div
                let progresBar_div = $('<div>').addClass('progress-bar-cont mb-10').appendTo(div).append(
                    // Count and name
                    $('<div>').addClass('d-flex mb-4').append(
                        $('<div>').addClass('count-cont').hide().append(
                            $('<p>').addClass('between-claudators mr-5').append(
                                $('<span>').addClass('count'),
                                $('<span>').text('/'),
                                $('<span>').addClass('total')
                            )
                        ),
                        $('<p>').addClass('name').css({fontWeight: 600}).text(name)
                    ),
                    // Bar
                    $('<div>').addClass('progress-bar-outer mr-5').append(
                        $('<div>').addClass('progress-bar'),
                        $('<p>').addClass('percentage-cont').append(
                            $('<span>').addClass('percentage').text(0),
                            $('<span>').text('%')
                        )
                    )
                )
                progresBar_div.find('.progress-bar-outer').css({
                    position: 'relative',
                    width: '100%',
                    backgroundColor: 'darkgrey',
                    borderRadius: 5,
                    overflow: 'hidden',
                    textAlign: 'center'
                })
                progresBar_div.find('.progress-bar').css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 0,
                    backgroundColor: color
                })
                progresBar_div.find('.percentage-cont').css({
                    position: 'relative',
                    zIndex: 1,
                    padding: '3px 0 1px'
                })

                // Set progress method
                progresBar_div['setProgress'] = (percentage) => {

                    progresBar_div.find('.progress-bar').width(percentage+'%')
                    progresBar_div.find('.percentage-cont .percentage').text(Math.round(percentage))

                    if(percentage == 100) {

                        progresBar_div.find('.progress-bar').css({backgroundColor: 'limegreen'})
                        progresBar_div.find('.percentage-cont').css({fontWeight: 'bold'})
                    }
                    else if(percentage != 0 && !percentage) console.warn('Percentage is not defined: ('+percentage+')', popUp)
                    else if(percentage < 0) console.warn('Percentage under 0, percentage at ('+percentage+'%)', popUp)
                    else if(percentage > 100) console.warn('Percentage over 100, percentage at ('+percentage+'%)', popUp)

                    return progresBar_div
                }
                // Set count method
                progresBar_div['setCount'] = (count, total = null) => {

                    progresBar_div.find('.count-cont').show()

                    progresBar_div.find('.count').text(count)
                    if(total !== null) progresBar_div.find('.total').text(total)

                    let percentage = count == parseFloat(progresBar_div.find('.total').text()) ? 100 
                        : count / parseFloat(progresBar_div.find('.total').text()) * 100
                    progresBar_div.setProgress(percentage)

                    return progresBar_div
                }

                return progresBar_div
            }

            popUp['done'] = () => {

                div.find('.loading-spinner').remove()
                $('<p>').text('✅').addClass('fs-40').appendTo(div)
            }
        
            return popUp
        }
    },

    parse: {

        inputsToJSON(container) {

            var json_obj = {}

            $(container).find('input, textarea, select').each((index, el) => {

                const name = el.name
                let value
                
                if(el.type == 'checkbox') value = el.checked
                else if(el.type == 'radio') {

                    value = $(container).find('input[type=radio][name='+name+']:checked').val()
                }
                else if(el.type == 'number') {

                    value = parseFloat($(el).val()) || null
                }
                else value = $(el).val()

                json_obj[name] = value
			})

            return json_obj
        },

        maybeJSON(maybeJSON) {

            try {

                return JSON.parse(maybeJSON)
            }
			catch(e) {

                return maybeJSON
            }
        },

        maybeError(maybeError, callback) {

            if (La.parse.maybeJSON(maybeError) && typeof La.parse.maybeJSON(maybeError) == 'object' && La.parse.maybeJSON(maybeError).status == 'ERROR') {

                const error = La.parse.maybeJSON(maybeError)

                console.error('ERROR '+error.code +': '+error.text)
                
                if(callback) callback(error)
                else La.pop.text(error.text, 'error', 5000)

                return true

            } else return false
        },

        fail(jqxhr, textStatus, error) {

            if(jqxhr.status == 555) console.log(La.parse.maybeJSON(error)) //echo debug
            else{

                console.error(jqxhr.status+' '+textStatus+': '+error)

                La.pop.text(textStatus+': '+error, 'error')
            }
        },

		/*
            - element: is a css selector or element.
            - json: is a JSON object.
            - attributes: is attr to parse or array of attr (placeholder or ph attr stands for placeholder).
            - lang: is the lang to look foor in keys of the json.
            [If you attach {attributeName_apply} attr to the elements, that value will be applied as a function to text]
        */
        htmlWithJSON(element, json, attributes, lang){

            if(Array.isArray(attributes)) attributes.forEach(attr => La.parse.htmlWithJSON(element, json, attr, lang))
            else $(element).find('['+attributes+']').each((i, el) => {

                const attr = attributes,
                        key = $(el).attr(attr),
                        applications = $(el).attr(attr+'_apply')?.split(' ') || []

                let textObject = La.get.objectFromJson(json, key, obj => typeof obj == 'string' || typeof obj == 'number' || (obj && obj.hasOwnProperty(lang)))

                if(textObject){

                    let text = (typeof textObject == 'string' || typeof textObject == 'number') ? textObject : textObject[lang]

                    if(text){

                        applications.forEach(method => { 

                            if(typeof text[method] != typeof undefined) text = text[method]()
                            else console.warn('Can not apply method: "'+method+'" to text: "'+text+'" for key: "'+key+'" it does not exist')
                        })

                        if(attr == 'placeholder' || attr == 'ph') $(el).prop('placeholder', text)
                        else $(el).html(text)
                    }
                    else console.warn('"'+key+'" key for attribute "'+attr+'" for', element, ' has not the lang "'+lang+'" in', json)
                }
                else console.warn('"'+key+'" key for attribute "'+attr+'" not found for', element, 'in', json)
            })
        }
    },

    
    time: {

        utcTimestamp(){

            var now = new Date();

            return now.getUTCFullYear()+'-'+now.getUTCMonth()+'-'+now.getUTCDate()
                +' '+now.getUTCHours()+':'+now.getUTCMinutes()+':'+now.getUTCSeconds()
                +' UTC'
        },

        // ⚠️ Caution [string '2000' = 2000-01-01], [int 2000 = 1970-01-01 00:00:02 (2000 milliseconds after 0 unix time)]
        parse(date, format = null, lang = 'en'){

            if(date === null || date === undefined) return undefined
            else if(!La.is.date(date)) { // Si es string o numeric

                if(typeof date == 'string'){

                    // Trim
                    date = date.trim()

                    // Replace '/' -> '-'
                    if(date.toString().includes('/')) date = date.toString().replaceAll('/', '-')

                    // Add maybe missing leading zeroes [1970-1-2]
                    let datePieces = date.split(' ')

                    datePieces[0] = datePieces[0].split('-').map(dp => {

                        if(dp.length == 1 && Number.isInteger(parseFloat(dp))) return La.util.addLeadingZero(dp)
                        else return dp

                    }).join('-')

                    date = datePieces.join(' ')
                }

                let newDate = new Date(date)

                // Check if is an hour
                if(!La.is.date(newDate)) {

                    const isAnHour = [2, 3].includes(date.split(':').length)
                        && date.split(':').every((timePiece, index) => {

                            const isHourPiece = timePiece.length <= 2 && Number.isInteger(parseInt(timePiece)),
                                inRange = 0 <= timePiece && timePiece <= (index == 0 ? 23 : 59)

                            return isHourPiece && inRange
                        })

                    if(isAnHour) newDate = new Date('1970-01-01 '+date)
                }
                
                if(La.is.date(newDate)) date = newDate
                else throw Error('Not recognizable string date: '+date)
            }

            return format 
                ? La.time.format(date, format, lang)
                : date
        },
        format(date, formatOut, lang = (typeof LANG != 'undefined' ? LANG : 'en')){

            date = La.time.parse(date)

            if(formatOut.length == 1){

                switch (formatOut) {
                    case TIMEFORMAT.milliseconds: return date.getTime()
                    case TIMEFORMAT.unix_time:    return Math.floor(date.getTime()/1000)
                    case TIMEFORMAT.seconds:      return La.util.addLeadingZero(date.getSeconds())
                    case TIMEFORMAT.minutes:      return La.util.addLeadingZero(date.getMinutes())
                    case TIMEFORMAT.hours:        return La.util.addLeadingZero(date.getHours() > 12 ? La.time.add(date, -12, 'h').getHours() : date.getHours())
                    case TIMEFORMAT.hour_24:      return La.util.addLeadingZero(date.getHours())
                    case TIMEFORMAT.days:         return La.util.addLeadingZero(date.getDate())
                    case TIMEFORMAT.day_name_short: return date.toLocaleString(lang, { weekday: 'short' }).toLowerCase()
                    case TIMEFORMAT.day_name:     return date.toLocaleString(lang, { weekday: 'long' }).toLowerCase()
                    case TIMEFORMAT.week_day_starting_monday: return date.getDay() == 0 ? 6 : date.getDay() -1
                    case TIMEFORMAT.months:       return La.util.addLeadingZero(parseInt(date.getMonth())+1)
                    case TIMEFORMAT.month_name_short: return date.toLocaleString(lang, { month: 'short' }).toLowerCase()
                    case TIMEFORMAT.month_name:   return date.toLocaleString(lang, { month: 'long' }).toLowerCase()
                    case TIMEFORMAT.years:        return date.getFullYear().toString()
                    default:                      return formatOut
                }

                //* if(display === null) throw Error('Unknown element in format parse date ['+format+']', 'error')
            }
            else{

                return formatOut.split('')
                    .map(char => La.time.format(date, char, lang))
                    .join('')
            }
        },

        add(date, timeToAdd, formatIn, formatOut = null, lang = (typeof LANG != 'undefined' ? LANG : 'en')){

			if(formatIn == TIMEFORMAT.milliseconds) return La.time.parse(La.time.parse(date).getTime() + timeToAdd, formatOut, lang)
            else if(formatIn == TIMEFORMAT.seconds) return La.time.add(date, timeToAdd * 1000, TIMEFORMAT.milliseconds, formatOut, lang)
            else if(formatIn == TIMEFORMAT.minutes) return La.time.add(date, timeToAdd * 60, TIMEFORMAT.seconds, formatOut, lang)
            else if(formatIn == TIMEFORMAT.hours) return La.time.add(date, timeToAdd * 60, TIMEFORMAT.minutes, formatOut, lang)
            else if(formatIn == TIMEFORMAT.days) return La.time.add(date, timeToAdd * 24, TIMEFORMAT.hours, formatOut, lang)
            else if(formatIn == TIMEFORMAT.weeks) return La.time.add(date, timeToAdd * 7, TIMEFORMAT.days, formatOut, lang)
            else if(formatIn == TIMEFORMAT.months){

                date = La.time.parse(date)

                let newTime = date.setMonth(date.getMonth() +timeToAdd)
        
                return La.time.parse(newTime, formatOut, lang)
            }
            else if(formatIn == TIMEFORMAT.years) return La.time.add(date, timeToAdd * 365, TIMEFORMAT.days, formatOut, lang)
            else throw Error('Unknown format for date_addition ['+formatIn+']')
        },
        addMillis: (date, millis, formatOut = null, lang = null) => La.time.add(date, millis, TIMEFORMAT.milliseconds, formatOut, lang),
        addSeconds: (date, seconds, formatOut = null, lang = null) => La.time.add(date, seconds, TIMEFORMAT.seconds, formatOut, lang),
        addMinutes: (date, minutes, formatOut = null, lang = null) => La.time.add(date, minutes, TIMEFORMAT.minutes, formatOut, lang),
        addHours: (date, hours, formatOut = null, lang = null) => La.time.add(date, hours, TIMEFORMAT.hours, formatOut, lang),
        addDays: (date, days, formatOut = null, lang = null) => La.time.add(date, days, TIMEFORMAT.days, formatOut, lang),
        addWeeks: (date, weeks, formatOut = null, lang = null) => La.time.add(date, weeks, TIMEFORMAT.weeks, formatOut, lang),
        addMonths: (date, months, formatOut = null, lang = null) => La.time.add(date, months, TIMEFORMAT.months, formatOut, lang),
        addYears: (date, years, formatOut = null, lang = null) => La.time.add(date, years, TIMEFORMAT.years, formatOut, lang),

        hasPast(date, addTime = 0, formatIn = TIMEFORMAT.milliseconds){

            let timeToCheck = La.time.parse(date).getTime() + La.time.toMillis(addTime, formatIn)

            return timeToCheck < Date.now()
        },

        getLocalTimezone_string(date = Date.now()){

            date = La.time.parse(date)

            return date.toString().split(' ').find(p => p.includes('GMT')).replace('GMT', 'UTC')
        },
        getDatetimeWithLocalTimezone_string(date = Date.now()){

            date = La.time.parse(date)

            const dateTime_string = La.time.format(date, TIMEFORMAT.timestamp),
                timeZone_string = La.time.getLocalTimezone_string(date)

            return dateTime_string+' '+timeZone_string
        },
        getOffsetFromUTC(){

            let offset_minutes = (new Date()).getTimezoneOffset()

            return La.time.toMillis(offset_minutes, TIMEFORMAT.minutes)
        },


        getStartTime: (date, formatIn, addOffsetFromUTC = true) => {

            let dateString

            if(formatIn == TIMEFORMAT.days) dateString = La.time.parse(date, 'Y-m-d')
            else if(formatIn == TIMEFORMAT.weeks){

                let weekDay = La.time.parse(date, TIMEFORMAT.week_day_starting_monday)

                dateString = La.time.addDays(date, -weekDay, 'Y-m-d')
            }
            else if(formatIn == TIMEFORMAT.months) dateString = La.time.parse(date, 'Y-m')
            else if(formatIn == TIMEFORMAT.years) dateString = La.time.parse(date, 'Y')

            let startTime = La.time.parse(dateString.toString()).getTime()
            if(addOffsetFromUTC) startTime += La.time.getOffsetFromUTC()

            return startTime
        },

        equalDay: (date_a, date_b) => La.time.format(date_a, 'Y-m-d') == La.time.format(date_b, 'Y-m-d'),
        equalWeek: (date_a, date_b) => {

            let weekDay_a = La.time.parse(date_a, TIMEFORMAT.week_day_starting_monday)
            let stringDateStartingWeek_a = La.time.addDays(date_a, -weekDay_a, 'Y-m-d'),
                stringDateStartingNextWeek_a = La.time.addDays(date_a, 7 -weekDay_a, 'Y-m-d')
            
            let timeStartingWeek_a = La.time.parse(stringDateStartingWeek_a).getTime(),
                timeStartingNextWeek_a = La.time.parse(stringDateStartingNextWeek_a).getTime()

            let time_b = La.time.parse(date_b).getTime()

            return timeStartingWeek_a <= time_b && time_b < timeStartingNextWeek_a
        },
        equalMonth: (date_a, date_b) => La.time.format(date_a, 'Y-m') == La.time.format(date_b, 'Y-m'),
        equalYear: (date_a, date_b) => La.time.format(date_a, 'Y') == La.time.format(date_b, 'Y'),
        equal: (timeFormat, date_a, date_b) => {

            if(timeFormat == TIMEFORMAT.days) return La.time.equalDay(date_a, date_b)
            else if(timeFormat == TIMEFORMAT.weeks) return La.time.equalWeek(date_a, date_b)
            else if(timeFormat == TIMEFORMAT.months) return La.time.equalMonth(date_a, date_b)
            else if(timeFormat == TIMEFORMAT.years) return La.time.equalYear(date_a, date_b)
            else throw Error('Time format "'+timeFormat+'" not valid for La.time.equal')
        },

        toUnixTime: (date) => Math.floor(La.time.parse(date).getTime() / 1000),

        toMillis: (time, formatIn) => La.time.add(0, time, formatIn).getTime(),
        toSeconds: (time, formatIn) => La.time.toMillis(time, formatIn) / 1000,
        toMinutes: (time, formatIn) => La.time.toSeconds(time, formatIn) / 60,
        toHours: (time, formatIn) => La.time.toMinutes(time, formatIn) / 60,
        toDays: (time, formatIn) => La.time.toHours(time, formatIn) / 24,
        toWeeks: (time, formatIn) => La.time.toDays(time, formatIn) / 7,
        toYears: (time, formatIn) => La.time.toDays(time, formatIn) / 365,

        unix: () => La.time.toUnixTime(Date.now())
    },

	storage: {

		_expirationTimesName: '_la_expiration_times_',

		exists(key){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage._expirationTimesName)) || {}

			if(Object.keys(localStorage).includes(key) && (!expirationTimes[key] || Date.now() < expirationTimes[key])) return true
			else{

				La.storage.remove(key)

				return false
			}
		},
		get(key){

			if(La.storage.exists(key)) return La.parse.maybeJSON(localStorage.getItem(key))
		},
		set(key, value, expiration = undefined){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage._expirationTimesName)) || {}

			if(expiration) expirationTimes[key] = Number.isInteger(expiration) ? Date.now() + expiration : La.time.parse(expiration).getTime()
			else if(expiration === null && expirationTimes[key]) delete expirationTimes[key]

			if(!expiration || Date.now() < expirationTimes[key]){

				localStorage.setItem(key, JSON.stringify(value))
				localStorage.setItem(La.storage._expirationTimesName, JSON.stringify(expirationTimes))

				return value
			}
		},
		remove(key){

			localStorage.removeItem(key)

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage._expirationTimesName)) || {}

			if(expirationTimes[key]){

				delete expirationTimes[key]
				localStorage.setItem(La.storage._expirationTimesName, JSON.stringify(expirationTimes))
			}
		},
		list(){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage._expirationTimesName)) || {}

			Object.keys(localStorage).filter(key => La.storage.exists(key)).forEach(key => {

				if(Object.keys(expirationTimes).includes(key)) console.log('%c'+key+': %c['+La.time.parse(expirationTimes[key], TIMEFORMAT.timestamp)+']', 'font-weight: bold; font-size: 12px', 'color: red', La.storage.get(key))
				else console.log('%c'+key+':', 'font-weight: bold; font-size: 12px', La.storage.get(key))
			})
		},
        refresh(){

            let expirationTimes = JSON.parse(localStorage.getItem(La.storage._expirationTimesName)) || {}

            Object.keys(expirationTimes).forEach(key => {

                if(expirationTimes[key] < Date.now()) La.storage.remove(key)
            })
        },
		clear: () => localStorage.clear()
	},


    util: {

		smoothScrollTo(top_or_element, element_to_scroll = 'html'){

			const top = La.is.integer(top_or_element) ? parseInt(top_or_element) : ($(top_or_element).offset().top -window.innerHeight/3)

			return new Promise(resolve => $(element_to_scroll).animate({scrollTop: top}, () => resolve(top_or_element)))
        },

        hideMobileKeyboard(){

            if(La.get.device() == 'MOBILE') $(':focus').blur()
        },

        disableInputChars(charsToDisable, selector = 'body'){

            $(document).on('input', selector+' input:not([type=file]), '+selector+' textarea', function(e){

                const str = $(this).val()

                charsToDisable.forEach(function(char){

                    if(str.includes(char)){

                        $(this).val(str.split(char).join(''))
                        La.pop.text('El caracter '+char+' no está permitido', 'error')
                    }
                }.bind(this))
            })
        },

		sleep(time = 1000, returnValue = null){

			return new Promise(resolve => {

                setTimeout(() => resolve(returnValue), time)
            })
		},

        timeout(time, action, returnValue = false){

            return Promise.race([
                action(),
                La.util.sleep(time).then(() => returnValue)
            ])
        },

		blink(element, color, bgColor, duration = 1000, loop = false){

			let prevColor = $(element).css('color'),
				prevBgColor = $(element).css('background-color'),
				prevTransition = $(element).css('transition')

			let cssToSet = { transition: (duration/1000/2)+'s' }
			if(color) cssToSet['color'] = color
			if(bgColor) cssToSet['backgroundColor'] = bgColor
			if(loop === true) loop = duration+1000

			$(element).css(cssToSet)
			setTimeout(() => $(element).css({color: prevColor, backgroundColor: prevBgColor}), duration/2)
			setTimeout(() => $(element).css({transition: prevTransition}), duration)

			if(loop) $(element).attr('id_blink_interval', setInterval(() => this.blink(element, color, bgColor, duration, false), loop))

			return $(element)
		},
        stopBlinking(element){

            clearInterval($(element).attr('id_blink_interval'))

            return $(element)
        },

		count(timeOnPage = false){

			if(timeOnPage) setInterval(() => console.log(La.get.timeOnPage()), 1000)
			else{

				let count = 0
				setInterval(() => console.log(count++), 1000)
			}
		},

        addLeadingZero(number){

            return number > 9 ? number : '0'+number
        },

        // If width exists and height is undefined, width will resize to keep aspect ratio (same with height). If want to resize width, give null to height (same with height)
        async modifyImageB64(imgB64, width, height, quality = 1, extension = null){

            if(imgB64.slice(0, 10) != 'data:image') imgB64 = 'data:image/'+(extension || 'jpeg')+';base64,'+imgB64
            if(!extension) extension = imgB64.split(';')[0].split('/')[1]

            let img = new Image()

            let newImgPromiseResolve
            let newImgPromise = new Promise(resolve => { newImgPromiseResolve = resolve })

            // Once the image is loaded, manipulate it
            img.onload = function() {

                const imgAspectRatio = img.width / img.height

                // Create a canvas element
                let canvas = document.createElement('canvas')
                let ctx = canvas.getContext('2d')

                // Set canvas dimensions to match the image
                if(width === undefined && height) canvas.width = height * imgAspectRatio
                else canvas.width = width || img.width

                if(height === undefined && width) canvas.height = width / imgAspectRatio
                else canvas.height = height || img.height

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                // Convert canvas content to Base64
                let newDataUrl = canvas.toDataURL('image/'+extension, quality)

                // newDataUrl contains the Base64 encoded image with reduced quality
                newImgPromiseResolve(newDataUrl)
            }

            img.src = imgB64

            return newImgPromise
        },
        async resizeImageB64(imgB64, maxSizeMb, reduceQuality = false, loadingCallback = (percentage, currentSizeMb) => {}){

            let originalOrBiggerSizeMb = La.get.megabytesFromLength(imgB64)

            let newImgB64 = imgB64,
                sizeMb = La.get.megabytesFromLength(newImgB64),
                width = (await La.get.imageSizes(imgB64)).width,
                quality = 1

            let i = 100
            while(i > 0 && maxSizeMb < sizeMb) {

                if(reduceQuality) {

                    quality -= 0.05

                    newImgB64 = await La.util.modifyImageB64(newImgB64, undefined, undefined, quality)
                }
                else {

                    width *= 0.95

                    newImgB64 = await La.util.modifyImageB64(newImgB64, width)
                }

                sizeMb = La.get.megabytesFromLength(newImgB64)
                originalOrBiggerSizeMb = Math.max(sizeMb, originalOrBiggerSizeMb)

                let percentage = (sizeMb - originalOrBiggerSizeMb) / (maxSizeMb - originalOrBiggerSizeMb) * 100
                loadingCallback(Math.min(100, percentage), sizeMb)

                i--
            }

            return newImgB64
        },

        onEventAndNow(eventName, action, element = document, paramToPassActionNow = null){

            $(element).on(eventName, action)
            action(paramToPassActionNow)
        },
        oneTimeEventAndNow(eventName, action, element = document, paramToPassActionNow = null){

            $(element).one(eventName, action)
            action(paramToPassActionNow)
        },

        checkEmptyRequiredFields(element) {
            let fields = La.parse.inputsToJSON(element)

            // Foreach field
            Object.keys(fields).forEach(fieldName => {
                const value = fields[fieldName]
                let field_el = $(element).find('[name="'+fieldName+'"]')

                // If non 0 and no value and was required
                if(value !== 0 && !value && field_el.is(':required')) {
                    La.util.blink(field_el, 'black', 'red')
                    La.pop.error('Field "<b>'+fieldName+'</b>" is required')
                    
                    throw new Error('Field '+fieldName+' is required')
                }
            })

            return fields
        }
    }
}


// CONSTS ---------------------------------------
const cl = console.log,
    EURO_CHAR = '€',
	TIMESTAMP = 'Y-m-d H:i:s',
    HTTP_STATUS_CODES = {

        // 1xx informational response
		100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',

        // 2xx success
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        207: 'Multi-status',
        208: 'Already Reported',

        // 3xx redirection
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: 'Switch Proxy',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',

        // 4xx client errors
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Time-out',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Large',
        415: 'Unsupported Media Type',
        416: 'Requested range not satisfiable',
        417: 'Expectation Failed',
        418: 'I\'m a teapot',
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        425: 'Unordered Collection',
        426: 'Upgrade Required',
        428: 'Precondition Required',
        429: 'Too Many Requests',
        431: 'Request Header Fields Too Large',
        451: 'Unavailable For Legal Reasons',

        // 5xx server errors
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Time-out',
        505: 'HTTP Version not supported',
        506: 'Variant Also Negotiates',
        507: 'Insufficient Storage',
        508: 'Loop Detected',
        510: 'Not Extended',
        511: 'Network Authentication Required'
	}

// ENUMS ----------------------------------------
const TIMEFORMAT = {

    timestamp: 'Y-m-d H:i:s',
    UTC_timestamp: 'UTC_TIMESTAMP',
    input_datetimeLocal: 'Y-m-dTh:i',
	unix_time: 'U',

	milliseconds: 'v',
	seconds: 's',
	minutes: 'i',
	hours: 'h',
	hour_24: 'H',
	days: 'd',
	day_name_short: 'C',
	day_name: 'D',
	weeks: 'w',
    week_day_starting_monday: 'W',
	months: 'm',
    month_name_short: 'N',
	month_name: 'M',
	years: 'Y'
},
    DEVICE = {

        mobile: 'MOBILE',
        tablet: 'TABLET',
        desktop: 'DESKTOP'
    }


// JavaScript prototype extend ------------------
// Number ---
Number.prototype['round'] = function(decimals = 0){

    const factor = Math.pow(10, decimals)

    return Math.round(this * factor) / factor
}

Number.prototype['prettyPrice'] = function(){

	let price = parseFloat(Math.round(this*100)/100)

	if(Number.isNaN(price)) return NaN
	else return Number.isInteger(price) ? price.toString() : price.toFixed(2)
}

// String ---
String.prototype['round'] = Number.prototype.round
String.prototype['prettyPrice'] = Number.prototype.prettyPrice

String.prototype['upperCaseFirst'] = function(){

	if(this.length) return this[0].toUpperCase() + this.toString().slice(1)
	else return ''
}
String.prototype['prettyUpperCase'] = function(minLengthToUpper = 4){

	if(this.length) return this.toLowerCase().upperCaseFirst().split(' ').map(w => w.length >= minLengthToUpper ? w.upperCaseFirst() : w).join(' ')
	else return ''
}

// Array ---
Array.prototype['shuffle'] = function() {

    let currentIndex = this.length, randomIndex
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      // And swap it with the current element.
      [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]]
    }
  
    return this
}

Array.prototype['removeDuplicates'] = function(predicate = el => el) {

    return this.filter((element_a, index_a) => {

        return index_a == this.findIndex(element_b => {

            return predicate(element_a) == predicate(element_b)
        })
    })
}
Array.prototype['removeIndex'] = function(index){

    if(index === null || index === undefined) throw Error('index is missing!')

    this.splice(index, 1)

    return this
}
Array.prototype['removeOne'] = function(predicate){

    if(!predicate) throw Error('predicate function is missing!')

    this.removeIndex(this.findIndex(predicate))

    return this
}
Array.prototype['removeAll'] = function(predicate){

    if(!predicate) throw Error('predicate function is missing!')

    while(this.find(predicate)) this.removeOne(predicate)

    return this
}

Array.prototype['swap'] = function(predicate_a, predicate_b){

    if(!predicate_a) throw Error('predicate_a function is missing!')
    if(!predicate_b) throw Error('predicate_b function is missing!')

    let index_a = this.findIndex(predicate_a)
    if(index_a == -1) throw Error('Element a not found')
    
    let index_b = this.findIndex(predicate_b)
    if(index_b == -1) throw Error('Element b not found')

    let tmp_a = this[index_a]
    this[index_a] = this[index_b]
    this[index_b] = tmp_a

    return this
}
Array.prototype['swapIndex'] = function(index_a, index_b){

    if(index_a === null || index_a === undefined) throw Error('index_a is missing!')
    if(index_b === null || index_b === undefined) throw Error('index_b is missing!')

    if(!(0 <= index_a && index_a < this.length)) throw Error('index_a is out of bounds')
    if(!(0 <= index_b && index_b < this.length)) throw Error('index_b is out of bounds')

    let tmp_a = this[index_a]
    this[index_a] = this[index_b]
    this[index_b] = tmp_a

    return this
}

Array.prototype['groupBy'] = function(getKeyCallback){

    if(typeof getKeyCallback != 'function') throw Error('Parameter "getKeyCallback" must be of type "function"')

    let groups = {}

    this.forEach(element => {

        let key = getKeyCallback(element)

        if(!groups[key]) groups[key] = []

        groups[key].push(element)
    })

    return groups
}

Array.prototype['sum'] = function(callbackfn = item => item, initialValue = 0){

    return this.reduce((total, item) => {

        total += parseFloat(callbackfn(item))

        return total

    }, initialValue)
}
Array.prototype['max'] = function(predicate = el => el){

    let maxValue = -Infinity
    let maxElement = null

    this.forEach(el => {
        var value = predicate(el)

        if(value > maxValue) {
            maxValue = value
            maxElement = el
        }
    })

    return maxElement
}
Array.prototype['min'] = function(predicate = el => el){

    let minValue = Infinity
    let minElement = null

    this.forEach(el => {
        var value = predicate(el)

        if(value < minValue) {
            minValue = value
            minElement = el
        }
    })

    return minElement
}

// Prototype override ---------------------------
String.prototype['replaceAll'] = function(search, replace){

    return this.split(search).join(replace)
}


// JQuery Extend --------------------------------
$.prototype['enable'] = function(timeToDisableAgain = null){

    this.prop('disabled', false)

    if(timeToDisableAgain) {
        
        setTimeout(() => $(this).disable(), timeToDisableAgain)
    }

    return this
}
$.prototype['disable'] = function(timeToEnableAgain = null){

    this.prop('disabled', true)

    if(timeToEnableAgain) {
        
        setTimeout(() => $(this).enable(), timeToEnableAgain)
    }

    return this
}


// Class bubbling functions ---------------------
$(document).on('click', '.modal-img', function (e) {

	const TARGET = e.target,
		SCREEN_RATIO = (window.innerWidth - 100) / (window.innerHeight - 100),
		IMG_WIDTH = TARGET.naturalWidth,
		IMG_HEIGHT = TARGET.naturalHeight,
		IMG_RATIO = IMG_WIDTH / IMG_HEIGHT,
		IMG_SRC = TARGET.src,
		IMG_ALT = TARGET.alt,
		IMG_SUBTEXT = $(TARGET).attr('subtext'),
		IS_IMG_HORIZONTAL = IMG_RATIO > SCREEN_RATIO

	$(TARGET).addClass('popped-img')

	var div = $('<div>').addClass('modal-div').appendTo(document.body)
	div.css({

		display: 'flex',
		position: 'fixed',
		top: 0,
		left: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		height: '100vh',
		width: '100vw',
		cursor: 'pointer',
		zIndex: 7
	})
	div.click(function () {

		$(TARGET).removeClass('popped-img')
		div.fadeOut(100, () => div.remove())
	})

	// IMG ---------------------------------------------------------------
	var img_div = $('<div>').addClass('modal-img_div').appendTo(div)
	img_div.css({

		cursor: 'default',
		position: 'absolute',
		transform: 'translateY(-50%) translateX(-50%)',
		top: '50%',
		left: '50%',
		zIndex: 8
	})

	var img = $('<img>').appendTo(img_div)
	img.attr('src', IMG_SRC)
	img.attr('alt', IMG_ALT)

	if (IS_IMG_HORIZONTAL) {
		img_div.width('95%')
		img.width('100%')
	}
	else {
		img_div.height('85%')
		img.height('100%')
	}

	// CROSS -----------------------------------------------------------------------
	var cross = $('<p>&#10006;&#xFE0E;</p>').addClass('modal-cross').appendTo(div)
	cross.css({

		position: 'absolute',
		right: 0,
		top: 0,
		margin: '20px',
		color: 'white',
		fontSize: '30px',
		zIndex: 9
	})

	// SUBTEXT ----------------------------------------------------------------------
	if (IMG_SUBTEXT) {

		var subtext = $('<p>').addClass('modal-subtext').appendTo(img_div)
		subtext.text(IMG_SUBTEXT)
		subtext.css({

			cursor: 'default',
			position: 'absolute',
			left: 0,
			bottom: 0,
			transform: 'translateY(100%)',
			margin: 0,
			padding: '10px 10px 10px 0',
			fontSize: '18px',
			color: 'white',
			zIndex: 9
		})
		subtext.click(e => e.stopPropagation())

		img_div.css('top', 'calc(50% - 15px)')
	}

	div.hide().fadeIn('fast')
})
$(document).on('mouseenter', '.modal-img', e => $(e.target).css({
		'cursor': 'pointer',
		'opacity': 0.7,
		'transition': '0.3s'
	}))
	.on('mouseout', '.modal-img', e => $(e.target).css('opacity', 1))

$(document).on('click', '.checkbox-text', function(){

    $(this).parent().find('input[type=checkbox]').click()
})
$(document).on('click', '.radio-text', function(){

    $(this).parent().find('input[type=radio]').click()
})
$(document).on('input', '.uppercase-first', function(){

    const val = $(this).val()

    if(val.length == 1) $(this).val(val.toUpperCase())
})
$(document).on('paste', '.uppercase-first', function(a, b, c){

    setTimeout(() => {
        
        $(this).val($(this).val().upperCaseFirst())
    }, 1);
})