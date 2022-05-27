/* (c) Roy Ros Cobo | github.com/royrscb */

const La = {

    get: {

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

        lang(abbreviation = true) {

            var langs = {

                ab: "Abkhazian",
                af: "Afrikaans",
                sq: "Albanian",
                ar: "Arabic",
                an: "Aragonese",
                hy: "Armenian",
                az: "Azerbaijani",
                eu: "Basque",
                be: "Belarusian",
                bs: "Bosnian",
                bg: "Bulgarian",
                ca: "Catalan",
                ce: "Chechen",
                zh: "Chinese",
                hr: "Croatian",
                cs: "Czech",
                da: "Danish",
                nl: "Dutch",
                en: "English",
                eo: "Esperanto",
                et: "Estonian",
                fj: "Fijian",
                fi: "Finnish",
                fr: "French",
                gl: "Galician",
                gd: "Gaelic (Scottish)",
                gv: "Gaelic (Manx)",
                ka: "Georgian",
                de: "German",
                el: "Greek",
                kl: "Greenlandic",
                he: "Hebrew",
                hi: "Hindi",
                hu: "Hungarian",
                is: "Icelandic",
                ga: "Irish",
                it: "Italian",
                ja: "Japanese",
                kg: "Kongo",
                ko: "Korean",
                ku: "Kurdish",
                la: "Latin",
                lt: "Lithuanian",
                lb: "Luxembourgish",
                mt: "Maltese",
                mo: "Moldavian",
                mn: "Mongolian",
                ne: "Nepali",
                no: "Norwegian",
                pl: "Polish",
                pt: "Portuguese",
                ro: "Romanian",
                ru: "Russian",
                sr: "Serbian",
                sk: "Slovak",
                sl: "Slovenian",
                es: "Spanish",
                sv: "Swedish",
                tr: "Turkish",
                uk: "Ukrainian"
            }
            var lang = window.location.href.split('/').find(i => i.length == 2) ||
				$('html').prop('lang').slice(0, 2) ||
				navigator.language.slice(0, 2)

			if(!abbreviation) lang = langs[lang] || null

            return lang
        },

        urlQueries() {

            if(window.location.search){

                var params = {};

                window.location.search.slice(1).split('&').forEach(param => {

                    keyValue = param.split('=')
                    params[keyValue[0]] = keyValue[1]
                })

                return params
            }
            else return {}
        },

		// find key in json object searching recursively by depth, looking for object that match eval, what is a bool returning function with current object as parameter
		objectFromJson(json, key, eval){

			if(json.hasOwnProperty(key) && (!eval || eval(json[key]))) return json[key]
			else for(k in json){

				if(json[k] && typeof json[k] == 'object'){

					const maybeObj = La.get.objectFromJson(json[k], key, eval)

					if(maybeObj) return maybeObj
				}
			}

			return null
		},

		timeOnPage(miliseconds = false){

			if(miliseconds) return Math.round(performance.now())
			else return Math.round(performance.now()/1000)
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

            if(!jQuery.ui) return La.make.popMessage('JQuery UI is not loaded', 'error')

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

			return(setInterval(func, delay))
		}
    },

	is: {

		number(x){

			return /^\d+$/.test(x)
		},

		device(device){

			if(!device) throw Error('Device parameters required')

			const current_device = La.get.device()

			if(Array.isArray(device)) return device.includes(current_device)
			else return device == current_device
		},

		portraitScreen(){

			return window.innerWidth <= window.innerHeight
		},
		landscapeScreen(){

			return window.innerHeight < window.innerWidth
		}
	},

    load: {

        meta(name, content){

			var meta = document.createElement('meta')
			meta.name = name
			meta.content = content

			document.head.appendChild(meta)
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
		}
    },

    make: {

        editField(title, text, onSave){

            let edit_field_div = $('<div>').addClass('edit-field')

			if(title) $('<div>').addClass('edit-field-title').text(title).appendTo(edit_field_div)

            let input = $('<input>').addClass('edit-field-input uppercase-first').prop('disabled', true).val(text).appendTo(edit_field_div)

            let icon_div = $('<div>').addClass('edit-field-icons').appendTo(edit_field_div)
            let pencil = $('<div>').addClass('ico pencil').appendTo(icon_div)
            let save = $('<button>').text('Guardar').addClass('green edit-field-save').appendTo(icon_div).hide()

            pencil.click(function(){

                edit_field_div.addClass('editing')

				input.prop('disabled', false)
				input.focus()

                pencil.hide()
                save.fadeIn()
            })

            save.click(function(){

				edit_field_div.removeClass('editing')

				input.prop('disabled', true)

				save.hide()
                pencil.fadeIn()

                La.util.hideMobileKeyboard()

                if(onSave) onSave(input.val(), input)
            })
            input.keyup(e => { if(e.keyCode == 13) save.click() })

            return edit_field_div
        },

		// set an image droppable, options: data, backgroundImage, multiple=true and callbacks: imageUploaded, crossClick
        imageUploader(phpSrc, options, callbacks){

            options = $.extend({

                data: {},
                backgroundImage: null,
                multiple: true

            }, options)
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

				if(La.is.number(e)) percentage_number.text(e)
                else if(e.lengthComputable) percentage_number.text(Math.round((e.loaded * 100) / e.total))
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

        quillEditor(container, html, saveFunction) {

            let div = $('<div>').prop('id', 'quill_div').addClass('quill-div').appendTo($(container)).css({})

            let button_div = $('<div>').addClass('button-div').appendTo(div).css({

                textAlign: 'right',
                margin: '10px'
            })
            var toggle_view_button = $('<button></button>').text('Edit').addClass('toggle-view-button').appendTo(button_div).css({

                width: 'auto',
                padding: '9px',
                border: 0,
                borderRadius: '5px',
                marginRight: '30px',
                backgroundColor: 'royalblue',
                color: 'white',
                outline: 0,
                cursor: 'pointer'
            })
            var save_button = $('<button></button>').text('Save').addClass('save-button').appendTo(button_div).css({

                width: 'auto',
                padding: '9px',
                border: 0,
                borderRadius: '5px',
                backgroundColor: 'palegreen',
                color: 'black',
                outline: 0,
                cursor: 'pointer'
            })

            let quill_div = $('<div>').addClass('quill-div').appendTo(div).hide().css({})
            let editor_div = $('<div>').addClass('editor_div').appendTo(quill_div).css({

                height: '70vh'
            })
            var quill = new Quill('.editor_div', {

                theme: 'snow',
                modules: {
                    imageResize: {
                        displaySize: true
                    },
                    toolbar: [
						[{
                            'size': ['small', false, 'large', 'huge']
                        }],
						['bold', 'italic', 'underline'],
						['image'],
						[{
                            'align': []
                        }],
						[{
                            'list': 'ordered'
                        }, {
                            'list': 'bullet'
                        }],
						[{
                            'indent': '+1'
                        }],
						[{
                            'color': []
                        }, {
                            'background': []
                        }],
						 ['clean']
					]
                }
            })

            let display_div = $('<div>').addClass('display-div').addClass('ql-editor').appendTo(div).css({

            })

            quill.root.innerHTML = html
            display_div.html(html)

            toggle_view_button.click(function () {

                quill_div.toggle()
                display_div.toggle()
                if (quill_div.css('display') == 'none') toggle_view_button.text('Edit')
                else toggle_view_button.text('Preview')
                display_div.html(quill.root.innerHTML)
            })
            save_button.click(() => saveFunction(quill.root.innerHTML))
        },

		// position can be TOP or BOTTOM
        popMessage(msg, type = 'info', duration = 2000, position = 'BOTTOM') {

			if(position != 'TOP' && position != 'BOTTOM') position = 'BOTTOM'

            var div = $('<div>').addClass('pop-msg-div ' + type).appendTo($('body')).css({

                position: 'fixed',
				display: 'inline-table',
                padding: '10px 15px',
				maxWidth: '90vw',
                border: 0,
                margin: 0,
                borderRadius: '15px',
                [position.toLowerCase()]: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0,
                fontFamily: 'helvetica',
                zIndex: 9
            })
            var text = $('<p>').text(msg).addClass('pop-msg-text').appendTo(div).css({

                margin: 0,
                textAlign: 'center'
            })

			div.css({

				color: type == 'success' || type == 'error' ? 'white' : 'black',
				backgroundColor: type == 'success' ? 'limegreen' : type == 'error' ? 'firebrick' : 'floralwhite'
			})

            div.animate({

                [position.toLowerCase()]: position == 'BOTTOM' ? '10vh' : '7vh',
                opacity: 1

            }, () => setTimeout(() => {

                div.animate({opacity: 0}, 'fast', () => div.remove())

            }, duration))

			return div
        },

        adminLabel(text = 'ADMIN', position = "left"){

            var div = $('<div>')
            div.prop('id', 'admin_label')
            div.css({

                top: 0,
                position: 'fixed',
                margin: 0,
                fontFamily: 'arcade',
                zIndex: 99

            })
            if(position == 'left') div.css('left', 0)
            else if(position == 'right') div.css('right', 0)

            var backDiv = $('<div>').appendTo(div)
            var backA = $('<a></a>').appendTo(backDiv)
            backA.attr('href', '..')
            backA.text('back')
            backA.css({

                textDecoration: 'none',
                color: 'black'
            })

            var labelDiv = $('<div>').appendTo(div)
            labelDiv.text(text)
            labelDiv.css({

                padding: '5px 10px',
                margin: 0,
                wordBreak: 'break-all',
                maxWidth: '1ch',
                fontSize: '30px',
                backgroundColor: 'red',
                cursor: 'default'
            })

            labelDiv.on('mouseenter', e => $(e.target).css('opacity', 0))
                .on('mouseout', e => $(e.target).css('opacity', 1))

			return div
		},

		// set running marquee, speed in px/s, startLeftPercentage is where the first label will start on width percentage from left, separation is separation between each label
		marquee(text, speed = 100, startLeftPercentage = 50, separation = 50){

			let marquee_holder = $('<div>').addClass('marquee-holder').css({

				position: 'relative',
				width: '100%',
				overflowX: 'hidden'
			})

			let fakeText = $('<p>').addClass('fake-marquee-text m-0').text(text).appendTo(marquee_holder).css({


				display: 'inline-block',
				visibility: 'hidden',
				whiteSpace: 'nowrap'
			})

			function createMarquee(begin, textWidth){

				const distance = textWidth + begin

				let marquee = $('<p>').addClass('marquee-text').text(text).appendTo(marquee_holder).css({

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
		}
    },

    parse: {

        form2object(form) {

            var obj = {}

            $(form).find('input, textarea, select').each((index, el) => {

				if($(form).get(0) == el.form) {

					obj[el.name] = el.type == 'checkbox' ? el.checked
						: el.type == 'number' ? (!isNaN(parseFloat($(el).val())) ? parseFloat($(el).val()) : null)
						: $(el).val()
				}
			})

            return obj
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
                else La.make.popMessage(error.text, 'error')

                return true

            } else return false
        },

        fail(jqxhr, textStatus, error) {

            if(jqxhr.status == 555) console.log(La.parse.maybeJSON(error)) //echo debug
            else{

                console.error(jqxhr.status+' '+textStatus+': '+error)

                La.make.popMessage(textStatus+': '+error, 'error')
            }
        },

		// element is a css selector or element, json_text is a JSON object, attributes is attr to parse or array of attr (ph attr stands for placeholder) and lang is a bool where in case of object found having "lang" subfield and string typeof var as value is set
		htmlWithJSON(element, json_obj, attributes, lang){

			if(Array.isArray(attributes)) attributes.forEach(attr => La.parse.htmlWithJSON(element, json_obj, attr, lang))
			else $(element).find('['+attributes+']').each((i, el) => {

				const attr = attributes,
					  key = $(el).attr(attr)

				let textObject = La.get.objectFromJson(json_obj, key, obj => typeof obj == 'string' || typeof obj == 'number' || (obj && obj.hasOwnProperty(lang)))

				if(textObject){

					let text = (typeof textObject == 'string' || typeof textObject == 'number') ? textObject : textObject[lang]

					if(text){

						if(attr == 'placeholder' || attr == 'ph') $(el).prop('placeholder', text)
						else $(el).text(text)
					}
					else throw Error('['+key+'] key for attribute ('+attr+') for', element, ' has not the lang ['+lang+'] in', json_obj)
				}
				else throw Error('['+key+'] key for attribute ('+attr+') not found for', element, 'in', json_obj)
			})
		}
    },

    util: {

		smoothScrollTo(top_or_element){

			const top = La.is.number(top_or_element) ? parseInt(top_or_element) : ($(top_or_element).offset().top -window.innerHeight/3)

			return new Promise(resolve => $('html').animate({scrollTop: top}, () => resolve(top_or_element)))
        },

        hideMobileKeyboard(){

            if(La.get.device() == 'MOBILE') $(':focus').blur()
        },

        random(min = 0, max = 100, amount = 1, repeated = false) {

            if(amount == 1) return Math.floor(Math.random() * (max - min +1)) + min
            else{

                var arr = []

                if(repeated) for(var i=0; i<amount; i++) arr.push(La.util.random(min, max))
                else{

                    for(var i=0; i<Math.min(amount, max - min +1); i++){

                        var num = La.util.random(min, max)
                        while(arr.includes(num)) num = La.util.random(min, max)
                        arr.push(num)
                    }
                }

                return arr
            }
        },

        disableInputChars(charsToDisable, selector = 'body'){

            $(document).on('input', selector+' input:not([type=file]), '+selector+' textarea', function(e){

                const str = $(this).val()

                charsToDisable.forEach(function(char){

                    if(str.includes(char)){

                        $(this).val(str.split(char).join(''))
                        La.make.popMessage('El caracter '+char+' no está permitido', 'error')
                    }
                }.bind(this))
            })
        },

		sleep(seconds = 1){

			return new Promise(resolve => setTimeout(() => resolve(), seconds*1000))
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

		count(timeOnPage = false){

			if(timeOnPage) setInterval(() => console.log(La.get.timeOnPage()), 1000)
			else{

				let count = 0
				setInterval(() => console.log(count++), 1000)
			}
		},

        addLeadingZero(number){

            return number > 9 ? number : '0'+number
        }
    },

    time: {

        parse(date, format = null, langIfStringFormat = 'en'){

            if(date instanceof Date){

				if(isNaN(date)) throw Error('Invalid date: '+date)
            }
            else {// si es string o numeric

                let newDate = new Date(date)

                if(!isNaN(newDate)) date = newDate
				else{

                    if(date.length == 5 && date[2] == ':' || date.length == 8 && date[2] == ':' && date[5] == ':') date = new Date('01/01/1970 '+date)
                    else if(Number.isInteger(parseInt(date[0])) && Number.isInteger(parseInt(date[1])) && Number.isInteger(parseInt(date[2])) && Number.isInteger(parseInt(date[3]))){

                        var year = date.slice(0, 4)
                        date = date.slice(5, 7)+'/'+date.slice(8, 10)+'/'+year+date.slice(10)

                        date = new Date(date)
                    }
                    else throw Error('Not recognizable string date: '+date)
                }
            }

            return !format ? date : La.time.format(date, format, langIfStringFormat)
        },
        format(date, format, langIfStringFormat = 'en'){

            date = La.time.parse(date)

            let display

            if(format.length == 1){

                display = format == TIMEFORMAT.unix_time ? Math.floor(date.getTime()/1000)
                    : format == TIMEFORMAT.seconds ? La.util.addLeadingZero(date.getSeconds())
                    : format == TIMEFORMAT.minutes ? La.util.addLeadingZero(date.getMinutes())
                    : format == TIMEFORMAT.hours ? La.util.addLeadingZero(date.getHours() > 12 ? La.time.add(date, -12, 'h').getHours() : date.getHours())
                    : format == TIMEFORMAT.hour_24 ? La.util.addLeadingZero(date.getHours())
                    : format == TIMEFORMAT.days ? La.util.addLeadingZero(date.getDate())
                    : format == TIMEFORMAT.day_name ? date.toLocaleString(langIfStringFormat, { weekday: 'long' }).toLowerCase()
                    : format == TIMEFORMAT.months ? La.util.addLeadingZero(parseInt(date.getMonth())+1)
                    : format == TIMEFORMAT.month_name ? date.toLocaleString(langIfStringFormat, { month: 'long' }).toLowerCase()
                    : format == TIMEFORMAT.years ? date.getFullYear().toString().substring(2)
                    : format == TIMEFORMAT.year_full ? date.getFullYear()
                    : !('a' < format && format < 'z' || 'A' < format && format < 'Z') ? format
                    : null

                if(display === null) throw Error('Unknown element in format parse date ['+format+']', 'error')
            }
            else{

                display = ''
                for(var i = 0; i < format.length; i++) display += La.time.format(date, format.charAt(i), langIfStringFormat)
            }

            return display
        },

        add(date, timeToAdd, timeFormat, format = null, langIfStringFormat = 'en'){

			if(timeFormat == TIMEFORMAT.milliseconds) return La.time.parse(La.time.parse(date).getTime() + timeToAdd, format, langIfStringFormat)
            else if(timeFormat == TIMEFORMAT.seconds) return La.time.add(date, timeToAdd * 1000, TIMEFORMAT.milliseconds)
            else if(timeFormat == TIMEFORMAT.minutes) return La.time.add(date, timeToAdd * 60, TIMEFORMAT.seconds)
            else if(timeFormat == TIMEFORMAT.hours) return La.time.add(date, timeToAdd * 60, TIMEFORMAT.minutes)
            else if(timeFormat == TIMEFORMAT.days) return La.time.add(date, timeToAdd * 24, TIMEFORMAT.hours)
            else if(timeFormat == TIMEFORMAT.weeks) return La.time.add(date, timeToAdd * 7, TIMEFORMAT.days)
            else if(timeFormat == TIMEFORMAT.years) return La.time.add(date, timeToAdd * 365, TIMEFORMAT.days)
            else throw Error('Unknown format for date_addition ['+timeFormat+']')
        },
        addMillis: (date, millis, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.milliseconds, format, langIfStringFormat),
        addSeconds: (date, seconds, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.seconds, format, langIfStringFormat),
        addMinutes: (date, minutes, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.minutes, format, langIfStringFormat),
        addHours: (date, hours, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.hours, format, langIfStringFormat),
        addDays: (date, days, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.days, format, langIfStringFormat),
        addWeeks: (date, weeks, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.weeks, format, langIfStringFormat),
        addYears: (date, years, format = null, langIfStringFormat) => La.time.add(date, millis, TIMEFORMAT.years, format, langIfStringFormat),

        equalDay: (date_a, date_b) => La.time.format(date_a, 'Y-m-d') == La.time.format(date_b, 'Y-m-d'),
        equalMonth: (date_a, date_b) => La.time.format(date_a, 'Y-m') == La.time.format(date_b, 'Y-m'),
        equalYear: (date_a, date_b) => La.time.format(date_a, 'Y') == La.time.format(date_b, 'Y'),

        toUnixTime: (date) => Math.floor(La.time.parse(date).getTime() / 1000),

        toMillis: (time, format) => La.time.add(0, time, format).getTime(),
        toSeconds: (time, format) => Math.floor(La.time.toMillis(time, format) / 1000),
        toMinutes: (time, format) => Math.floor(La.time.toSeconds(time, format) / 60),
        toHours: (time, format) => Math.floor(La.time.toMinutes(time, format) / 60),
        toDays: (time, format) => Math.floor(La.time.toHours(time, format) / 24),
        toWeeks: (time, format) => Math.floor(La.time.toDays(time, format) / 7),
        toYears: (time, format) => Math.floor(La.time.toDays(time, format) / 365)
    },

	storage: {

		expirationTimesName: '_expiration_times_',

		exists(key){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage.expirationTimesName)) || {}

			if(Object.keys(localStorage).includes(key) && (!expirationTimes[key] || Date.now() < expirationTimes[key])) return true
			else{

				La.storage.remove(key)

				return false
			}
		},
		get(key){

			if(La.storage.exists(key)) return La.parse.maybeJSON(localStorage.getItem(key))
		},
		set(key, value, expiration){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage.expirationTimesName)) || {}

			if(expiration) expirationTimes[key] = Number.isInteger(expiration) ? Date.now() + expiration : La.time.parse(expiration).getTime()
			else if(expiration === null && expirationTimes[key]) delete expirationTimes[key]

			if(!expiration || Date.now() < expirationTimes[key]){

				localStorage.setItem(key, JSON.stringify(value))
				localStorage.setItem(La.storage.expirationTimesName, JSON.stringify(expirationTimes))

				return value
			}
		},
		remove(key){

			localStorage.removeItem(key)

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage.expirationTimesName)) || {}

			if(expirationTimes[key]){

				delete expirationTimes[key]
				localStorage.setItem(La.storage.expirationTimesName, JSON.stringify(expirationTimes))
			}
		},
		list(){

			let expirationTimes = JSON.parse(localStorage.getItem(La.storage.expirationTimesName)) || {}

			Object.keys(localStorage).forEach(key => {

				if(Object.keys(expirationTimes).includes(key)) console.log('%c'+key+' %c['+La.time.parse(expirationTimes[key], TIMESTAMP)+']', 'font-weight: bold; font-size: 12px', 'color: red', La.storage.get(key))
				else console.log('%c'+key, 'font-weight: bold; font-size: 12px', La.storage.get(key))
			})
		},
		clear(){

			localStorage.clear()
		}
	}
}

// CONSTS -------------------------
const cl = console.log,
	  TIMESTAMP = 'Y-m-d H:i:s'

// ENUMS --------------------------
const TIMEFORMAT = {

	unix_time: 'U',
	milliseconds: 'ms',
	seconds: 's',
	minutes: 'i',
	hours: 'h',
	hour_24: 'H',
	days: 'd',
	day_name: 'D',
	weeks: 'w',
	months: 'm',
	month_name: 'M',
	years: 'y',
	year_full: 'Y'
},
	  DEVICE = {

		  mobile: 'MOBILE',
		  tablet: 'TABLET',
		  desktop: 'DESKTOP'
	  }

// CLASS FUNCTIONS -------------------------------------------------------
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
$(document).on('input', '.uppercase-first', function(){

    const val = $(this).val()

    if(val.length == 1) $(this).val(val.toUpperCase())
})

// PROTOTYPE EXTEND ----------------------------------------
String.prototype['upperCaseFirst'] = function(){

	if(this.length) return this[0].toUpperCase() + this.toString().slice(1)
	else return ''
}
Number.prototype['prettyPrice'] = function(){

	let price = parseFloat(Math.round(this*100)/100)

	if(Number.isNaN(price)) return NaN
	else return Number.isInteger(price) ? price.toString() : price.toFixed(2)
}
String.prototype['prettyPrice'] = Number.prototype['prettyPrice']
String.prototype['prettyUpperCase'] = function(minLengthToUpper = 4){

	if(this.length) return this.toLowerCase().upperCaseFirst().split(' ').map(w => w.length >= minLengthToUpper ? w.upperCaseFirst() : w).join(' ')
	else return ''
}