/*! La v2 | (c) Roy Ros Cobo | github.com/royrscb */
const La = {

    tmp: undefined, tmp2: undefined, tmp3: undefined,

    get: {

        device() {

            if (window.innerWidth <= 600) return 'MOBILE'
            else if (window.innerWidth >= 601) return 'DESKTOP'

        },

        file(src, cache = true) {

			const options = {}
			if(!cache) options['cache'] = 'no-store'

			return fetch(src, options).then(function (response) {return response.text()})
        },

        json(src, cache = true) {

            const options = {}
			if(!cache) options['cache'] = 'no-store'

			return fetch(src, options).then(function (response) {return response.json()})
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
            var lang = window.location.href.split('/').find(i => i.length == 2)
            if(!lang) lang = navigator.language.slice(0, 2)

            if (langs[lang]) {

                if (!abbreviation) lang = langs[lang]
            } else lang = undefined

            return lang
        },

        urlParams() {

            if(window.location.search){

                var params = {};

                var rawParams = window.location.search.slice(1).split('&')

                rawParams.forEach(function (param) {

                    keyValue = param.split('=')
                    params[keyValue[0]] = keyValue[1]
                })

                return params
            }
            else return {}
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

		carousel(carousel = '#content .carousel', slideElement = 'img', transitonTime = 1500){

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
            input.keyup(e => e.keyCode == 13 && save.click())

            return edit_field_div
        },

        uploadForm(phpSrc, path, data, success = ()=>{}) {

            var div = $('<div></div>').prop('id', 'upload_div').addClass('upload-div').css({

                position: 'relative',
                display: 'inline-block',
                textAlign: 'center',
                boxSizing: 'border-box',
                padding: '10px',
                width: '100%',
                height: '100%',
                fontFamily: 'helvetica'
            })

            let input = $('<input>').attr('name', 'file').attr('type', 'file').appendTo(div).hide()
            let choose_button = $('<button>').text('Choose file').addClass('upload-choose-button').appendTo(div).css({

                cursor: 'pointer',
                fontSize: '18px',
                margin: '10px',
                border: 0,
                borderRadius: '3px',
                padding: '5px 10px',
                backgroundColor: 'darkgrey',
                wordBreak: 'break-all',
                color: 'white'
            })
            $('<br>').appendTo(div)
            let send_button = $('<button>').text('Upload').addClass('upload-send-button').appendTo(div).css({

                cursor: 'pointer',
                fontSize: '20px',
                margin: '10px',
                border: 0,
                borderRadius: '3px',
                padding: '5px 10px',
                backgroundColor: 'grey',
                color: 'white'
            })

            choose_button.click(() => input.trigger('click'))
            input.change(() => choose_button.text(input.prop('files')[0].name))
            send_button.click(function (e) {

                const file = input.prop('files')[0]
                if (!file && phpSrc) return 0

                div.empty().css('padding', 0)
                var load_bar = $('<div></div>').addClass('load-bar').appendTo(div).css({

                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: 0,
                    backgroundColor: 'darkgrey'
                })
                var load_number = $('<p></p>').text('0%').addClass('load-number').appendTo(div).css({

                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: 0,
                    transform: 'translateX(-50%) translateY(-50%)'
                })

                if (!phpSrc) {

                    var loaded = 0,
                        ms = 20
                    if (typeof path == 'number') ms = path
                    var interval = setInterval(function () {

                        load_bar.height(loaded + '%')
                        load_number.text(loaded + '%')

                        loaded += 1

                        if (loaded > 100) {

                            clearInterval(interval)
                            if (success) success()
                        }

                    }, ms)
                    return 0
                }

                function showProgress(e) {

                    if (e.lengthComputable) {

                        var percentage = Math.round((e.loaded * 100) / e.total)

                        load_bar.height(percentage + '%')
                        load_number.text(percentage + '%')
                    }
                }

                var form_data = new FormData()
                form_data.append('file', file)
                form_data.append('path', path)
                form_data.append('dataJSON', JSON.stringify(data))

                $.ajax({

                        type: 'POST',
                        url: phpSrc,
                        xhr: function () {

                            var xhr = $.ajaxSettings.xhr();

                            if (xhr.upload) xhr.upload.addEventListener('progress', showProgress, false);

                            return xhr;
                        },
                        processData: false,
                        contentType: false,
                        cache: false,
                        data: form_data

                    }).done(response => success(La.parse.maybeJSON(response)))
                    .fail(function (response) {

                        load_bar.css('backgroundColor', 'red')
                        load_number.css('color', 'white').text('Error ' + response.status + ': ' + response.statusText)
                    })
            })

            return div
        },

		// set an image droppable, options: data, backgroundImage, multiple=true and callbacks: imageUploaded, crossClick
        imageUploader(phpSrc, options, callbacks){

            options = $.extend({

                data: {},
                backgroundImage: null,
                multiple: true,

            }, options)
            callbacks = $.extend({

                imageUploaded: function(){},
                crossClick: function(){}

            }, callbacks)


            let div = $('<div>').addClass('image-uploader-div').css({

                position: 'relative',
                display: 'inline-block',

                minWidth: 150,
                minHeight: 100,

                border: '1px black solid',
                borderRadius: 3,
                margin: 5,

                boxSizing: 'border-box',

                textAlign: 'center',

                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            })
            if(options.backgroundImage) div.css('background-image', 'url('+options.backgroundImage+')')

            let input = $('<input>').prop('type', 'file').prop('multiple', options.multiple).hide().appendTo(div)

            let cross = $('<div>').addClass('ico red-cross').appendTo(div).css({

                display: 'none',
                position: 'absolute',
                top: 0,
                right: 0,

                maxWidth: 15,

                padding: 5,

                zIndex: 1
            })
            if(options.backgroundImage) cross.show()
            cross.click(callbacks.crossClick)


            let choose_button = $('<button>').prop('type', 'button').text('Elige imagen'+(options.multiple ? 'es' : '')).appendTo(choose_text).css('background-color', 'white')
                .hover(e => $(e.target).css({backgroundColor: 'black', color: 'white'}), e => $(e.target).css({backgroundColor: 'white', color: 'black'}))

            let loading_text = $('<div>').addClass('center-abs-xy p-10').appendTo(div).css({

                boxSizing: 'border-box',
                width: '100%',

                fontSize: '16px'

            }).hide()
            let percentage_number = $('<span>').text('32').appendTo(loading_text)
            $('<p>').text('%').addClass('m-5').appendTo(percentage_number).appendTo(loading_text)


            // on files added --------------------------
            function showProgress(e) {

                if (e.lengthComputable) {

                    let percentage = Math.round((e.loaded * 100) / e.total)

                    percentage_number.text(percentage)
                }
            }
            function uploadFiles(files){

                loading_text.show()

                let formData = new FormData()

                for(let i = 0; i<files.length; i++) formData.append('files[]', files[i])
                formData.append('dataJSON', JSON.stringify(options.data))

                $.ajax({

                    type: 'POST',
                    url: phpSrc,
                    xhr: function () {

                        var xhr = $.ajaxSettings.xhr();

                        if (xhr.upload) xhr.upload.addEventListener('progress', showProgress, false);

                        return xhr;
                    },
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: formData

                }).done(function(res){

                    if(!La.parse.maybeError(res)){

                        loading_text.hide()
                        choose_text.show()

                        if(options.multiple) callbacks.imageUploaded(JSON.parse(res))
                        else callbacks.imageUploaded(JSON.parse(res)[0])
                    }

                }).fail(La.parse.fail)
            }


            // set events ----------------------
            choose_button.click(() => input.click())

            input.change(function(e){

                choose_text.hide()
                uploadFiles(e.target.files)
            })
            return div
        },

        quillEditor(container, html, saveFunction) {

            let div = $('<div></div>').prop('id', 'quill_div').addClass('quill-div').appendTo($(container)).css({})

            let button_div = $('<div></div>').addClass('button-div').appendTo(div).css({

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

            let quill_div = $('<div></div>').addClass('quill-div').appendTo(div).hide().css({})
            let editor_div = $('<div></div>').addClass('editor_div').appendTo(quill_div).css({

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

            let display_div = $('<div></div>').addClass('display-div').addClass('ql-editor').appendTo(div).css({

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

            var div = $('<div></div>').addClass('pop-msg-div ' + type).appendTo($('body')).css({

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
            var text = $('<p></p>').text(msg).addClass('pop-msg-text').appendTo(div).css({

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
        },

        adminLabel(text = 'ADMIN', position = "left"){

            var div = $('<div></div>')
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

            var backDiv = $('<div></div>').appendTo(div)
            var backA = $('<a></a>').appendTo(backDiv)
            backA.attr('href', '..')
            backA.text('back')
            backA.css({

                textDecoration: 'none',
                color: 'black'
            })

            var labelDiv = $('<div></div>').appendTo(div)
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
		}
    },

    parse: {

        date(date, format, langIfStringFormat = 'en'){

            if(date instanceof Date){

				if(isNaN(date)) return console.error('Invalid date: '+date)
            }
            else {// si es string o numeric

                if(isNaN(new Date(date))){

                    if(date.length == 5 && date[2] == ':' || date.length == 8 && date[2] == ':' && date[5] == ':') date = new Date('01/01/1970 '+date)
                    else if(Number.isInteger(parseInt(date[0])) && Number.isInteger(parseInt(date[1])) && Number.isInteger(parseInt(date[2])) && Number.isInteger(parseInt(date[3]))){

                        var year = date.slice(0, 4)
                        date = date.slice(5, 7)+'/'+date.slice(8, 10)+'/'+year+date.slice(10)

                        date = new Date(date)
                    }
                    else return console.error('Not recognizable string date: '+date)
                }
                else date = new Date(date)
            }

            if(!format) return date

            function getDateElement(date, element){

                function addLeadingZero(number){

                    return number > 9 ? number : '0'+number
                }

                if(element == 'Y') return date.getFullYear()
                else if(element == 'y') return date.getFullYear().toString().substring(2)
                else if(element == 'M') return date.toString(langIfStringFormat, { month: 'long' }).toLowerCase()
                else if(element == 'm') return addLeadingZero(parseInt(date.getMonth())+1)
                else if(element == 'd') return addLeadingZero(date.getDate())
                else if(element == 'D') return date.toString(langIfStringFormat, { weekday: 'long' }).toLowerCase()
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
        },

        form2object(form) {

            var obj = {}

            $(form).find('input').each((index, input) => obj[input.name] = input.type == 'checkbox' ? input.checked : $(input).val())
            $(form).find('textarea').each((findex, textarea)  => obj[textarea.name] = $(textarea).val())
            $(form).find('select').each((index, select) => obj[select.name] = $(select).val())

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
        }
    },

    util: {

        smoothScrollTo(top_or_element){

			const top = La.is.number(top_or_element) ? parseInt(top_or_element) : ($(top_or_element).offset().top -window.innerHeight/4)

			return new Promise((resolve, reject) => {

            	$('html').animate({scrollTop: top}, resolve)
			})
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

        sha256(s) {

            var chrsz = 8;
            var hexcase = 0;

            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }

            function S(X, n) {
                return (X >>> n) | (X << (32 - n));
            }

            function R(X, n) {
                return (X >>> n);
            }

            function Ch(x, y, z) {
                return ((x & y) ^ ((~x) & z));
            }

            function Maj(x, y, z) {
                return ((x & y) ^ (x & z) ^ (y & z));
            }

            function Sigma0256(x) {
                return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
            }

            function Sigma1256(x) {
                return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
            }

            function Gamma0256(x) {
                return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
            }

            function Gamma1256(x) {
                return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
            }

            function core_sha256(m, l) {

                var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
                var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
                var W = new Array(64);
                var a, b, c, d, e, f, g, h, i, j;
                var T1, T2;
                m[l >> 5] |= 0x80 << (24 - l % 32);
                m[((l + 64 >> 9) << 4) + 15] = l;
                for (var i = 0; i < m.length; i += 16) {
                    a = HASH[0];
                    b = HASH[1];
                    c = HASH[2];
                    d = HASH[3];
                    e = HASH[4];
                    f = HASH[5];
                    g = HASH[6];
                    h = HASH[7];
                    for (var j = 0; j < 64; j++) {
                        if (j < 16) W[j] = m[j + i];
                        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                        T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                        h = g;
                        g = f;
                        f = e;
                        e = safe_add(d, T1);
                        d = c;
                        c = b;
                        b = a;
                        a = safe_add(T1, T2);
                    }
                    HASH[0] = safe_add(a, HASH[0]);
                    HASH[1] = safe_add(b, HASH[1]);
                    HASH[2] = safe_add(c, HASH[2]);
                    HASH[3] = safe_add(d, HASH[3]);
                    HASH[4] = safe_add(e, HASH[4]);
                    HASH[5] = safe_add(f, HASH[5]);
                    HASH[6] = safe_add(g, HASH[6]);
                    HASH[7] = safe_add(h, HASH[7]);
                }
                return HASH;
            }

            function str2binb(str) {

                var bin = Array();
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < str.length * chrsz; i += chrsz) {
                    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
                }
                return bin;
            }

            function Utf8Encode(string) {

                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            }

            function binb2hex(binarray) {

                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                        hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
                }
                return str;
            }
            s = Utf8Encode(s);

            return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
        },

        random(min = 0, max = 100, amount = 1, repeated = false) {

            if(amount == 1) return Math.floor(Math.random() * (max - min +1)) + min
            else{

                var arr = []

                if(repeated) for(var i=0; i<amount; i++) arr.push(La.util.random(min, max))
                else{

                    for(var i=0; i<Math.min(amount, max - min); i++){

                        var num = La.util.random(min, max)
                        while(arr.includes(num)) num = La.util.random(min, max)
                        arr.push(num)
                    }
                }

                return arr
            }
        },

        prettyPrice(price){

            price = parseFloat(parseFloat(price).toFixed(2))

            return Number.isInteger(price) ? price.toString() : price.toFixed(2)
        },

        disableInputChars(charsToDisable){

            $(document).on('input', 'input:not([type=file]), textarea', function(e){

                const str = $(this).val()

                charsToDisable.forEach(function(char){

                    if(str.includes(char)){

                        $(this).val(str.split(char).join(''))
                        La.make.popMessage('Char '+char+' is not allowed', 'error')
                    }
                }.bind(this))
            })
        },

		uppercaseFirst(string){

			return string.charAt(0).toUpperCase() + string.slice(1);
		}
    }
}


// Modal img -------------------------------------------------------
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

	var div = $('<div></div>').addClass('modal-div').appendTo(document.body)
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
	var img_div = $('<div></div>').addClass('modal-img_div').appendTo(div)
	img_div.css({

		cursor: 'default',
		position: 'absolute',
		transform: 'translateY(-50%) translateX(-50%)',
		top: '50%',
		left: '50%',
		zIndex: 8
	})
	img_div.click(e => e.stopPropagation())

	var img = $('<img>').appendTo(img_div)
	img.attr('src', IMG_SRC)
	img.attr('alt', IMG_ALT)

	if (IS_IMG_HORIZONTAL) {
		img_div.width('95%');
		img.width('100%')
	}
	else {
		img_div.height('85%');
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

		var subtext = $('<p></p>').addClass('modal-subtext').appendTo(img_div)
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

Array.prototype.min = function(callback = (a) => { return a }) {

  return Math.min.apply(Math, this.map(callback))
}
Array.prototype.max = function(callback = (a) => { return a }) {

  return Math.max.apply(Math, this.map(callback))
}
