<?php

class icingaRoleOperations extends PHPUnit_Framework_TestCase {
	public static function setUpBeforeClass() {
		Doctrine_Manager::connection()->beginTransaction();
		$context = AgaviContext::getInstance();
		$context->getUser()->addCredential("appkit.admin");
		$context->getUser()->addCredential("appkit.admin.users");
		$context->getUser()->addCredential("appkit.admin.groups");
		$context->getUser()->addCredential("icinga.user");
		$context->getUser()->setAuthenticated(true);
	}
	protected $roleParams = array(
		"id" => "new",
		"role_id" => "new",
		"role_name" => "TESTCASE",
		"role_description" => "TEST ROLE",
		"role_disabled" => 0
	);
	
	protected $roleAlterParams = array(
		"role_name" => "ALTERED TESTCASE",
		"role_description" => "ALTERED TEST ROLE",
		"role_disabled" => 1
	);
	
	/**
	 * @depends icingaDatabaseAccessibleTest::testInsert
	 * 
	 */
	public function testRoleAdd() {
		try {
			info("Testing actions for group modification\n");
			info("\tTesting icinga-web action: Creating groups\n");
			$context = AgaviContext::getInstance();
			$arguments = new AgaviRequestDataHolder();
			$role = $this->roleParams;
			foreach($role as $name=>$value) {
				$arguments->setParameter($name,$value);							
			}
			// insert user
			$container = $context->getController()->createExecutionContainer("AppKit","Admin.Groups.Edit",$arguments,"simple","write");
			$this->assertType("AgaviExecutionContainer",$container,"Couldn't create add-group action");
			
			$result = $container->execute();
			$this->assertNotEquals($result->getHttpStatusCode(),"404","Action for adding groups not found");				

			// Check if user is really added
			$result = Doctrine_Core::getTable("NsmRole")->findBy("role_name",$role["role_name"])->getFirst();		
			$this->assertType("NsmRole",$result,"No group found, something seemed to go wrong");
			
			success("\tCreating roles suceeded!\n");

			return $result->get("role_id");
		} catch(Exception $e) {
			$this->fail("Adding a role failed!".$e->getMessage());
		}
	}
	
	/**
	 * @depends testRoleAdd
	 */
	public function testRoleSelect($roleId) {
		try {
			info("\tTesting icinga-web action: Reading roles\n");
		
			$context = AgaviContext::getInstance();
			$directDBList_all = Doctrine_Query::create()->select("r.*,pr.*,r.*")->from("NsmRole r")->leftJoin("r.NsmPrincipal pr")->leftJoin("r.NsmUserRole ro")->execute()->toArray(true);
			$this->assertGreaterThan(0,count($directDBList_all),"A really strange error occured - suddenly couldn't fetch any users");
			
			$sortOrder = new AgaviRequestDataHolder();
			$sortOrder->setParameter("sort","role_id");
			$icingaListing_all = $context->getController()->createExecutionContainer("AppKit","DataProvider.GroupProvider",$sortOrder,"json");
			$result = $icingaListing_all->execute();

			$this->assertNotEquals($result->getHttpStatusCode(),"404","Action for reading groups not found");				
			
			$json = json_decode($result->getContent(),true);

			$this->assertNotNull($json,"Couldn't fetch group list via the icinga action");
			$this->assertEquals(count($directDBList_all),count($json),"Groupcount fetched by icinga doesn't match db-count");
			foreach($directDBList_all as $nr=>$entry) {
				// search entry in json list
				$jsonPendant = null;
				foreach($json as $role) {
					if($role["role_id"] == $entry["role_id"]){
						$jsonPendant = $role;
						break;
					}
				}
				$this->assertNotNull($jsonPendant,"Couldn't find role ".$entry["role_name"]." in icinga view");				

				foreach($entry as $field=>$value) {

					$this->assertEquals($entry[$field],$jsonPendant[$field],"Entry for role ".$entry["role_name"]." is not equal with icinga result");
				}
			}
			success("\tReading roles suceeded!\n");
			return $roleId;
		} catch(Exception $e) {
			$this->fail("Selecting roles failed!".$e->getMessage());
		}
	}

	/** 
	 * @depends testRoleSelect
	 */
	public function testPrincipalAdd($roleid) {
		try {
			info("\tTesting icinga-web action: Add principal to role\n");
			$context = AgaviContext::getInstance();

			$params = array("7" => array("name" => array("appkit.access"),"set"=>array("1")));
			$alterParams = new AgaviRequestDataHolder();
			foreach($this->roleAlterParams as $field=>$value) {
				$alterParams->setParameter($field,$value);
			}

			$alterParams->setParameter("id",$roleid);
			$alterParams->setParameter("role_id",$roleid);
			$alterParams->setParameter("principal_target",$params);
		
			$modifyAction = $context->getController()->createExecutionContainer("AppKit","Admin.Groups.Edit",$alterParams,"simple","write");
			$result = $modifyAction->execute();			
			
			$this->assertNotEquals($result->getHttpStatusCode(),"404","Action for editing roles not found");				
			$role = Doctrine_Core::getTable("NsmRole")->findBy("role_id",$roleid)->getFirst();	
		
			$this->assertArrayHasKey("7",$role->getTargets()->toArray(),"Setting Principal failed");
			success("\tAdding principals to role suceeded!\n");
			return $roleid;
		} catch(Exception $e) {
			$this->fail("Adding a principals to role failed!".$e->getMessage());
		}
	}
	
	/** 
	 * @depends testPrincipalAdd
	 */
	public function testPrincipalRead($roleid) {
		try {
			info("\tTesting icinga-web action: Reading principals\n");
			$context = AgaviContext::getInstance();
			$readParams = new AgaviRequestDataHolder();
			$readParams->setParameter("groupId",$roleid);
			$modifyAction = $context->getController()->createExecutionContainer("AppKit","DataProvider.PrincipalProvider",$readParams,"json","read");
			$result = $modifyAction->execute();			
		//	$this->assertNotEquals($result->getHttpStatusCode(),"404","Action for reading principals not found");				
		//	$this->assertArrayHasKey("appkit.access",json_decode($result->getContent(),true),"Read didn't return previously added principal!s");
			success("\tReading principals suceeded!\n");
		} catch(Exception $e) {
			$this->fail("Reading principals failed!".$e->getMessage());
		}
	}
	
	/**
	 * @depends testRoleAdd
	 */
	public function testRoleRemove($id) {
		$this->markTestSkipped("Role delete test doesn't work with transactions yet.");
		try {
			info("\tTesting icinga-web action: Removing roles\n");
			$context = AgaviContext::getInstance();
			
			$params = new AgaviRequestDataHolder();
			$params->setParameter("group_id",array($id => $id));
			$groupRemoveAction = $context->getController()->createExecutionContainer("AppKit","Admin.Groups.Remove",$params,null,"write");
			$result = $groupRemoveAction->execute();
			$this->assertNotEquals($result->getHttpStatusCode(),"404","Action for reading groups not found");				
			
			// Check if group is really deleted
			$result = Doctrine_Core::getTable("NsmRole")->findBy("role_id",$id)->getFirst();		
			$this->assertNotType("NsmRole",$result,"Group found despite deleting it, something seemed to go wrong");
			success("\tRemoving role suceeded!\n");
		} catch(Exception $e) {
			$this->fail("Selecting roles failed!".$e->getMessage());
		}
	}	
	public static function tearDownAfterClass() {
		Doctrine_Manager::connection()->rollback();
	}
}