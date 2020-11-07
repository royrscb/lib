<?php

    abstract class ModelCRUD{

        protected $conn;

        // build sqls -------------------
        private function parseUnknownDataElementToSql($data){

            if(is_bool($data) || is_numeric($data)) return $data;
            else if(is_string($data) && $data != '') return "'".addSlashesToString($data)."'";
            else if(is_array($data)) return json_stringify($data);
            else return 'NULL';
        }

        protected function buildInsertSql($tableName, $fields, $data){

            $insertFields = [];
            $insertValues = [];

            foreach($fields as $field){

                if(array_key_exists($field, $data)){

                    array_push($insertFields, $field);
                    array_push($insertValues, $this->parseUnknownDataElementToSql($data[$field]));
                }
            }

            $sql = "INSERT INTO $tableName (".implode(', ', $insertFields).") VALUES (".implode(', ', $insertValues).")";

            return $sql;
        }
        protected function buildUpdateSql($tableName, $fields, $data, $id){

            $fieldValues = [];

            foreach($fields as $field){

                if(array_key_exists($field, $data)){

                    array_push($fieldValues, $field.'='.$this->parseUnknownDataElementToSql($data[$field]));
                }
            }

            $sql = "UPDATE $tableName SET ".implode(', ', $fieldValues)." WHERE id=".$id;

            return $sql;
        }

        // constructor --------------------
        public function __construct($conn){

            $this->conn = $conn;
        }

        // help functions
        protected function createWithFields($data, $fields){

            $sql = $this->buildInsertSql(strtolower(get_class($this)), $fields, $data);

            if($this->conn->query($sql) === TRUE) return $this->read($this->conn->insert_id);
            else throwException(500, 'INSERT '.get_class($this).': '.$this->conn->error.' ('.$sql.')');
        }
        protected function updateWithFields($id, $data, $fields){

            $sql = $this->buildUpdateSql(strtolower(get_class($this)), $fields, $data, $id);

            if($this->conn->query($sql) === TRUE) return $this->read($id);
            else throwException(500, 'UPDATE '.get_class($this).': '.$this->conn->error.' ('.$sql.')');
        }


        // child functions ----------------
        public abstract function create($data);
        public abstract function read($id);
        public abstract function update($id, $data);
        public function delete($id){

			if(!is_integer($id)) throwException(400, 'id ('.$id.') is not an integer');

            $sql = 'DELETE FROM '.strtolower(get_class($this)).' WHERE id='.$id;

            if($this->conn->query($sql) === TRUE) return true;
            else throwException(500, 'DELETE '.get_class($this).': '.$this->conn->error.' ('.$sql.')');
        }
    }



    class User extends ModelCRUD{

        function exists($email){

            $sql = "SELECT id FROM user WHERE email='$email'";
            $result = $this->conn->query($sql);

            if($result->num_rows == 1) return true;
            else return false;
        }

        function login($email = null, $password = null){

            $sql = "SELECT id, hashword FROM user WHERE email='$email'";
            $result = $this->conn->query($sql);

            if($result->num_rows == 1){

                $user = $result->fetch_assoc();

                if($user && password_verify($password, $user['hashword'])) return $this->read($user['id']);
                else return null;
            }
            else return null;
        }



        function create($data){

			if(isset($data['password'])) $data['hashword'] = password_hash($data['password'], PASSWORD_DEFAULT);

            $fields = ['email', 'hashword', 'phone'];
            return parent::createWithFields($data, $fields);
        }

        function read($id = null){

            $sql = 'SELECT * FROM user';
            if(!is_null($id)) $sql .= ' WHERE id='.$id;
            $result = $this->conn->query($sql);

            $user_array = [];
            while($user = $result->fetch_assoc()){

                unset($user['hashword']);

				if(isset($user['address'])) $user['address'] = json_decode($user['address'], true);
				$user['data'] = isset($user['data']) ? json_decode($user['data'], true) : new stdClass();

                array_push($user_array, $user);
            }

            if(isset($id)){

                if(empty($user_array)) return null;
                else return $user_array[0];
            }
            else return $user_array;
        }

        function update($id, $data){

            $fields = ['email', 'phone', 'address', 'data'];
            return parent::updateWithFields($id, $data, $fields);
        }
    }

    class Image extends ModelCRUD{

        function create($data){

            $fields = ['id_product', 'display_order', 'name'];
            return parent::createWithFields($data, $fields);
        }

        function read($id = null, $id_from_product = false){

            if(isset($id)){

                if($id_from_product) $sql = 'SELECT * FROM image WHERE id_product='.$id;
                else $sql = 'SELECT * FROM image WHERE id='.$id;

            }else $sql = 'SELECT * FROM image';

            $result = $this->conn->query($sql);

            $image_array = [];
            while($i = $result->fetch_assoc()){

				$i['data'] = isset($i['data']) ? json_decode($i['data']) : new stdClass();

				array_push($image_array, $i);
			}

            if(isset($id) && !$id_from_product){

                if(empty($image_array)) return null;
                else return $image_array[0];
            }
            else return $image_array;
        }

        function update($id, $data){

            $fields = ['display_order', 'data'];
            return parent::updateWithFields($id, $data, $fields);
        }
    }

    class Product_variant extends ModelCRUD{

        function create($data){

            $fields = ['id_product', 'tag', 'name', 'value', 'price', 'stock'];
            return parent::createWithFields($data, $fields);
        }

        function read($id = null, $id_from_product = false){

            if(isset($id)){

                if($id_from_product) $sql = 'SELECT * FROM product_variant WHERE id_product='.$id;
                else $sql = 'SELECT * FROM product_variant WHERE id='.$id;

            }else $sql = 'SELECT * FROM product_variant';

            $result = $this->conn->query($sql);

            $product_variant_array = [];
            while($pv = $result->fetch_assoc()){

				$pv['data'] = isset($pv['data']) ? json_decode($pv['data'], true) : new stdClass();

				array_push($product_variant_array, $pv);
			}

            if(isset($id) && !$id_from_product){

                if(empty($product_variant_array)) return null;
                else return $product_variant_array[0];
            }
            else return $product_variant_array;
        }

        function update($id, $data){

            $fields = ['tag', 'name', 'value', 'price', 'stock', 'data'];
            return parent::updateWithFields($id, $data, $fields);
        }
    }

    class Product extends ModelCRUD{

        private $product_variant, $image;

        function __construct($conn) {

            $this->conn = $conn;

            $this->product_variant = new Product_variant($this->conn);
            $this->image = new Image($this->conn);
        }


        function create($data){

            $insertFields = ['id_section', 'tag', 'name', 'description', 'data'];
            $sql = $this->buildInsertSql('product', $insertFields, $data);

            if($this->conn->query($sql) === TRUE){

                $id_product = $this->conn->insert_id;

                foreach($data['variants'] as $variant){

                    $variant['id_product'] = $id_product;
                    $this->product_variant->create($variant);
                }
                if(isset($data['images'])) foreach($data['images'] as $image){

                    $image['id_product'] = $id_product;
                    $this->image->create($image);
                }

                return $this->read($id_product);
            }
            else throwException(500, 'INSERT product: '.$this->conn->error.' ('.$sql.')');
        }

        function read($id = null, $id_from_section = false){

            if(isset($id)){

                if($id_from_section) $sql = 'SELECT * FROM product WHERE id_section='.$id;
                else $sql = 'SELECT * FROM product WHERE id='.$id;

            }else $sql = 'SELECT * FROM product';

            $result = $this->conn->query($sql);

            $product_array = [];
            while($product = $result->fetch_assoc()){

                $product['data'] = isset($product['data']) ? json_decode($product['data'], true) : new stdClass();

                $product['images'] = $this->image->read($product['id'], true);
                $product['variants'] = $this->product_variant->read($product['id'], true);

                array_push($product_array, $product);
            }

            if(isset($id) && !$id_from_section){

                if(empty($product_array)) return null;
                else return $product_array[0];
            }
            else return $product_array;
        }

        function update_variants($old_variants, $new_variants){

            foreach($new_variants as $variant){

                if(isset($variant['id'])) $this->product_variant->update($variant['id'], $variant);
                else $this->product_variant->create($variant);
            }

			$new_variants_ids = array_map(function($p){ return isset($p['id']) ? $p['id'] : null; }, $new_variants);
			foreach($old_variants as $variant){

				if(!in_array($variant['id'], $new_variants_ids)) $this->product_variant->delete($variant['id']);
			}
        }
        function update_images($old_images, $new_images){

            foreach($new_images as $image){

                if(isset($image['id'])) $this->image->update($image['id'], $image);
                else $this->image->create($image);
            }

			$new_images_ids = array_map(function($p){ return isset($p['id']) ? $p['id'] : null; }, $new_images);
			foreach($old_images as $image){

				if(!in_array($image['id'], $new_images_ids)) $this->image->delete($image['id']);
			}
        }
        function update($id, $data){

            if(isset($data['variants'])) $this->update_variants($this->read($id)['variants'], $data['variants']);
            if(isset($data['images'])) $this->update_images($this->read($id)['images'], (empty($data['images']) ? [] : $data['images']));

            $updateFields = ['id_section', 'tag', 'name', 'description', 'visible', 'data'];
            return parent::updateWithFields($id, $data, $updateFields);
        }
    }

    class Section extends ModelCRUD{

        private $product;

        function __construct($conn) {

            $this->conn = $conn;

            $this->product = new Product($this->conn);
        }


        function create($data){

            $data['display_order'] = $this->conn->query('SELECT MAX(display_order) FROM section')->fetch_row()[0] +1;
            $data['name'] = 'Nueva sección';

            $fields = ['display_order', 'name'];

            return parent::createWithFields($data, $fields);
        }

        function read($id = null){

            $sql = 'SELECT * FROM section';
            if(!is_null($id)) $sql .= ' WHERE id='.$id;
            $result = $this->conn->query($sql);

            $section_array = [];
            while($section = $result->fetch_assoc()){

				$section['data'] = isset($section['data']) ? json_decode($section['data'], true) : new stdClass();

                $section['products'] = $this->product->read($section['id'], true);

                array_push($section_array, $section);
            }

            if(isset($id)){

                if(empty($section_array)) return null;
                else return $section_array[0];
            }
            else return $section_array;
        }

        function update($id, $data){

            $fields = ['display_order', 'name', 'image', 'visible', 'products_order', 'data'];

            return parent::updateWithFields($id, $data, $fields);
        }
    }

    class Sale extends ModelCRUD{

        function create($data){

            $fields = ['id_user', 'tag', 'state', 'price', 'delivery_price', 'address', 'phone', 'comment', 'id_transaction'];
            return parent::createWithFields($data, $fields);
        }

        function read($id_or_tag = null, $id_from_user = false){

            if(isset($id_or_tag)){

                if($id_from_user) $sql = 'SELECT * FROM sale WHERE id_user='.$id_or_tag;
                else if(is_integer($id_or_tag)) $sql = 'SELECT * FROM sale WHERE id='.$id_or_tag;
				else if(is_string($id_or_tag)) $sql = "SELECT * FROM sale WHERE tag='$id_or_tag'";

            }else $sql = 'SELECT * FROM sale';

            $result = $this->conn->query($sql);

            $sale_array = [];
            while($sale = $result->fetch_assoc()){

                array_push($sale_array, $sale);
            }

            if(isset($id_or_tag) && !$id_from_user){

                if(empty($sale_array)) return null;
                else return $sale_array[0];
            }
            else return $sale_array;
        }

        function update($id, $data){

            $fields = ['state'];
            return parent::updateWithFields($id, $data, $fields);
        }
    }



    class Database{

        private $conn;

        public $user, $image, $product, $section, $sale;


		private function connect(){

			if($_SERVER['HTTP_HOST'] == 'localhost'){

				$servername = "localhost";
				$username = "xxx";
				$password = "xxx";
				$dbname = "xxx";
			}
			else{

				$servername = "localhost";
				$username = "xxx";
				$password = "xxx";
				$dbname = "xxx";
			}

			// Create connection
			$conn = new mysqli($servername, $username, $password, $dbname);
			$conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, TRUE);
			if($_SERVER['HTTP_HOST'] == 'localhost') mysqli_set_charset($conn, "utf8");

			// Check connection
			if ($conn->connect_error) throwException(500, 'Database connection error: '.$conn->connect_error);

			return $conn;
		}


        function __construct() {

            $this->conn = $this->connect();

            $this->user = new User($this->conn);
            $this->image = new Image($this->conn);
            $this->product = new Product($this->conn);
            $this->section = new Section($this->conn);
            $this->sale = new Sale($this->conn);
        }

        function __destruct(){

            $this->conn->close();
        }
    }

?>
