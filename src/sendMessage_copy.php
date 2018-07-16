/*
 * firebase can only handle static content, so this is a copy of what's hosted on
 * colossus.it.mtu.edu /classes/cs4760/www/projects/s18/group2/www/.logan/tau-dues-mgr
 */

<?php

  switch ($_SERVER['HTTP_ORIGIN']) {
    case 'https://taudueslca.firebaseapp.com': case 'http://localhost:8081':
    header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    break;
  }

  if(isset($_POST['email-data']) && !empty($_POST['email-data'])) {

    $data = json_decode($_POST["email-data"]);

    $to      = $data->to;
    $subject = $data->subject;
    $message = $data->msg;
    $headers = 'From: ' . $data->from . "\r\n" .
        'Reply-To: ' . $data->from . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
  }

  if(isset($_POST['text-data']) && !empty($_POST['text-data'])) {
    // Account details
    $data = json_decode($_POST["email-data"]);
        $apiKey = urlencode($data->apiKey);

        // Message details
        $numbers = array($data->phone);
        $sender = urlencode('LCATau');
        $message = rawurlencode($data->msg);

        $numbers = implode(',', $numbers);

        // Prepare data for POST request
        $data = array('apikey' => $apiKey, 'numbers' => $numbers, "sender" => $sender, "message" => $message);

        // Send the POST request with cURL
        $ch = curl_init('https://api.txtlocal.com/send/');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        // Process your response here
        echo $response;
  }
?>
