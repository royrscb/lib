<?php

    require_once __DIR__.'/../lib/la.php';
	require_once __DIR__.'/../lib/stripe_la.php';
	require_once __DIR__.'/../lib/auth.php';
    require_once __DIR__.'/../lib/database.php';

	const LIVE = true;

	// Var and checks ---
	$paymentData = $_POST['payment_data'];

	if(parse_bool($paymentData['live']) != LIVE) throwException(409, 'JS Stripe is ['.(parse_bool($paymentData['live']) ? 'LIVE' : 'TEST').'] and PHP Stripe is ['.(LIVE ? 'LIVE' : 'TEST').']');

	// Create Stripe object ---
	$stripe = new Stripe(LIVE);

	// Create new customer if customer id is set
	if(isset($paymentData['customer_id'])){

		$customer = $stripe->customers->read($paymentData['customer_id']);

		if(isset($customer) && $customer['deleted']) throwException(404, 'Customer '.$customer['id'].' is deleted');
		if(!isset($customer)) send_telegram('crea nou');
		// Create new customer
		if(!isset($customer)) $customer = $stripe->customers->create(
			$paymentData['customer_id'],
			$paymentData['customer_email'] ?? null,
			$paymentData['customer_name'] ?? null,
			$paymentData['customer_description'] ?? null
		);
	}

	// Create payment intent ---
    $paymentIntent = $stripe->paymentIntents->create(
		$paymentData['amount'],
		$paymentData['customer_id'] ?? null,
		$paymentData['description'] ?? null,
		$paymentData['metadata'] ?? null
	);
	
	// Return client secret
    echo $paymentIntent['client_secret'];

?>
