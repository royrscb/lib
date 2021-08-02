/*! La v2 | (c) Roy Ros Cobo | github.com/royrscb */

const La = {

    get: {

        device() {

			return window.innerWidth <= 600 ? 'MOBILE' : 'DESKTOP'
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

        urlParams() {

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

		urlParams(params){

			if(!params) window.history.replaceState(null, null, location.pathname)
			else if(typeof params == 'string') window.history.replaceState(null, null, location.href.split('?')[0]+'?'+params)
			else if(typeof params == 'object') La.set.urlParams(Object.keys(params).map(k => k+'='+(typeof params[k] == 'string' ? params[k].split(' ').join('_') : params[k])).join('&'))
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
		}
    },

	is: {

		number(x){

			return /^\d+$/.test(x)
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

				link.onload = resolve
				link.onerror = reject

				document.head.appendChild(link)
			})
		},
        script(src, version){

			return new Promise((resolve, reject) => {

				let script = document.createElement('script')
				script.src = src+(version ? '?v='+version : '')

				script.onload = resolve
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

        popMessage(msg, type = 'info', duration = 2000) {

            var div = $('<div>').addClass('pop-msg-div ' + type).appendTo($('body')).css({

                position: 'fixed',
				display: 'inline-table',
                padding: '10px 15px',
				maxWidth: '90vw',
                border: 0,
                margin: 0,
                borderRadius: '15px',
                bottom: 0,
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

            if (type == 'info') div.css({
                backgroundColor: 'floralwhite'
            })
            else if (type == 'success') div.css({
                backgroundColor: 'limegreen',
                color: 'white'
            })
            else if (type == 'error') div.css({
                backgroundColor: 'firebrick',
                color: 'white'
            })

            div.animate({
                bottom: '10vh',
                opacity: 1
            }, () => setTimeout(function () {

                div.animate({
                    opacity: 0
                }, 'fast', () => div.remove())
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

        date(date, format, langIfStringFormat = 'en'){

            if(date instanceof Date){

				if(isNaN(date)) return console.error('Invalid date: '+date)
            }
            else {// si es string o numeric

                if(!isNaN(new Date(date))) date = new Date(date)
				else{

                    if(date.length == 5 && date[2] == ':' || date.length == 8 && date[2] == ':' && date[5] == ':') date = new Date('01/01/1970 '+date)
                    else if(Number.isInteger(parseInt(date[0])) && Number.isInteger(parseInt(date[1])) && Number.isInteger(parseInt(date[2])) && Number.isInteger(parseInt(date[3]))){

                        var year = date.slice(0, 4)
                        date = date.slice(5, 7)+'/'+date.slice(8, 10)+'/'+year+date.slice(10)

                        date = new Date(date)
                    }
                    else return console.error('Not recognizable string date: '+date)
                }
            }

            if(format){

				function getDateElement(date, element){

					function addLeadingZero(number){

						return number > 9 ? number : '0'+number
					}

					if(element == 'U') return Math.floor(date.getTime()/1000)
					else if(element == 'Y') return date.getFullYear()
					else if(element == 'y') return date.getFullYear().toString().substring(2)
					else if(element == 'M') return date.toLocaleString(langIfStringFormat, { month: 'long' }).toLowerCase()
					else if(element == 'm') return addLeadingZero(parseInt(date.getMonth())+1)
					else if(element == 'd') return addLeadingZero(date.getDate())
					else if(element == 'D') return date.toLocaleString(langIfStringFormat, { weekday: 'long' }).toLowerCase()
					else if(element == 'H') return addLeadingZero(date.getHours())
					else if(element == 'h') return date.getHours() > 12 ? addLeadingZero(La.util.date_addition(date, -12, 'h').getHours()) : addLeadingZero(date.getHours())
					else if(element == 'i') return addLeadingZero(date.getMinutes())
					else if(element == 's') return addLeadingZero(date.getSeconds())
					else if(!('a' < element && element < 'z' || 'A' < element && element < 'Z')) return element
					else return La.make.popMessage('Unknown element in format parse date ['+element+']', 'error')
				}

				var display = ''
				for(var i = 0; i < format.length; i++) display += getDateElement(date, format.charAt(i))

				return display
			}
			else return date
        },

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

            } catch (e) {

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
					else console.error('['+key+'] key for attribute ('+attr+') for', element, ' has not the lang ['+lang+'] in', json_obj)
				}
				else console.error('['+key+'] key for attribute ('+attr+') not found for', element, 'in', json_obj)
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

		// s: second, i: minute, h: hour, d: day, w: week, y: year
        date_addition(date, timeToAdd, format){

            dateTime = La.parse.date(date).getTime()

            if(format == 's') return new Date(dateTime + timeToAdd * 1000)
            else if(format == 'i') return La.util.date_addition(date, timeToAdd * 60, 's')
            else if(format == 'h') return La.util.date_addition(date, timeToAdd * 60, 'i')
            else if(format == 'd') return La.util.date_addition(date, timeToAdd * 24, 'h')
            else if(format == 'w') return La.util.date_addition(date, timeToAdd * 7, 'd')
            else if(format == 'y') return La.util.date_addition(date, timeToAdd * 365, 'd')
            else return console.error('Unknown format for date_addition ['+format+']')
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

			return new Promise(resolve => setTimeout(resolve, seconds*1000))
		},

		blink(element, color, bgColor, duration = 1000, loop = false){

			let prevColor = $(element).css('color'),
				prevBgColor = $(element).css('background-color'),
				prevTransition = $(element).css('transition')

			let cssToSet = { transition: (duration/1000/2)+'s' }
			if(color) cssToSet['color'] = color
			if(bgColor) cssToSet['backgroundColor'] = bgColor

			$(element).css(cssToSet)
			setTimeout(() => $(element).css({color: prevColor, backgroundColor: prevBgColor}), duration/2)
			setTimeout(() => $(element).css({transition: prevTransition}), duration)

			if(loop !== false) $(element).attr('id_blink_interval', setInterval(() => this.blink(element, color, bgColor, duration, false), loop))

			return $(element)
		}
    }
}

// CONSTS -------------------------
const cl = console.log, TIMESTAMP = 'Y-m-d H:i:s'

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
String.prototype['prettyPrice'] = Number.prototype['prettyPrice'] = function(){

	let price = parseFloat(Math.round(this*100)/100)

	return Number.isInteger(price) ? price.toString() : price.toFixed(2)
}
String.prototype['prettyUpperCase'] = function(){

	if(this.length) return this.toLowerCase().upperCaseFirst().split(' ').map(w => w.length > 3 ? w.upperCaseFirst() : w).join(' ')
	else return ''
}