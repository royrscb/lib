class Stripe_la {

    static PAY_WITH_CARD_BUTTON_ID = 'stripe-pay_with_card_button'
    static PAY_WITH_STRIPE_CARD_INPUT_ID = 'stripe-pay_with_card_input'
    static PAY_WITH_STRIPE_BUTTON_ID = 'stripe-pay_with_stripe_button'

    static PAY_WITH_WALLET_BUTTONS_CONTAINER_ID = 'stripe-pay_wallet_buttons_container'
    static PAY_WITH_WALLET_X_BUTTON_ID = 'stripe-pay_with_wallet_x_button'

    static STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/'
    static WALLET = [
        'applePay',
        'googlePay',
        'link'
    ]

    // Private attributes #########################################################################
    _stripe 
    _stripeScript_loaded

    _verbose = true

    _createPaymentIntent_php_file_path
    
    _publicKeys
    _live

    _paymentData
    _paymentRequestWallet
    _availableWallets

    // HTML elements
    _payWithCardButton
    _payWithWalletButtonsContainer

    _loadingPopUp


    // cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    constructor(live, publicKeys, createPaymentIntent_php_file_path){

        if(typeof live == typeof undefined) this._error('live parameter is not defined')

        if(!publicKeys.hasOwnProperty('test')) this._error('Public keys does not contain test key', false)
        if(!publicKeys.test.includes('test')) this._error('Public test key does not look like a test key', false)
        if(!publicKeys.hasOwnProperty('live')) this._error('Public keys does not contain live key', false)
        if(!publicKeys.live.includes('live')) this._error('Public live key does not look like a live key', false)

        if(!createPaymentIntent_php_file_path) this._error('createPaymentIntent_php_file_path parameter not provided')

        this._live = live
        this._publicKeys = publicKeys
        this._createPaymentIntent_php_file_path = createPaymentIntent_php_file_path

        this._stripeScript_loaded = this._loadScript()

        console.log('new Stripe_la object created')
    }
    
    // [VIRTUAL] methods to override vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    isReadyToPay = () => {

        console.warn('[Stripe_La] isReadyToPay method is not overrided')

        return true
    }
    onPaymentStart = paymentMethod => {}
    loading = isLoading => {

        if(isLoading) this._loadingPopUp = La.pop.loading('Loading...').css('z-index', 999_999)
        else if(this._loadingPopUp) {
    
            this._loadingPopUp.close()
            this._loadingPopUp = null
        }
    }
    onPaymentSuccess = paymentData => {

        console.warn('[Stripe_La] onPaymentSuccess is not overrided')
    }

    onWalletPaymentCanceled = () => {}

    // [PUBLIC] methods -----------------------------------------------------------------------------
    
    /* If provided it set custom payment buttons and container, otherwise return default container with both */
    makePaymentButtons(payWithCardButton = null, payWithWalletButtonsContainer = null){

        if(payWithCardButton && payWithWalletButtonsContainer){

            this._payWithCardButton = payWithCardButton
            this._payWithWalletButtonsContainer = payWithWalletButtonsContainer

            this._log('Set custom payment buttons (waiting for start function call)')
        }
        else {

            let paymentButtonsContainer = this._makePaymentButtonsContainer()

            this._payWithCardButton = paymentButtonsContainer.find('#'+Stripe_la.PAY_WITH_CARD_BUTTON_ID)
            this._payWithWalletButtonsContainer = paymentButtonsContainer.find('#'+Stripe_la.PAY_WITH_WALLET_BUTTONS_CONTAINER_ID)

            this._log('Set default payment buttons (waiting for start function call)')

            return paymentButtonsContainer
        }
    }

    /* PaymentData is an object with fields: (mandatory: [amount, label])
        amount:      Amount of the payment in decimal value (2.71)
        label:       Label to show user when payment is shown
        description: Description for Stripe
        metadata:    Whatever data to store for user

        customer_id:          If this is provided an user will be created on Stripe (Provide this only if exists customer in user platform and is logged in). Integer
        customer_name:        (ignored if customer_id not provided)
        customer_email:       (ignored if customer_id not provided)
        customer_description: (ignored if customer_id not provided)
    */
    /*
        let paymentData = {
            amount: null,
            label: null,
            description: null,
            metadata: null,
            
            customer_id: null,
            customer_name: null,
            customer_email: null,
            customer_description: null
        }
    */
    async start(paymentData){

        if(!this._payWithCardButton || !this._payWithWalletButtonsContainer) this._error('Payment buttons are not set')
        if(!paymentData.label) this._error('PaymentInfo label not defined')
        if(!paymentData.amount) this._error('PaymentInfo amount not defined')

        this._paymentData = paymentData
        this._paymentData['live'] = this._live

        // Create real Stripe object
        await this._stripeScript_loaded

        if(this._live) {

            this._stripe = Stripe(this._publicKeys.live);

            this._log('Stripe LIVE started')
        }
        else{
    
            this._stripe = Stripe(this._publicKeys.test);

            this._log('Stripe TEST started')
            La.pop.text('Stripe TEST mode', 'warning')
        }

        // Una mica de show i temps pel user
        await La.util.sleep(777)

        // Set triggers and handle HTML ---
        $(document).find('.stripe-payment-buttons-container > .loading-spinner-cont').remove()

        // Pay with card and pay with wallets
        this._payWithCardButton.fadeIn('fast').on('click', () => {

            if(!this.isReadyToPay()) return null

            this._payWithCardButton.disable()
            
            this._popPayWithStripe()
        })
        this._setWalletButtons()
    }

    // Clear stored data as when was created
    clear(){

        this._verbose = true
        
        delete this._paymentData
        delete this._paymentRequestWallet

        delete this._payWithCardButton
        delete this._payWithWalletButtonsContainer

        delete this._loadingPopUp
    }

    // Get attributes
    get = {
        live: () => this._live,
        stripeScriptLoaded: () => this._stripeScript_loaded,
        paymentData: () => this._paymentData,
        availableWallets: () => this._availableWallets
    }
    // Set attributes
    set = {

        verbose: verbose => this._verbose = verbose,

        // Payment data
        paymentData: paymentData => {

            if(!paymentData.label) this._error('PaymentInfo label not defined')
            if(!paymentData.hasOwnProperty('amount')) this._error('PaymentInfo amount not defined')
            if(Number.isNaN(parseFloat(paymentData.amount))) this._error('PaymentInfo amount is not a number')
            if(paymentData.amount == 0) this._error('PaymentInfo amount can not be 0')
    
            this._paymentData = paymentData
            this._paymentData.live = this._live
    
            // Wallets payment request
            if(this._paymentRequestWallet) {
    
                this._paymentRequestWallet.update({
        
                    total: {
        
                          label: paymentData.label,
                          amount: Math.round(paymentData.amount * 100)
                    }
                })
            }
    
            // Log
            let logText = 'Payment data updated'
            if(this._availableWallets === null) logText += ' (no wallets available)'
            
            this._log(logText, this._paymentData)

            return this._paymentData
        },

        paymentAmount: amount => {

            if(!this._paymentData) this.paymentData = {}

            this._paymentData.amount = amount
    
            return this.set.paymentData(this._paymentData)
        },
        paymentLabel: label => {

            if(!this._paymentData) this.paymentData = {}

            this._paymentData.label = label
    
            return this.set.paymentData(this._paymentData)
        },

        // Fields that non form part of _paymentRequestWallet attr
        _paymentNonWalletRequestField: (fieldName, value) => {

            if(!this._paymentData) this.paymentData = {}

            this._paymentData[fieldName] = value

            this._log('Payment data updated', this._paymentData)

            return this._paymentData
        },
        paymentDescription: value => this.set._paymentNonWalletRequestField('description', value),
        paymentMetadata: value => this.set._paymentNonWalletRequestField('metadata', value),
        paymentCustomer_id: value => this.set._paymentNonWalletRequestField('customer_id', value),
        paymentCustomer_name: value => this.set._paymentNonWalletRequestField('customer_name', value),
        paymentCustomer_email: value => this.set._paymentNonWalletRequestField('customer_email', value),
        paymentCustomer_description: value => this.set._paymentNonWalletRequestField('customer_description', value)
    }

    // [PRIVATE] methods ############################################################################
    async _loadScript(){

        if(!$('script[src="'+Stripe_la.STRIPE_SCRIPT_URL+'"]').length) {

            await La.load.script(Stripe_la.STRIPE_SCRIPT_URL)
                .then(()=> { this._log('Script loaded') })
                .catch(err => { this._error('Error loading online payment') })
        }
    }
    _makePaymentButtonsContainer(){

        if(document.getElementById(Stripe_la.PAY_WITH_CARD_BUTTON_ID)) {

            this._error('Stripe pay with card button already in DOM')
        }
        if(document.getElementById(Stripe_la.PAY_WITH_WALLET_BUTTONS_CONTAINER_ID)) {

            this._error('Stripe pay with wallet buttons container already in DOM')
        }

        const payWithCardText = La.get.lang() == 'ca' ? 'Pagar amb tarjeta'
            : (La.get.lang() == 'es' ? 'Pagar con tarjeta' : 'Pay with card')

        let container = $('<div>').addClass('stripe-payment-buttons-container').append(
            // Loading spinner
            $('<div>').addClass('loading-spinner-cont center-text pt-10 mt-10').append(
                $('<div>').addClass('gif ico loading-spinner')
            ),
            // Pay with card container and button
            $('<div>').addClass('pay-with-card-button-container p-10').append(
                $('<button>').hide().prop({
                    id: Stripe_la.PAY_WITH_CARD_BUTTON_ID,
                    type: 'button'
                }).text(payWithCardText).css({
                    width: '100%',
                    padding: 10,
                    boxSizing: 'border-box'
                })
            ),
            // Pay with wallets container
            $('<div>').hide().prop({id: Stripe_la.PAY_WITH_WALLET_BUTTONS_CONTAINER_ID}).css({
                width: '100%',
                padding: 10,
                boxSizing: 'border-box'
            })
        )

        return container
    }

    // Pay flow common ---
    _onPaymentSuccess(){

        this._log('Payment successfull', this._paymentData)

        this._payWithCardButton.hide()
        this._payWithWalletButtonsContainer.hide()

        this.loading(false)

        // >>> exit point, return to user on success
        this.onPaymentSuccess(this._paymentData)
    }

    async _createPaymentIntent(){ // Returns clientSecret

        this._log('Attemting to create payment intent', this._createPaymentIntent_php_file_path, this._paymentData)

        return $.post(this._createPaymentIntent_php_file_path, {payment_data: this._paymentData}).then(res => {
    
            if(!parseMaybeError(res)) {

                if(res) this._log('Payment intent created and client secret got correctly')
                else this._error('Client secret is empty')

                return res
            }
            else this._error(res)

        }).fail(La.parse.fail)
    }
    async _confirmPayment(paymentMethod, paymentMethodKey){ // Creates payment intent and confirm at same time

        // Post payment intent to PHP to get client secret
        const clientSecret = await this._createPaymentIntent().catch(this._error)

        if(clientSecret){

            this._log('Start card payment confirmation', {payment_method: paymentMethodKey})

            return this._stripe.confirmCardPayment(clientSecret, {payment_method: paymentMethodKey}).then(result => {

                if(!result.error) {

                    this._paymentData['payment_method'] = paymentMethod
                    this._paymentData['payment_id'] = result.paymentIntent.id
                    
                    this._onPaymentSuccess()
                }
                else this._error(result.error.message)
            })
        }
    }

    // Pay flow card (Stripe)
    _makePayWithStripePopUpContent(){

        const payText = ['es', 'ca'].includes(La.get.lang()) ? 'Pagar' : 'Pay'

        let content = $('<div>').append(
            // Stripe logo
            $('<div>').addClass('stripe-logo').append(
                $('<img>').prop('src', '../img/logos/stripe.png').addClass('w-50 mb-20')
            ),
            // Card input, where Stripe.js injects the card element
            $('<div>').prop('id', Stripe_la.PAY_WITH_STRIPE_CARD_INPUT_ID).css({
                width: '100%',
                height: 40,
                padding: 10,
                background: 'white',
                border: '1px solid darkgrey',
                marginBottom: 10,
                borderRadius: 4,
                boxSizing: 'border-box'
            }),
            // Pay with Stripe button
            $('<button>').prop('id', Stripe_la.PAY_WITH_STRIPE_BUTTON_ID).disable()
                .text(payText)
                .css({
                    width: '100%',
                    // color: 'white',
                    // backgroundColor: '#6772e5',
                    // borderRadius: 4
                })
        )

        return content
    }
    async _popPayWithStripe(){

        this._log('Popping pay with Stripe')
        this.loading(true)
        
        await this.onPaymentStart('stripe')

        // [Pop up] Pay with Stripe ---
        let content = this._makePayWithStripePopUpContent()
        let payWithStripe_button = content.find('#'+Stripe_la.PAY_WITH_STRIPE_BUTTON_ID)
        let popUp = La.pop.popUp(null, content, null, null, () => {

            this._payWithCardButton.enable()
            this.loading(false)
        })
        popUp.css('z-index', 1_000_000)

        // [Inject] Stripe card element ---
        let stripeCardInput = this._stripe.elements().create('card', {hidePostalCode: true})
        stripeCardInput.on('change', event => {

            if(!event.empty && event.error) La.pop.text(event.error.message, 'error', undefined, 'TOP')

            payWithStripe_button.prop('disabled', event.empty)
        })
        stripeCardInput.mount('#'+Stripe_la.PAY_WITH_STRIPE_CARD_INPUT_ID)

        // [Pay Stripe button] click ---
        payWithStripe_button.click(() => {

            payWithStripe_button.disable()

            this._confirmPayment('stripe', {card: stripeCardInput})
                .then(() => popUp.close())
                .catch(() => payWithStripe_button.enable()) // Ja sha mostrat el error (falta un numero ala tarjeta o algo) i torno a deixar clicar
        })
    }

    // Pay flow wallets
    async _startWalletPayment(wallet){

        this._log('Wallet '+wallet+' payment started')
        this.loading(true)

        await this.onPaymentStart(wallet)

        // Off old paymentmethod events and attach on new one
        this._paymentRequestWallet.off('paymentmethod').on('paymentmethod', event => {

            this._confirmPayment(wallet, event.paymentMethod.id)
                .then(() => event.complete('success'))
                .catch(() => {

                    if(this._paymentRequestWallet?.isShowing()) this._paymentRequestWallet.abort()
                    event.complete('fail')

                    this.loading(false)
                })
        })
    }
    _setWalletButtons(){

        // Create payment request
        this._paymentRequestWallet = this._stripe.paymentRequest({

            country: 'ES',
            currency: 'eur',
            total: {
    
                  label: this._paymentData.label,
                  amount: Math.round(this._paymentData.amount * 100)
            }
        })
    
        // Set buttons
        this._paymentRequestWallet.canMakePayment().then(wallets => {
    
            if(wallets){

                this._log('Wallets available', wallets)

                this._availableWallets = wallets

                this._payWithWalletButtonsContainer.show()

                // ApplePay i GooglePay poden sortir els dos, el link no pq es un pesao q copia
                let walletsToSet = Stripe_la.WALLET.filter(w => wallets[w])
                if(walletsToSet.length > 1) walletsToSet.removeOne(w => w == 'link')

                // Per cada wallet que definida i que el usuari pot fer servir
                walletsToSet.forEach(wallet => {

                    // Create Stripe real button element
                    const paymentRequestButton = this._stripe.elements().create('paymentRequestButton', {paymentRequest: this._paymentRequestWallet})

                    // Create this button container
                    const buttonContainerId = Stripe_la.PAY_WITH_WALLET_X_BUTTON_ID.replace('x', wallet)
                    const buttonContainer = $('<div>').prop({id: buttonContainerId}).appendTo(this._payWithWalletButtonsContainer)

                    paymentRequestButton.mount('#'+buttonContainerId)
                    paymentRequestButton.on('click', event => {

                        if(!this.isReadyToPay()) return event.preventDefault()

                        this._startWalletPayment(wallet)
                    })
                    
                    buttonContainer.fadeIn('fast')

                    this._log('Wallet '+wallet+' payment button created')
                })
    
                this._paymentRequestWallet.on('cancel', () => {

                    this.loading(false)
                    this.onWalletPaymentCanceled()
                })
            }
            else {

                this._paymentRequestWallet = null
                this._availableWallets = null
            }
        })
    }

    // Other ---
    _log(text, param){

        if(this._verbose) {
            
            text = '[Stripe_la] '+text
            
            if(param) console.log(text, param)
            else console.log(text)
        }
    }
    _error(text, popIt = true, throwIt = true){

        if(popIt && typeof text == 'string') La.pop.text(text, 'error', 9000)
        
        if(throwIt) throw new Error(text)
    }
}