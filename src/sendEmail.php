/*
 * sends an email containing the datasheet information
 */
<?php
  if(isset($_POST['email-data']) && !empty($_POST['email-data'])) {

    $data = json_decode($_POST["email-data"]);

    $to      = $data->to;
    $subject = 'LCA Dues';
    $message = $data->msg;
    $headers = 'From: LCAtau@mtu.edu' . "\r\n" .
        'Reply-To: LCATau@mtu.edu' . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
  }
?>
