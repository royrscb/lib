<?php

    require __DIR__.'/../composer/vendor/autoload.php';

    class Customers{

        private $customers;

        function __construct($customers) {

            $this->customers = $customers;
        }

        function create($id, $email, $name = null, $description = null){

            $attributes = [

                'id' => $id,
                'email' => $email
            ];
            if($name) $attributes['name'] = $name;
            if($description) $attributes['description'] = $description;

            try{ $new_customer = $this->customers->create($attributes); }
            catch (Exception $e) { throwException(500, '[stripe customers create] '.$e->getError()->message); }

            return $new_customer;
        }

        function update($id, $attributes){

            try{ $updated_customer = $this->customers->update($id, $attributes); }
            catch (Exception $e) { throwException(500, '[stripe customers update] '.$e->getError()->message); }

            return $updated_customer;
        }

        function get($id){

            try{ $customer = $this->customers->retrieve( $id , [] ); }
            catch (Exception $e) { $customer = null; }

            return $customer;
        }
    }

    class PaymentIntents{

        private $paymentIntents;

        function __construct($paymentIntents) {

            $this->paymentIntents = $paymentIntents;
        }

        function create($amount, $customer_id = null, $description = null){

            $parameters = [

              'amount' => floatval($amount)*100,
              'currency' => 'eur'
            ];
            if($customer_id) $parameters['customer'] = $customer_id;
            if($description) $parameters['description'] = $description;


            try{ $new_paymentIntent = $this->paymentIntents->create($parameters); }
            catch (Exception $e) { throwException(500, '[stripe paymentIntents create] '.$e->getError()->message); }

            return $new_paymentIntent;
        }

        function update($id, $parameters){

            try{ $updated_paymentIntent = $this->paymentIntents->update($id, $parameters); }
            catch (Exception $e) { throwException(500, '[stripe paymentIntents update] '.$e->getError()->message); }

            return $updated_paymentIntent;
        }

        function get($id){

            try{ $paymentIntent = $this->paymentIntents->retrieve( $id , [] ); }
            catch (Exception $e) { $paymentIntent = null; }

            return $paymentIntent;
        }

    }


    class Stripe{

        public $customers, $paymentIntents;

        function __construct($live) {

            if(!isset($live)) throwException(500, 'Stripe object created without live defined');

            if($live) $stripe = new \Stripe\StripeClient('xxx');
            else $stripe = new \Stripe\StripeClient('xxx');

            $this->paymentIntents = new PaymentIntents($stripe->paymentIntents);
            $this->customers = new Customers($stripe->customers);
        }
    }

?>
