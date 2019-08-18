<?php 

if ( getallheaders()["X-Pragma-Header"] == "Some-header-value") {
  if (isset($_SERVER['REMOTE_ADDR'])) { echo $_SERVER['REMOTE_ADDR']; }
}
else {echo "Empty";}

?>