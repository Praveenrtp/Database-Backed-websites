<?php
require __DIR__ . '/../vendor/autoload.php';
require 'initial.php';
// provide aliases for long classname--
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

set_local_error_log(); // redirect error_log to ../php_server_errors.log
// Instantiate the app
$app = new \Slim\App();
// Add middleware that can add CORS headers to response (if uncommented)
// These CORS headers allow any client to use this service (the wildcard star)
// We don't need CORS for the ch05_gs client-server project, because
// its network requests don't come from the browser. Only requests that
// come from the browser need these headers in the response to satisfy
// the browser that all is well. Even in that case, the headers are not
// needed unless the server for the REST requests is different than
// the server for the HTML and JS. When we program in Javascript we do
// send requests from the browser, and then the server may need to
// generate these headers.
// Also specify JSON content-type, and overcome default Allow of GET, PUT
// Note these will be added on failing cases as well as sucessful ones
$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
                    ->withHeader('Access-Control-Allow-Origin', '*')
                    ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                    ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Allow', 'GET, POST, PUT, DELETE');
});
// Turn PHP errors and warnings (div by 0 is a warning!) into exceptions--
// From https://stackoverflow.com/questions/1241728/can-i-try-catch-a-warning
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // error was suppressed with the @-operator--
    // echo 'in error handler...';
    if (0 === error_reporting()) {
        return false;
    }
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Slim has default error handling, but not super useful
// so we'll override those handlers so we can handle errors 
// in this code, and report file and line number.
// This also means we don't set $config['displayErrorDetails'] = true;
// because that just affects the default error handler.
// See https://akrabat.com/overriding-slim-3s-error-handling/
// To see this in action, put a parse error in your code
$container = $app->getContainer();
$container['errorHandler'] = function ($container) {
    return function (Request $request, Response $response, $exception) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        $errorJSON = '{"error":{"text":' . $exception->getMessage() .
                ', "line":' . $exception->getLine() .
                ', "file":' . $exception->getFile() . '}}';
        //     echo 'error JSON = '. $errorJSON;           
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //            ->withHeader('Content-Type', 'text/html')
                        ->write($errorJSON);
    };
};

// This function should not be called because errors are turned into exceptons
// but it still is, on error 'Call to undefined function' for example
$container['phpErrorHandler'] = function ($container) {
    return function (Request $request, Response $response, $error) {
        // retrieve logger from $container here and log the error
        $response->getBody()->rewind();
        echo 'PHP error:  ';
        print_r($error->getMessage());
        $errorJSON = '{"error":{"text":' . $error->getMessage() .
                ', "line":' . $error->getLine() .
                ', "file":' . $error->getFile() . '}}';
        error_log("server error: $errorJSON");
        return $response->withStatus(500)
                        //  ->withHeader('Content-Type', 'text/html)
                        ->write($errorJSON);
    };
};
$app->get('/day', 'getDay');
// TODO add routes and functions for them,using ch05_gs_server code as a guide
$app->post('/day', 'postDay');
$app->get('/toppings/{id}', 'getToppingWithId');
$app->get('/toppings', 'getToppings');
$app->get('/sizes', 'getSizes');
$app->get('/users', 'getUsers');
$app->get('/orders', 'getOrders');
$app->get('/orders/{id}', 'getOrdersWithId');
$app->post('/orders', 'postAnOrder');
$app->put('/orders/{id}', 'putOrderWithId' );

// Take over response to URLs that don't match above rules, to avoid sending
// HTML back in these cases
$app->map(['GET', 'POST', 'PUT', 'DELETE'], '/{routes:.+}', function($req, $res) {
    $uri = $req->getUri();
    $errorJSON = '{"error": "HTTP 404 (URL not found) for URL ' . $uri . '"}';
    return $res->withStatus(404)
                    ->write($errorJSON);
});
$app->run();

// functions without try-catch are depending on overall
// exception handlers set up above, which generate HTTP 500
// Functions that need to generate HTTP 400s (client errors)
// have try-catch
// Function calls that don't throw return HTTP 200
function getDay(Request $request, Response $response) {
    error_log("server getDay");
    $sql = "select current_day FROM pizza_sys_tab";
    $db = getConnection();
    $stmt = $db->query($sql);
    // fetch just column 0 value--
    return $stmt->fetch(PDO::FETCH_COLUMN, 0);
}

function postDay(Request $request, Response $response) {
    error_log("server postDay");
    $db = getConnection();
    initial_db($db);
    return "1";  // new day value
}

function getToppingWithId(Request $request, Response $response, $args){
    error_log('server getToppingWithId');
    $id = $args['id'];
    $db = getConnection();
    $sql = 'select topping from menu_toppings where id = :id';
    $stmt = $db->prepare($sql);
    $stmt->bindValue(":id", $id);
    $stmt ->execute();
    $toppingId = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($toppingId);
}

function getToppings(Request $request, Response $response){
    error_log('server getToppings');
    $db = getConnection();
    $sql = 'select * from menu_toppings';
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $toppings = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($toppings);
}

function getSizes(Request $request, Response $response){
    error_log('server getSizes');
    $db = getConnection();
    $sql = 'select * from menu_sizes';
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $sizes = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($sizes);
}

function getUsers(Request $request, Response $response){
    error_log('server getUsers');
    $db = getConnection();
    $sql = 'select * from shop_users';
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($users);
}

function getOrders(Request $request, Response $response){
    error_log('server getAllOrder');
    $db = getConnection();
    $sql = 'select pizza_orders.id, pizza_orders.user_id, pizza_orders.size, pizza_orders.day, pizza_orders.status, order_topping.topping as toppings from pizza_orders, order_topping where pizza_orders.id = order_topping.order_id';
    $stmt = $db->prepare($sql);
    $stmt ->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($orders as $getorder => $order){
        $toppings = explode('|', $order['toppings']);
        $orders[$getorder]['toppings'] = $toppings;
    }
    return json_encode($orders);
}

function getOrdersWithId(Request $request, Response $response, $args){
    error_log('server getOrdersWithId');
    $id = $args['id'];
    $db = getConnection();
    $sql = 'select pizza_orders.id, pizza_orders.user_id, pizza_orders.size, pizza_orders.day, pizza_orders.status, order_topping.topping as toppings from pizza_orders, order_topping where pizza_orders.id = order_topping.order_id and pizza_orders.id = :id and order_topping.order_id = :id';
    $stmt = $db->prepare($sql);
    $stmt->bindValue(":id", $id);
    $stmt ->execute();
    $order = $stmt->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($order);
}

function postAnOrder(Request $request, Response $response) {
    error_log("server postAnOrder");
    $order = $request->getParsedBody();
    if ($order==NULL){
        return $response->withStatus(400)->write($errorJson);        
    }
    try {
        $db = getConnection();
        $orderId = addOrderToDb($db, $order['user_id'], $order['size'], $order['day'], $order['status'], $order["toppings"]);
    } catch (Exception $exception) {
        throw ($exception);
    }
    $order['orderId'] = $orderId;
    $JSONcontent = json_encode($order);
    $location = $request->getUri().'/'.$order["orderId"];
    return $response->withHeader('Location',$location)->withStatus(200)->write($JSONcontent);
}

function addOrderToDb($db, $user_id, $size, $current_day, $status, $topping_name) {
    error_log("server addOrderToDb");
	$db = getConnection();    
    $sql1 = 'insert into pizza_orders(user_id, size, day, status) values (:user_id, :size, :current_day, :status)';
    $sql2 = 'insert into order_topping(order_id, topping) values (last_insert_id(), :topping)';
    $stmt = $db->prepare($sql1);
    $stmt->bindValue(':user_id', $user_id);
    $stmt->bindValue(':size', $size);
    $stmt->bindValue(':status', $status);
    $stmt->bindValue(':current_day', $current_day);
    $stmt->execute();
    $stmt = $db->prepare($sql2);
    $stmt->bindValue(':topping', implode('|', $topping_name));
    $stmt->execute();
    return $id = $db->lastInsertId();
}

function putOrderWithId(Request $request, Response $response, $args){
    error_log('server putOrderWithId');
    $db = getConnection();
    $orderId = $args['id'];
    $sql = 'update pizza_orders set status="Finished" where id = :orderId and status = "Baked"'  ;
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':orderId', $orderId);
    $stmt->execute();
}

// set up to execute on XAMPP or at pe07.cs.umb.edu:
// --set up a mysql user named pizza_user on your own system
// --see database/dev_setup.sql and database/createdb.sql
// --load your mysql database on pe07 with the pizza db
// Then this code figures out which setup to use at runtime
function getConnection() {
    if (gethostname() === 'pe07') {
        $dbuser = 'praveen';  // CHANGE THIS to your cs.umb.edu username
        $dbpass = 'praveen';  // CHANGE THIS to your mysql DB password on pe07 
        $dbname = $dbuser . 'db'; // our convention for mysql dbs on pe07   
    } else {  // dev machine, can create pizzadb
        $dbuser = 'pizza_user';
        $dbpass = 'pa55word';  // or your choice
        $dbname = 'pizzadb';
    }
    $dsn = 'mysql:host=localhost;dbname=' . $dbname;
    $dbh = new PDO($dsn, $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $dbh;
}
