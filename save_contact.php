<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize the input data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);
    
    // Example of processing or saving the data
    // For demonstration purposes, we'll just echo the data
    echo "Name: $name<br>";
    echo "Email: $email<br>";
    echo "Message: $message<br>";
    
    // In a real application, you might save this data to a database or send an email
} else {
    // If not POST request, show an error
    echo "Invalid request method.";
}
?>
