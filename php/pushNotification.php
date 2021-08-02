<?php

	require_once __DIR__.'/../composer/vendor/autoload.php';
	use Minishlink\WebPush\WebPush;
	use Minishlink\WebPush\Subscription;


	final class PushNotification{

		private function connect($ttl){

			$auth = [

				'VAPID' => [

					'subject' => 'xxx',
					'publicKey' => 'xxx',
					'privateKey' => 'xxx'
				]
			];
			$defaultOptions = ['TTL' => $ttl];

			return new WebPush($auth, $defaultOptions);
		}

		private function handleReport($report){

			if($report->isSuccess()) return true;
			else if($report->isSubscriptionExpired()) return false;
			else return [

				'error' => true,
				'code' => $report->getResponse()->getStatusCode(),
				'reason' => $report->getReason()
			];
		}

        function __construct($ttl = 86400) {

			$this->webPush = $this->connect($ttl ?: 86400);
        }

		function send($notification, $subscription){

			if(is_array($notification)) $notification = json_encode($notification);
			$report = $this->webPush->sendOneNotification(Subscription::create($subscription), $notification);

			return $this->handleReport($report);
		}

		function sendMultiple(array $notis_subs){

			foreach($notis_subs as $ns){

				if(is_array($ns['notification'])) $ns['notification'] = json_encode($ns['notification']);
				$this->webPush->queueNotification(Subscription::create($ns['subscription']), $ns['notification']);
			}

			$errors = [];
			foreach($this->webPush->flush() as $report) array_push($errors, $this->handleReport($report));

			return array_find(function($err){ return isset($err['error']) || $err === false; }, $errors) ? $errors : true;
		}
		function sendMultipleEqual($notification, array $subscriptions){

			$notis_subs = [];
			foreach($subscriptions as $sub) array_push($notis_subs, ['subscription' => $sub, 'notification' => $notification]);

			return $this->sendMultiple($notis_subs);
		}
    }

?>
