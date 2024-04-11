<?php

    require_once __DIR__.'/../composer/vendor/autoload.php';


    final class Customers{

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

        function read($id){

            try{ $customer = $this->customers->retrieve( $id , [] ); }
            catch (Exception $e) { $customer = null; }

            return $customer;
        }

        function update($id, $attributes){

            try{ $updated_customer = $this->customers->update($id, $attributes); }
            catch (Exception $e) { throwException(500, '[stripe customers update] '.$e->getError()->message); }

            return $updated_customer;
        }
    }

    final class PaymentIntents{

        private $paymentIntents;

        function __construct($paymentIntents) {

            $this->paymentIntents = $paymentIntents;
        }

        // Amount is with decimal comma (2.71)
        function create($amount, $customer_id = null, $description = null, $metadata = null){

            $parameters = [

              'amount' => round(round($amount, 2)*100),
              'currency' => 'eur'
            ];
            if($customer_id) $parameters['customer'] = $customer_id;
            if($description) $parameters['description'] = $description;
            if($metadata) $parameters['metadata'] = $metadata;


            try{ $new_paymentIntent = $this->paymentIntents->create($parameters); }
            catch (Exception $e) { throwException(500, '[stripe paymentIntents create] '.$e->getError()->message); }

            return $new_paymentIntent;
        }

        function read($id){

            try{ $paymentIntent = $this->paymentIntents->retrieve( $id , [] ); }
            catch (Exception $e) { $paymentIntent = null; }

            return $paymentIntent;
        }

        function update($id, $parameters){

            try{ $updated_paymentIntent = $this->paymentIntents->update($id, $parameters); }
            catch (Exception $e) { throwException(500, '[stripe paymentIntents update] '.$e->getError()->message); }

            return $updated_paymentIntent;
        }
    }


    final class Stripe{

        public $customers,
            $paymentIntents;

		private function connect($live){

            if($live) $stripe = new \Stripe\StripeClient('');
            else $stripe = new \Stripe\StripeClient('');

			return $stripe;
		}

        function __construct($live) {

			$stripe = $this->connect($live);

            $this->paymentIntents = new PaymentIntents($stripe->paymentIntents);
            $this->customers = new Customers($stripe->customers);
        }
    }

?>
